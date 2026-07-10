<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    /**
     * Perform a lightning-fast global search using Laravel Scout (database driver).
     */
    public function search(Request $request): JsonResponse
    {
        $query = trim($request->query('q', ''));

        // Handle empty or extremely short queries safely to prevent unnecessary DB load
        if (empty($query) || mb_strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        try {
            // 1. Run standard Scout search (exact/LIKE matching)
            $users = User::search($query)->take(5)->get();

            // 2. Local Phonetic Fallback: If no exact matches are found, use MySQL SOUNDEX
            if ($users->isEmpty()) {
                $words = explode(' ', $query);

                $users = User::where(function ($q) use ($words) {
                    foreach ($words as $word) {
                        if (strlen($word) > 1) {
                            $q->orWhereRaw('SOUNDEX(name) = SOUNDEX(?)', [$word])
                                ->orWhereRaw('SOUNDEX(email) = SOUNDEX(?)', [$word]);
                        }
                    }
                })
                    ->take(5)
                    ->get();
            }

            $mappedResults = $users->map(fn (User $user) => [
                'id' => $user->id,
                'title' => $user->name,
                'subtitle' => $user->email,
                'avatar_url' => $user->avatar_url,
                'url' => route('users.show', $user->id, false),
                'type' => 'User',
            ]);

            return response()->json([
                'success' => true,
                'data' => $mappedResults,
            ]);
        } catch (\Exception $e) {
            Log::error('Search failure: '.$e->getMessage(), [
                'query' => $query,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Search failed to execute.',
                'data' => [],
            ], 500);
        }
    }
}
