# Spatie Media Library — Upload Pattern Reference

> **AI READER NOTICE**
> This document is the canonical reference for implementing file uploads in this codebase.
> Before generating any upload-related code, read this entire file first.
> Every pattern here is already working in production in this project.
> Follow the conventions exactly — do not invent new patterns.

---

## Stack Context

| Layer | Technology |
|---|---|
| Framework | Laravel 13 / PHP 8.3 |
| Media Library | `spatie/laravel-medialibrary` v11 |
| Image Processing | `spatie/image` v3 (`Spatie\Image\Enums\Fit`) |
| Frontend | React 18 + TypeScript + Inertia.js v3 |
| UI Components | shadcn/ui (Radix primitives) + Tailwind CSS |
| Form Submission | Inertia `router.post` / `router.delete` (NOT fetch/axios) |
| Queue | Laravel database/redis queue — worker already in `composer dev` script |

---

## Prerequisites (one-time setup — already done for User avatar)

```bash
# 1. Install the package
composer require spatie/laravel-medialibrary

# 2. Publish and run the migration (creates the `media` table)
php artisan vendor:publish --tag="medialibrary-migrations"
php artisan migrate

# 3. Symlink storage so files are publicly accessible
php artisan storage:link
```

The `composer dev` script already runs `php artisan queue:listen --tries=1`
alongside the dev server, so async conversions work out of the box.

---

## Architecture Flow

```
User action (React)
  └─ router.post(route('module.media.update'), FormData)   ← Inertia, forceFormData: true
       └─ [Route: POST module/{id}/media]                  ← inside auth middleware
            └─ ModuleMediaController@store
                 ├─ $request->validate([...])              ← MIME + size guard
                 ├─ $model->addMediaFromRequest('field')
                 │       ->toMediaCollection('collection')
                 └─ return to_route(...)
                      └─ HandleInertiaRequests::share()    ← re-serializes media_url
                           └─ React receives updated URL via usePage().props
```

---

## Part 1 — Laravel Model

### 1a. Interface + Trait

Every model that stores media **must** implement `HasMedia` and use `InteractsWithMedia`.

```php
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class YourModel extends Model implements HasMedia
{
    use InteractsWithMedia;
    // ... other traits
}
```

### 1b. registerMediaCollections()

Define one method per logical grouping. Common options:

```php
public function registerMediaCollections(): void
{
    // ── Single-file slot (replaces old file automatically) ─────────────────
    $this->addMediaCollection('avatar')
        ->singleFile()                                          // auto-deletes previous
        ->useFallbackUrl('/images/default-avatar.svg')         // returned when empty
        ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);

    // ── Multi-file gallery (no limit) ──────────────────────────────────────
    $this->addMediaCollection('attachments')
        ->acceptsMimeTypes(['image/jpeg', 'image/png', 'application/pdf']);

    // ── Multi-file with a hard cap ─────────────────────────────────────────
    $this->addMediaCollection('gallery')
        ->onlyKeepLatest(10);                                   // auto-prunes oldest
}
```

**Rule:** Always call `->acceptsMimeTypes([...])` to enforce a server-side MIME allowlist on the collection level.

### 1c. registerMediaConversions()

Define image processing pipelines. Always mark heavy conversions as `.queued()`.

```php
public function registerMediaConversions(?Media $media = null): void
{
    // 150×150 square thumbnail — Fit::Crop fills the frame, no letterbox
    $this->addMediaConversion('thumb')
        ->fit(\Spatie\Image\Enums\Fit::Crop, 150, 150)
        ->queued();                                             // async, non-blocking

    // 800px wide preview — maintains aspect ratio
    $this->addMediaConversion('preview')
        ->fit(\Spatie\Image\Enums\Fit::Width, 800, 800)
        ->queued();

    // No conversion (just store original) — omit registerMediaConversions entirely
}
```

**Available `Fit` enum values (spatie/image v3):**

| Enum | Behaviour |
|---|---|
| `Fit::Crop` | Fills exact WxH, crops excess |
| `Fit::Contain` | Fits within WxH, adds padding |
| `Fit::Max` | Scales down only, keeps ratio |
| `Fit::Fill` | Stretches to fill — avoid |
| `Fit::Width` | Constrain width only |
| `Fit::Height` | Constrain height only |

---

## Part 2 — Controller

### 2a. Single-file upload + delete (canonical pattern)

```php
<?php

namespace App\Http\Controllers\{Namespace};

use App\Http\Controllers\Controller;
use App\Models\YourModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class YourModelMediaController extends Controller
{
    /**
     * Store / replace a media file on the given model.
     */
    public function store(Request $request, YourModel $model): RedirectResponse
    {
        // Always authorize — never trust the route parameter alone
        $this->authorize('update', $model);

        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpeg,png,webp',   // adjust per collection
                'max:5120',              // 5 MB; use 2048 for stricter modules
            ],
        ]);

        $model
            ->addMediaFromRequest('file')   // 'file' = the FormData field name
            ->toMediaCollection('avatar');  // must match registerMediaCollections()

        Inertia::flash('toast', ['type' => 'success', 'message' => __('File uploaded.')]);

        return to_route('your.route.name');
    }

    /**
     * Delete a specific media item, or clear the whole collection.
     */
    public function destroy(Request $request, YourModel $model): RedirectResponse
    {
        $this->authorize('update', $model);

        // Option A — clear the entire collection (good for singleFile slots)
        $model->clearMediaCollection('avatar');

        // Option B — delete one specific media item by its ID
        // $media = $model->getMedia('gallery')->findOrFail($request->media_id);
        // $media->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('File removed.')]);

        return to_route('your.route.name');
    }
}
```

### 2b. Uploading from an external URL or path (not a request file)

```php
// From a URL
$model->addMediaFromUrl('https://example.com/photo.jpg')
    ->toMediaCollection('avatar');

// From a local server path
$model->addMediaFromPath(storage_path('tmp/uploaded.jpg'))
    ->toMediaCollection('avatar');
```

### 2c. Validation rules reference

| Scenario | Rule |
|---|---|
| Images only | `'mimes:jpeg,png,webp'` |
| PDFs only | `'mimes:pdf'` |
| Images + PDF | `'mimes:jpeg,png,webp,pdf'` |
| 2 MB cap | `'max:2048'` |
| 5 MB cap | `'max:5120'` |
| 10 MB cap | `'max:10240'` |
| Required | `'required', 'file'` |
| Optional | `'nullable', 'file'` |

---

## Part 3 — Routes

Always nest media routes inside the existing `auth` middleware group in `routes/settings.php`
or `routes/web.php`. Never put file-upload routes outside of auth.

```php
// routes/settings.php  OR  routes/web.php
Route::middleware(['auth'])->group(function () {

    // Single-resource media (e.g. avatar on a profile)
    Route::post('module/{model}/media',    [YourModelMediaController::class, 'store'])
        ->name('module.media.store');
    Route::delete('module/{model}/media',  [YourModelMediaController::class, 'destroy'])
        ->name('module.media.destroy');

    // For the authenticated user's own resource (no model binding needed)
    Route::post('settings/profile/avatar',    [ProfileMediaController::class, 'updateAvatar'])
        ->name('profile.avatar.update');
    Route::delete('settings/profile/avatar',  [ProfileMediaController::class, 'destroyAvatar'])
        ->name('profile.avatar.destroy');
});
```

---

## Part 4 — Inertia State (HandleInertiaRequests.php)

To expose a media URL to React globally, merge it into the `auth.user` array
(or the relevant shared prop) inside `app/Http/Middleware/HandleInertiaRequests.php`.

```php
public function share(Request $request): array
{
    $user = $request->user();

    return [
        ...parent::share($request),
        'auth' => [
            'user' => $user ? array_merge($user->toArray(), [
                // Priority: thumb conversion → original → fallback
                'avatar_url' => $user->getFirstMediaUrl('avatar', 'thumb')
                    ?: $user->getFirstMediaUrl('avatar')
                    ?: '/images/default-avatar.svg',
            ]) : null,
            'roles'       => $user ? $user->getRoleNames() : [],
            'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
        ],
        // ... other shared props
    ];
}
```

**For non-user models** (e.g., a `Post` model on a specific page), pass the URL
via the page controller's `Inertia::render()` props instead:

```php
// In a page controller
return Inertia::render('Posts/Edit', [
    'post' => array_merge($post->toArray(), [
        'cover_url' => $post->getFirstMediaUrl('cover', 'preview')
            ?: $post->getFirstMediaUrl('cover')
            ?: '/images/default-cover.svg',
    ]),
]);
```

---

## Part 5 — TypeScript Types

### 5a. Update the model type (auth.ts or a module-specific types file)

```typescript
// resources/js/types/auth.ts  (for user-level media)
export type User = {
    id: number;
    name: string;
    email: string;
    /** Spatie Media Library URL — thumb conversion or fallback */
    avatar_url: string;
    // ... other fields
    [key: string]: unknown;
};

// resources/js/types/posts.ts  (for a module-specific model)
export type Post = {
    id: number;
    title: string;
    /** Spatie Media Library URL — preview conversion or fallback */
    cover_url: string;
    // ... other fields
};
```

---

## Part 6 — React Component (AvatarUploadZone pattern)

The canonical upload component lives at:
`resources/js/components/avatar-upload-zone.tsx`

### 6a. Key implementation rules for any upload component

```typescript
import { router } from '@inertiajs/react';

// ── 1. Always use router.post with forceFormData ────────────────────────────
function handleUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);           // key must match controller validation

    router.post(route('module.media.store', { model: modelId }), formData, {
        forceFormData: true,                 // required for file uploads
        preserveScroll: true,
        onSuccess: () => { /* clear preview */ },
        onError: (errors) => { /* show errors.file */ },
        onFinish: () => setUploading(false),
    });
}

// ── 2. Always use router.delete for removal ─────────────────────────────────
function handleDelete() {
    router.delete(route('module.media.destroy', { model: modelId }), {
        preserveScroll: true,
    });
}

// ── 3. Client-side validation before sending ────────────────────────────────
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;   // must match server max: rule

function validate(file: File): string | null {
    if (!ACCEPTED.includes(file.type)) return 'Only JPEG, PNG, WebP accepted.';
    if (file.size > MAX_BYTES) return 'File must be under 5 MB.';
    return null;
}

// ── 4. Optimistic preview with object URLs ──────────────────────────────────
const [preview, setPreview] = React.useState<string | null>(null);

function pickFile(file: File) {
    if (preview) URL.revokeObjectURL(preview);   // avoid memory leaks
    setPreview(URL.createObjectURL(file));
    handleUpload(file);
}

// Cleanup on unmount
React.useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
```

### 6b. Display URL priority

```typescript
// Always resolve in this order — never hardcode paths
const src = preview                          // 1. optimistic local preview
    ?? user.avatar_url                       // 2. server-sent URL (thumb or original)
    ?? '/images/default-avatar.svg';         // 3. static fallback (last resort)
```

### 6c. State machine for upload components

```
idle
 ├─ user picks file ──────────────────────────────► previewing
 │                                                      │
 │                                              router.post fires
 │                                                      │
 │                                                  uploading
 │                                               ┌────┴────┐
 │                                           success     error
 │                                               │           │
 │                                        preview=null  preview=null
 │                                               │           │
 └───────────────────────────────────────────── idle ◄───────┘
```

---

## Part 7 — Retrieving Media URLs in PHP

```php
// Original file URL
$model->getFirstMediaUrl('collection-name');

// Specific conversion URL (returns '' if conversion not yet processed)
$model->getFirstMediaUrl('collection-name', 'thumb');

// With fallback chaining (safe pattern)
$url = $model->getFirstMediaUrl('avatar', 'thumb')
    ?: $model->getFirstMediaUrl('avatar')
    ?: '/images/default-avatar.svg';

// Get the Media model itself (for metadata)
$media = $model->getFirstMedia('collection-name');
$media?->file_name;
$media?->size;           // bytes
$media?->mime_type;
$media?->created_at;

// Get all media in a collection
$model->getMedia('gallery');                // Collection<Media>

// Get all conversion URLs for a single media item
$media->getUrl('thumb');
$media->getUrl('preview');
```

---

## Part 8 — Checklist for Adding Media to a New Module

When an AI or developer needs to add file upload to any module in this project,
work through this checklist in order:

- [ ] **Model** — Add `implements HasMedia`, `use InteractsWithMedia`, `registerMediaCollections()`, and optionally `registerMediaConversions()`
- [ ] **Controller** — Create `{Module}MediaController` with `store()` and `destroy()` methods; use `$this->authorize()` + `$request->validate()`
- [ ] **Routes** — Register `POST` and `DELETE` routes inside `auth` middleware group
- [ ] **Inertia serialization** — Add `{field}_url` to the Inertia shared props or page props
- [ ] **TypeScript type** — Add `{field}_url: string` to the relevant type definition
- [ ] **React component** — Build or reuse an upload zone that uses `router.post(…, { forceFormData: true })`
- [ ] **Fallback asset** — Place a static SVG/PNG at `public/images/default-{name}.svg`
- [ ] **Queue** — Confirm `QUEUE_CONNECTION` is set in `.env` and worker is running if conversions are queued

---

## Part 9 — Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---|---|
| `fetch('/upload', { body: formData })` | `router.post(route('…'), formData, { forceFormData: true })` |
| Storing file path in a model column | Use `getFirstMediaUrl()` — Spatie manages the path |
| Not calling `->queued()` on conversions | Always use `->queued()` to avoid blocking HTTP requests |
| Route outside auth middleware | All upload routes must be inside `auth` middleware |
| Not revoking object URLs | Call `URL.revokeObjectURL(preview)` on success, error, and unmount |
| `getFirstMediaUrl` without fallback | Always chain `?: '/images/default-x.svg'` in PHP |
| Forgetting `forceFormData: true` | Without it, Inertia may send JSON, breaking file uploads |
| Using `image/jpg` in acceptsMimeTypes | The correct MIME type is `image/jpeg` |
| `mimes:jpg` in validation | Use `mimes:jpeg` (Laravel maps it internally, but be explicit) |

---

## Real Implementation Reference

The working reference implementation for this document is the **User Avatar** feature:

| File | Role |
|---|---|
| [`app/Models/User.php`](../app/Models/User.php) | Model with `HasMedia` + `registerMediaCollections` + `registerMediaConversions` |
| [`app/Http/Controllers/Settings/ProfileMediaController.php`](../app/Http/Controllers/Settings/ProfileMediaController.php) | Upload + delete controller |
| [`routes/settings.php`](../routes/settings.php) | Route registration inside auth middleware |
| [`app/Http/Middleware/HandleInertiaRequests.php`](../app/Http/Middleware/HandleInertiaRequests.php) | `avatar_url` serialized into shared `auth.user` |
| [`resources/js/types/auth.ts`](../resources/js/types/auth.ts) | `avatar_url: string` on `User` type |
| [`resources/js/components/avatar-upload-zone.tsx`](../resources/js/components/avatar-upload-zone.tsx) | Full React upload component |
| [`resources/js/pages/settings/profile.tsx`](../resources/js/pages/settings/profile.tsx) | Page integrating the component |
| [`public/images/default-avatar.svg`](../public/images/default-avatar.svg) | Static fallback placeholder |
