<?php

namespace App\Concerns;

trait BrandingValidationRules
{
    /**
     * Get the validation rules used to validate branding settings.
     *
     * @return array<string, array<int, string>>
     */
    protected function brandingRules(): array
    {
        return [
            'app_name' => ['required', 'string', 'max:255'],
            'system_logo' => ['nullable', 'file', 'mimes:jpeg,png,webp,svg', 'max:5120'],
            'tab_logo' => ['nullable', 'file', 'mimes:ico,png,svg,jpeg,webp', 'max:5120'],
        ];
    }
}
