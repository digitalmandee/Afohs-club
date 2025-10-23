<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Super Admin Role (has all permissions)
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Create Admin Role (has most permissions except super admin features)
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $adminPermissions = [
            'dashboard.view',
            'members.view', 'members.create', 'members.edit', 'members.delete', 'members.export', 'members.import',
            'family-members.view', 'family-members.create', 'family-members.edit', 'family-members.delete',
            'member-categories.view', 'member-categories.create', 'member-categories.edit', 'member-categories.delete',
            'member-types.view', 'member-types.create', 'member-types.edit', 'member-types.delete',
            'financial.view', 'financial.create', 'financial.edit', 'financial.delete',
            'financial.invoices.view', 'financial.invoices.create', 'financial.invoices.edit', 'financial.invoices.delete',
            'financial.payments.view', 'financial.payments.create', 'financial.payments.edit', 'financial.payments.delete',
            'reports.view', 'reports.members', 'reports.financial', 'reports.maintenance', 'reports.export',
            'events.view', 'events.create', 'events.edit', 'events.delete',
            'events.bookings.view', 'events.bookings.create', 'events.bookings.edit', 'events.bookings.delete',
            'room-bookings.view', 'room-bookings.create', 'room-bookings.edit', 'room-bookings.delete',
            'pos.view', 'pos.orders.create', 'pos.orders.edit', 'pos.orders.delete',
            'pos.menu.view', 'pos.menu.create', 'pos.menu.edit', 'pos.menu.delete',
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
            'employees.attendance.view', 'employees.attendance.create', 'employees.attendance.edit',
            'employees.leaves.view', 'employees.leaves.approve',
        ];
        $admin->givePermissionTo($adminPermissions);

        // Create Manager Role (can manage most things but not delete or create users)
        $manager = Role::firstOrCreate(['name' => 'manager']);
        $managerPermissions = [
            'dashboard.view',
            'members.view', 'members.edit', 'members.export',
            'family-members.view', 'family-members.edit',
            'financial.view', 'financial.create', 'financial.edit',
            'financial.invoices.view', 'financial.invoices.create', 'financial.invoices.edit',
            'financial.payments.view', 'financial.payments.create', 'financial.payments.edit',
            'reports.view', 'reports.members', 'reports.financial', 'reports.maintenance', 'reports.export',
            'events.view', 'events.create', 'events.edit',
            'events.bookings.view', 'events.bookings.create', 'events.bookings.edit',
            'room-bookings.view', 'room-bookings.create', 'room-bookings.edit',
            'pos.view', 'pos.orders.create', 'pos.orders.edit',
            'pos.menu.view',
            'employees.view', 'employees.attendance.view', 'employees.leaves.view',
        ];
        $manager->givePermissionTo($managerPermissions);

        // Create Staff Role (basic operations)
        $staff = Role::firstOrCreate(['name' => 'staff']);
        $staffPermissions = [
            'dashboard.view',
            'members.view',
            'family-members.view',
            'financial.view', 'financial.invoices.view', 'financial.payments.view',
            'events.view', 'events.bookings.view',
            'room-bookings.view',
            'pos.view', 'pos.orders.create',
            'employees.attendance.view',
        ];
        $staff->givePermissionTo($staffPermissions);

        // Create User Role (read-only access to most things)
        $user = Role::firstOrCreate(['name' => 'user']);
        $userPermissions = [
            'dashboard.view',
            'members.view',
            'family-members.view',
            'financial.view', 'financial.invoices.view', 'financial.payments.view',
            'reports.view', 'reports.members', 'reports.financial', 'reports.maintenance',
            'events.view', 'events.bookings.view',
            'room-bookings.view',
            'pos.view',
        ];
        $user->givePermissionTo($userPermissions);

        // Create Guest Role (very limited access)
        $guest = Role::firstOrCreate(['name' => 'guest']);
        $guestPermissions = [
            'dashboard.view',
            'members.view',
            'events.view',
        ];
        $guest->givePermissionTo($guestPermissions);

        $this->command->info('Roles and permissions assigned successfully!');
    }
}
