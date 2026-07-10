import { router, usePage } from '@inertiajs/react';
import { Camera, Loader2, Trash2, UploadCloud } from 'lucide-react';
import * as React from 'react';
import Cropper, { Area } from 'react-easy-crop';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { getCroppedImg } from '@/lib/crop-image';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvatarUploadZoneProps {
    /** Override the upload route URL; defaults to '/settings/profile/avatar' */
    uploadRoute?: string;
    /** Override the delete route URL; defaults to '/settings/profile/avatar' */
    deleteRoute?: string;
    /** Extra CSS classes on the root wrapper */
    className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

// ─── Helper ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AvatarUploadZone
 *
 * Displays the current user avatar in a circular frame with an overlay
 * action button. Supports click-to-pick and drag-and-drop. Submits via
 * Inertia's `router.post` (multipart/form-data) so the CSRF token is
 * handled automatically — no manual fetch required.
 *
 * State machine:
 *   idle → (file chosen) → previewing → (form submitted) → uploading → idle
 */
export default function AvatarUploadZone({
    uploadRoute = '/settings/profile/avatar',
    deleteRoute = '/settings/profile/avatar',
    className,
}: AvatarUploadZoneProps) {
    // ── Inertia shared state ─────────────────────────────────────────────────
    const {
        auth: { user },
    } = usePage<{ auth: Auth }>().props;

    // ── Local state ──────────────────────────────────────────────────────────
    const [preview, setPreview] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // ── Cropper local state ──────────────────────────────────────────────────
    const [originalImage, setOriginalImage] = React.useState<string | null>(
        null,
    );
    const [originalFile, setOriginalFile] = React.useState<File | null>(null);
    const [crop, setCrop] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] =
        React.useState<Area | null>(null);
    const [isCropOpen, setIsCropOpen] = React.useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // ── Derived values ───────────────────────────────────────────────────────
    const displaySrc = preview ?? user.avatar_url;
    const hasAvatar =
        Boolean(preview) ||
        (user.avatar_url && !user.avatar_url.includes('default-avatar'));
    const isLoading = uploading || deleting;

    // ── Cleanup object URLs on unmount ───────────────────────────────────────
    React.useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
            if (originalImage) URL.revokeObjectURL(originalImage);
        };
    }, [preview, originalImage]);

    // ── Validation ───────────────────────────────────────────────────────────
    function validateFile(file: File): string | null {
        if (
            !ACCEPTED_MIME_TYPES.includes(
                file.type as (typeof ACCEPTED_MIME_TYPES)[number],
            )
        ) {
            return 'Only JPEG, PNG, and WebP images are accepted.';
        }
        if (file.size > MAX_FILE_BYTES) {
            return 'File must be smaller than 5 MB.';
        }
        return null;
    }

    // ── Upload / Crop handler ────────────────────────────────────────────────
    function handleFile(file: File) {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);

        setOriginalFile(file);
        const fileUrl = URL.createObjectURL(file);
        setOriginalImage(fileUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsCropOpen(true);
    }

    const cleanupCropStates = () => {
        if (originalImage) {
            URL.revokeObjectURL(originalImage);
        }
        setOriginalImage(null);
        setOriginalFile(null);
        setCroppedAreaPixels(null);
    };

    const handleCropCancel = () => {
        setIsCropOpen(false);
        cleanupCropStates();
    };

    const handleCropSave = async () => {
        if (!originalImage || !croppedAreaPixels) return;

        try {
            setUploading(true);
            setIsCropOpen(false);

            const croppedBlob = await getCroppedImg(
                originalImage,
                croppedAreaPixels,
            );
            if (!croppedBlob) {
                setError('Could not crop image.');
                setUploading(false);
                cleanupCropStates();
                return;
            }

            // Create a local object URL for the optimistic UI preview
            if (preview) URL.revokeObjectURL(preview);
            setPreview(URL.createObjectURL(croppedBlob));

            const formData = new FormData();
            const extension = originalFile?.name.split('.').pop() || 'jpg';
            const fileToUpload = new File(
                [croppedBlob],
                `avatar.${extension}`,
                {
                    type: croppedBlob.type,
                },
            );
            formData.append('avatar', fileToUpload);

            router.post(uploadRoute, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setPreview(null);
                    cleanupCropStates();
                },
                onError: (errors) => {
                    setError(
                        errors.avatar ?? 'Upload failed. Please try again.',
                    );
                    setPreview(null);
                    cleanupCropStates();
                },
                onFinish: () => setUploading(false),
            });
        } catch (err) {
            setError('An error occurred during cropping.');
            setUploading(false);
            cleanupCropStates();
        }
    };

    // ── Delete handler ───────────────────────────────────────────────────────
    function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        if (!hasAvatar || isLoading) return;

        setDeleting(true);
        router.delete(deleteRoute, {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
        });
    }

    // ── Drag-and-drop ────────────────────────────────────────────────────────
    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave() {
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }

    // ── Input change ─────────────────────────────────────────────────────────
    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        // Reset so the same file can be re-selected
        e.target.value = '';
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* Hidden native file input */}
            <input
                id="avatar-file-input"
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_MIME_TYPES.join(',')}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
                onChange={handleInputChange}
            />

            {/* ── Avatar ring + drag-drop zone ── */}
            <div
                role="button"
                aria-label="Upload avatar — click or drag and drop an image"
                tabIndex={0}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
                        fileInputRef.current?.click();
                    }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'group relative cursor-pointer rounded-full outline-none',
                    'ring-2 ring-offset-2 ring-offset-background transition-all duration-200',
                    isDragging
                        ? 'scale-105 ring-primary'
                        : 'ring-transparent hover:ring-primary/60',
                    isLoading && 'pointer-events-none opacity-60',
                )}
            >
                {/* Avatar circle */}
                <Avatar className="size-24">
                    <AvatarImage
                        src={displaySrc}
                        alt={`${user.name}'s avatar`}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-xl font-semibold text-white">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>

                {/* Loading spinner overlay */}
                {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                        <Loader2
                            className="size-6 animate-spin text-white"
                            aria-hidden="true"
                        />
                    </span>
                )}

                {/* Camera icon overlay — shown on hover when idle */}
                {!isLoading && (
                    <span
                        aria-hidden="true"
                        className={cn(
                            'absolute inset-0 flex flex-col items-center justify-center rounded-full',
                            'gap-1 bg-black/50 text-[10px] font-medium text-white backdrop-blur-sm',
                            'opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                        )}
                    >
                        <Camera className="size-5" />
                        <span>Change</span>
                    </span>
                )}

                {/* Drag-active ring pulse */}
                {isDragging && (
                    <span className="absolute inset-0 animate-pulse rounded-full border-2 border-dashed border-primary" />
                )}
            </div>

            {/* ── Action strip ── */}
            <div className="flex items-center gap-2">
                <Button
                    id="avatar-upload-btn"
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5"
                >
                    <UploadCloud className="size-4" aria-hidden="true" />
                    {uploading ? 'Uploading…' : 'Upload photo'}
                </Button>

                {hasAvatar && (
                    <Button
                        id="avatar-delete-btn"
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={handleDelete}
                        className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="size-4" aria-hidden="true" />
                        {deleting ? 'Removing…' : 'Remove'}
                    </Button>
                )}
            </div>

            {/* ── File constraints hint ── */}
            <p className="text-center text-xs text-muted-foreground">
                JPEG, PNG or WebP · max 5 MB
            </p>

            {/* ── Validation / server error ── */}
            {error && (
                <p
                    role="alert"
                    className="max-w-[200px] text-center text-xs font-medium text-destructive"
                >
                    {error}
                </p>
            )}

            {/* ── Crop Modal ── */}
            <Dialog
                open={isCropOpen}
                onOpenChange={(open) => {
                    if (!open) handleCropCancel();
                }}
            >
                <DialogContent className="max-w-full sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crop Profile Image</DialogTitle>
                    </DialogHeader>
                    <div className="relative my-4 h-72 w-full overflow-hidden rounded-md border bg-neutral-950">
                        {originalImage && (
                            <Cropper
                                image={originalImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, croppedPixels) => {
                                    setCroppedAreaPixels(croppedPixels);
                                }}
                            />
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="zoom-slider"
                            className="text-xs font-medium text-muted-foreground"
                        >
                            Zoom
                        </label>
                        <input
                            id="zoom-slider"
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-label="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-primary dark:bg-neutral-800"
                        />
                    </div>
                    <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCropCancel}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleCropSave}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Save & Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
