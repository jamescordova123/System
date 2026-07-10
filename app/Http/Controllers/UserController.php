<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->query('search', ''));

        $query = User::with('roles');

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Admin/Users/Index', [
            'users' => $query->paginate(10)->withQueryString(),
            'roles' => Role::all(),
        ]);
    }

    public function show(User $user)
    {
        return redirect()->route('users.index', ['search' => $user->email]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'roles' => 'array',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        if ($request->has('roles')) {
            $user->assignRole($request->roles);
        }

        AuditLogger::log('User Account Registered', "User account \"{$user->email}\" was created by admin with roles: ".implode(', ', $request->roles ?? []).'.', $user->id, $user->email);

        return back()->with('message', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'roles' => 'array',
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $userData['password'] = bcrypt($request->password);
        }

        $user->update($userData);

        if ($request->has('roles')) {
            // Guard: ensure we don't accidentally remove Super-Admin from the last Super-Admin user
            if ($user->hasRole('Super-Admin') && ! in_array('Super-Admin', $request->roles)) {
                $superAdminCount = User::role('Super-Admin')->count();
                if ($superAdminCount <= 1) {
                    return back()->with('error', 'Cannot remove Super-Admin role from the only remaining Super-Admin user.');
                }
            }

            $user->syncRoles($request->roles);
        }

        AuditLogger::log('User Role Assigned', "User account \"{$user->email}\" was updated. Roles synced to: ".implode(', ', $request->roles ?? []).'.', $user->id, $user->email);

        return back()->with('message', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Guard: prevent self-deletion
        if (auth()->id() === $user->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Guard: prevent deleting the last Super-Admin
        if ($user->hasRole('Super-Admin')) {
            $superAdminCount = User::role('Super-Admin')->count();
            if ($superAdminCount <= 1) {
                return back()->with('error', 'Cannot delete the only remaining Super-Admin user.');
            }
        }

        AuditLogger::log('User Deleted', "User account \"{$user->email}\" was deleted.", $user->id, $user->email);

        $user->delete();

        return back()->with('message', 'User deleted successfully.');
    }
}
