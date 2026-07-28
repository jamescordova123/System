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
            'manage roles',
            'manage students',
            'manage sections',
            'manage enrollments',
            'manage billing',
            'manage payments',
            'manage cashiers',
            'view receipts',
            'view announcements',
            'manage announcements',
            'view notifications',
            'view student portal',
            'view risk analytics',
            'view school overview',
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

        // Scoped administrator role: School Overview, User Management,
        // Roles & Permissions, Announcements, and Risk Analytics only.
        // Unlike Super-Admin, this role does NOT bypass permission checks.
        $adminRole = Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
        ]);
        $adminRole->syncPermissions([
            'view dashboard',
            'view school overview',
            'manage users',
            'manage roles',
            'manage announcements',
            'view announcements',
            'view risk analytics',
        ]);

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

        $adminStaff = User::firstOrCreate(
            ['email' => 'admin.staff@example.com'],
            [
                'name' => 'Admin Staff',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $adminStaff->assignRole($adminRole);

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
