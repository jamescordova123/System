<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'manage users',
            'edit articles',
            'delete records',
            'view dashboard',

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Create roles and assign created permissions

        // 1. Super-Admin
        $superAdminRole = Role::firstOrCreate([
            'name' => 'Super-Admin',
            'guard_name' => 'web',
        ]);

        // 2. Manager
        $managerRole = Role::firstOrCreate([
            'name' => 'Manager',
            'guard_name' => 'web',
        ]);
        $managerRole->givePermissionTo([
            'edit articles',
            'view dashboard',
        ]);

        // 3. User
        $userRole = Role::firstOrCreate([
            'name' => 'User',
            'guard_name' => 'web',
        ]);
        $userRole->givePermissionTo([
            'view dashboard',
        ]);

        // Seed Super-Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($superAdminRole);

        // Seed Manager User
        $manager = User::firstOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Manager User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $manager->assignRole($managerRole);

        // Seed Standard User
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'user@example.com', // fallback for name
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole($userRole);
    }
}
