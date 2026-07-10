import { Form, router, usePage } from '@inertiajs/react';
import {
    Save,
    CheckCircle,
    UploadCloud,
    Trash2,
    Loader2,
    Sparkles,
} from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import BrandingController from '@/actions/App/Http/Controllers/Admin/BrandingController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BrandingSettingsForm() {
    const { branding } = usePage().props as any;

    // Local previews for optimistic UI updates
    const [systemLogoPreview, setSystemLogoPreview] = useState<string | null>(
        branding?.system_logo || null,
    );
    const [tabLogoPreview, setTabLogoPreview] = useState<string | null>(
        branding?.tab_logo || null,
    );

    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const [isDraggingFavicon, setIsDraggingFavicon] = useState(false);
    const [deletingType, setDeletingType] = useState<string | null>(null);

    const systemLogoInputRef = useRef<HTMLInputElement>(null);
    const tabLogoInputRef = useRef<HTMLInputElement>(null);

    // Sync previews when branding values from backend change
    useEffect(() => {
        setSystemLogoPreview(branding?.system_logo || null);
        setTabLogoPreview(branding?.tab_logo || null);
    }, [branding]);

    // Revert/delete custom logo or favicon
    const handleDeleteMedia = (type: 'system_logo' | 'tab_logo') => {
        setDeletingType(type);
        router.delete(BrandingController.destroy.url({ type }), {
            preserveScroll: true,
            onSuccess: () => {
                if (type === 'system_logo') {
                    setSystemLogoPreview(null);
                } else {
                    setTabLogoPreview(null);
                }
            },
            onFinish: () => setDeletingType(null),
        });
    };

    // Helper to generate preview when file is selected
    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'system_logo' | 'tab_logo',
    ) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            if (type === 'system_logo') {
                setSystemLogoPreview(objectUrl);
            } else {
                setTabLogoPreview(objectUrl);
            }
        }
    };

    // Drag-and-drop helpers
    const handleDragOver = (e: React.DragEvent, type: 'logo' | 'favicon') => {
        e.preventDefault();
        if (type === 'logo') setIsDraggingLogo(true);
        if (type === 'favicon') setIsDraggingFavicon(true);
    };

    const handleDragLeave = (type: 'logo' | 'favicon') => {
        if (type === 'logo') setIsDraggingLogo(false);
        if (type === 'favicon') setIsDraggingFavicon(false);
    };

    const handleDrop = (
        e: React.DragEvent,
        type: 'system_logo' | 'tab_logo',
    ) => {
        e.preventDefault();
        const dropType = type === 'system_logo' ? 'logo' : 'favicon';
        handleDragLeave(dropType);

        const file = e.dataTransfer.files?.[0] || null;
        if (file) {
            const inputRef =
                type === 'system_logo' ? systemLogoInputRef : tabLogoInputRef;
            if (inputRef.current) {
                // Create a DataTransfer object to assign the file to the input element
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                inputRef.current.files = dataTransfer.files;

                // Trigger change manually to update preview
                const changeEvent = new Event('change', { bubbles: true });
                inputRef.current.dispatchEvent(changeEvent);
            }
        }
    };

    return (
        <Card className="border border-border/40 bg-card/60 shadow-sm backdrop-blur-md">
            <CardHeader className="border-b border-border/30 bg-muted/10">
                <CardTitle className="text-md flex items-center gap-2 font-bold">
                    <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />{' '}
                    Branding & Customization
                </CardTitle>
                <CardDescription className="text-xs">
                    Update the application branding settings, including logos
                    and tab favicon.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Form
                    {...BrandingController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    onSuccess={() => {
                        // Reset file inputs
                        if (systemLogoInputRef.current)
                            systemLogoInputRef.current.value = '';
                        if (tabLogoInputRef.current)
                            tabLogoInputRef.current.value = '';
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors, recentlySuccessful }) => (
                        <>
                            {/* App Name Input */}
                            <div className="max-w-md space-y-2">
                                <Label
                                    htmlFor="app_name"
                                    className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                >
                                    System / App Name
                                </Label>
                                <Input
                                    id="app_name"
                                    name="app_name"
                                    type="text"
                                    defaultValue={
                                        branding?.app_name ||
                                        'Laravel Starter Kit'
                                    }
                                    className="h-10 rounded-lg border-border/80 bg-card"
                                    placeholder="Laravel Starter Kit"
                                    required
                                />
                                {errors.app_name && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {errors.app_name}
                                    </p>
                                )}
                            </div>

                            {/* Logo & Favicon uploads row */}
                            <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
                                {/* System Logo Dropzone */}
                                <div className="space-y-3">
                                    <Label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        System Logo
                                    </Label>
                                    <input
                                        type="file"
                                        name="system_logo"
                                        ref={systemLogoInputRef}
                                        onChange={(e) =>
                                            handleFileChange(e, 'system_logo')
                                        }
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        className="hidden"
                                    />

                                    <div
                                        onDragOver={(e) =>
                                            handleDragOver(e, 'logo')
                                        }
                                        onDragLeave={() =>
                                            handleDragLeave('logo')
                                        }
                                        onDrop={(e) =>
                                            handleDrop(e, 'system_logo')
                                        }
                                        onClick={() =>
                                            systemLogoInputRef.current?.click()
                                        }
                                        className={`group relative flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                                            isDraggingLogo
                                                ? 'scale-[1.02] border-indigo-500 bg-indigo-50/5'
                                                : 'border-border/60 hover:border-indigo-500/60 hover:bg-neutral-50/5'
                                        }`}
                                    >
                                        {systemLogoPreview ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="flex h-16 w-32 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-neutral-900/10 p-2 dark:bg-white/5">
                                                    <img
                                                        src={systemLogoPreview}
                                                        alt="System Logo Preview"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                                    Click or drag to replace
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <UploadCloud className="h-10 w-10 text-muted-foreground/60 transition-colors group-hover:text-indigo-400" />
                                                <span className="text-sm font-semibold">
                                                    Upload System Logo
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    PNG, JPEG, WebP or SVG · max
                                                    5 MB
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {branding?.system_logo && (
                                        <div className="flex justify-start">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={deletingType !== null}
                                                onClick={() =>
                                                    handleDeleteMedia(
                                                        'system_logo',
                                                    )
                                                }
                                                className="h-8 gap-1.5 rounded-md px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                {deletingType ===
                                                'system_logo' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                                Revert to Default Logo
                                            </Button>
                                        </div>
                                    )}
                                    {errors.system_logo && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.system_logo}
                                        </p>
                                    )}
                                </div>

                                {/* Tab Favicon Dropzone */}
                                <div className="space-y-3">
                                    <Label className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Tab Favicon
                                    </Label>
                                    <input
                                        type="file"
                                        name="tab_logo"
                                        ref={tabLogoInputRef}
                                        onChange={(e) =>
                                            handleFileChange(e, 'tab_logo')
                                        }
                                        accept="image/x-icon,image/png,image/svg+xml,image/jpeg,image/webp"
                                        className="hidden"
                                    />

                                    <div
                                        onDragOver={(e) =>
                                            handleDragOver(e, 'favicon')
                                        }
                                        onDragLeave={() =>
                                            handleDragLeave('favicon')
                                        }
                                        onDrop={(e) =>
                                            handleDrop(e, 'tab_logo')
                                        }
                                        onClick={() =>
                                            tabLogoInputRef.current?.click()
                                        }
                                        className={`group relative flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                                            isDraggingFavicon
                                                ? 'scale-[1.02] border-indigo-500 bg-indigo-50/5'
                                                : 'border-border/60 hover:border-indigo-500/60 hover:bg-neutral-50/5'
                                        }`}
                                    >
                                        {tabLogoPreview ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-neutral-900/10 p-2 dark:bg-white/5">
                                                    <img
                                                        src={tabLogoPreview}
                                                        alt="Tab Favicon Preview"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                                    Click or drag to replace
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <UploadCloud className="h-10 w-10 text-muted-foreground/60 transition-colors group-hover:text-indigo-400" />
                                                <span className="text-sm font-semibold">
                                                    Upload Tab Favicon
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    ICO, PNG, WebP or SVG · max
                                                    5 MB
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {branding?.tab_logo && (
                                        <div className="flex justify-start">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                disabled={deletingType !== null}
                                                onClick={() =>
                                                    handleDeleteMedia(
                                                        'tab_logo',
                                                    )
                                                }
                                                className="h-8 gap-1.5 rounded-md px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                {deletingType === 'tab_logo' ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                                Revert to Default Favicon
                                            </Button>
                                        </div>
                                    )}
                                    {errors.tab_logo && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.tab_logo}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-3 border-t border-border/20 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex h-10 items-center gap-2 rounded-lg px-6 shadow-sm"
                                >
                                    {processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save Branding Settings
                                </Button>
                                {recentlySuccessful && (
                                    <span className="flex animate-pulse items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle className="h-4 w-4" />{' '}
                                        Branding updated successfully!
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
