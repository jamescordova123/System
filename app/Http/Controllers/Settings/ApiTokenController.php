<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApiTokenController extends Controller
{
    /**
     * Display a listing of the active API tokens.
     */
    public function index(Request $request): Response
    {
        $tokens = $request->user()->tokens()
            ->select(['id', 'name', 'abilities', 'last_used_at', 'created_at'])
            ->latest()
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at ? $token->last_used_at->toIso8601String() : null,
                'last_used_at_diff' => $token->last_used_at ? $token->last_used_at->diffForHumans() : null,
                'created_at' => $token->created_at->toIso8601String(),
                'created_at_diff' => $token->created_at->diffForHumans(),
            ]);

        return Inertia::render('settings/api-tokens/index', [
            'tokens' => $tokens,
            'plainTextToken' => $request->session()->get('plainTextToken'),
        ]);
    }

    /**
     * Store a newly created API token in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'abilities' => ['nullable', 'array'],
            'abilities.*' => ['string', 'in:read,write,delete'],
        ]);

        $abilities = $validated['abilities'] ?? ['read'];

        $token = $request->user()->createToken($validated['name'], $abilities);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('API Token generated successfully.'),
        ]);

        return back()->with('plainTextToken', $token->plainTextToken);
    }

    /**
     * Remove the specified API token from storage.
     */
    public function destroy(Request $request, int $tokenId): RedirectResponse
    {
        $token = $request->user()->tokens()->findOrFail($tokenId);

        $token->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('API Token revoked successfully.'),
        ]);

        return back();
    }
}
