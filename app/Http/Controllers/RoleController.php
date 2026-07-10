<?php

namespace App\Http\Controllers;

use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Roles/Index', [
            'roles' => Role::with('permissions')->paginate(10)->withQueryString(),
            'permissions' => Permission::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:roles,name']);
        $role = Role::create(['name' => $request->name]);
        $role->syncPermissions($request->permissions ?? []);

        AuditLogger::log('Role Created', "Role \"{$role->name}\" was created.");

        return back()->with('message', 'Role created successfully.');
    }

    public function update(Request $request, Role $role)
    {
        if ($role->name === 'Super-Admin') {
            return back()->with('error', 'The Super-Admin role cannot be modified.');
        }

        $request->validate(['name' => 'required|string|unique:roles,name,'.$role->id]);
        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions ?? []);

        AuditLogger::log('Role Permissions Updated', "Permissions for role \"{$role->name}\" were updated.");

        return back()->with('message', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'Super-Admin') {
            return back()->with('error', 'The Super-Admin role cannot be deleted.');
        }

        AuditLogger::log('Role Deleted', "Role \"{$role->name}\" was deleted.");

        $role->delete();

        return back()->with('message', 'Role deleted successfully.');
    }
}
