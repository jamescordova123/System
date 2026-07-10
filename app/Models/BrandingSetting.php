<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class BrandingSetting extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'branding_settings';

    protected $fillable = [
        'app_name',
    ];

    /**
     * Register Spatie media collections for branding settings.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('system_logo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

        $this->addMediaCollection('tab_logo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml', 'image/webp']);
    }
}
