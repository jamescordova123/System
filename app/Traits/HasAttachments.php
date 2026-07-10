<?php

namespace App\Traits;

use Illuminate\Support\Collection;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait HasAttachments
{
    use InteractsWithMedia;

    /**
     * Add a file as an attachment to the model.
     *
     * @param  mixed  $file  An instance of UploadedFile, path, or resource.
     * @param  string  $collection
     * @return Media
     */
    public function addAttachment($file, string $collection = 'attachments'): Media
    {
        return $this->addMedia($file)
            ->preservingOriginal()
            ->toMediaCollection($collection);
    }

    /**
     * Retrieve all attachments belonging to the model.
     *
     * @param  string  $collection
     * @return Collection<int, Media>
     */
    public function getAttachments(string $collection = 'attachments'): Collection
    {
        return $this->getMedia($collection);
    }

    /**
     * Check if the model has any attachments in the specified collection.
     *
     * @param  string  $collection
     * @return bool
     */
    public function hasAttachments(string $collection = 'attachments'): bool
    {
        return $this->hasMedia($collection);
    }

    /**
     * Get the URLs of all attachments.
     *
     * @param  string  $collection
     * @return array<int, string>
     */
    public function getAttachmentUrls(string $collection = 'attachments'): array
    {
        return $this->getMedia($collection)->map(fn (Media $media) => $media->getUrl())->toArray();
    }

    /**
     * Register the default attachment media collection with constraints.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
                'text/plain',
            ]);
    }
}
