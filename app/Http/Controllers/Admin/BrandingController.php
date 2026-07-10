<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\BrandingUpdateRequest;
use App\Models\BrandingSetting;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class BrandingController extends Controller
{
    /**
     * Update the system branding settings.
     */
    public function update(BrandingUpdateRequest $request)
    {
        $validated = $request->validated();

        $branding = BrandingSetting::firstOrCreate([]);
        $oldAppName = $branding->app_name;

        $branding->update([
            'app_name' => $validated['app_name'],
        ]);

        $changes = [];
        if ($oldAppName !== $validated['app_name']) {
            $changes[] = "App name changed from \"{$oldAppName}\" to \"{$validated['app_name']}\"";
        }

        if ($request->hasFile('system_logo')) {
            $branding->addMediaFromRequest('system_logo')->toMediaCollection('system_logo');
            $changes[] = 'System logo updated';
        }

        if ($request->hasFile('tab_logo')) {
            $branding->addMediaFromRequest('tab_logo')->toMediaCollection('tab_logo');
            $changes[] = 'Tab favicon updated';
        }

        if (! empty($changes)) {
            AuditLogger::log(
                'Branding Settings Updated',
                'System branding was updated: '.implode(', ', $changes).'.'
            );
        }

        return back()->with('message', 'System branding settings updated successfully.');
    }

    /**
     * Revert/remove a branding asset.
     */
    public function destroy(Request $request, string $type)
    {
        // Enforce Super-Admin authorization on backend
        if (! auth()->user()->hasRole('Super-Admin')) {
            abort(403, 'Unauthorized.');
        }

        if (! in_array($type, ['system_logo', 'tab_logo'])) {
            abort(400, 'Invalid asset type.');
        }

        $branding = BrandingSetting::first();
        if ($branding) {
            $branding->clearMediaCollection($type);

            $label = $type === 'system_logo' ? 'System logo' : 'Tab favicon';
            AuditLogger::log('Branding Asset Removed', "{$label} was reverted to default.");
        }

        return back()->with('message', 'Branding asset reverted to default successfully.');
    }
}
