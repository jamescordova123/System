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
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view dashboard',
            'manage users',
            'manage students',
            'manage sections',
            'manage enrollments',
            'manage billing',
            'manage payments',
            'view receipts',
            'view announcements',
            'manage announcements',
            'view notifications',
            'view student portal',
            'view risk analytics',
            'view school overview',
            'view enrollment analytics',
            'view financial analytics',
            'view school analytics',
            'delete records',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $superAdminRole = Role::firstOrCreate([
            'name' => 'Super-Admin',
            'guard_name' => 'web',
        ]);
        $superAdminRole->syncPermissions($permissions);

        $registrarRole = Role::firstOrCreate([
            'name' => 'Registrar',
            'guard_name' => 'web',
        ]);
        $registrarRole->syncPermissions([
            'view dashboard',
            'manage students',
            'manage sections',
            'manage enrollments',
            'view announcements',
            'view enrollment analytics',
        ]);

        $cashierRole = Role::firstOrCreate([
            'name' => 'Cashier',
            'guard_name' => 'web',
        ]);
        $cashierRole->syncPermissions([
            'view dashboard',
            'manage billing',
            'manage payments',
            'view receipts',
            'view financial analytics',
        ]);

        $studentRole = Role::firstOrCreate([
            'name' => 'Student',
            'guard_name' => 'web',
        ]);
        $studentRole->syncPermissions([
            'view dashboard',
            'view student portal',
            'view announcements',
            'view notifications',
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($superAdminRole);

        $cashier = User::firstOrCreate(
            ['email' => 'cashier@example.com'],
            [
                'name' => 'Cashier User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $cashier->assignRole($cashierRole);

        $student = User::firstOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Student User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $student->assignRole($studentRole);

        $registrar = User::firstOrCreate(
            ['email' => 'registrar@example.com'],
            [
                'name' => 'Registrar User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $registrar->assignRole($registrarRole);
    }
}
