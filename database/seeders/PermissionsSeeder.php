<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions organized by modules
        $permissions = [
            // Dashboard
            'dashboard.view',

            // Members Management
            'members.view',
            'members.create',
            'members.edit',
            'members.delete',
            'members.export',
            'members.import',

            // Family Members
            'family-members.view',
            'family-members.create',
            'family-members.edit',
            'family-members.delete',
            'family-members.extend-expiry',
            'family-members.bulk-expire',

            // Member Categories
            'member-categories.view',
            'member-categories.create',
            'member-categories.edit',
            'member-categories.delete',

            // Member Types
            'member-types.view',
            'member-types.create',
            'member-types.edit',
            'member-types.delete',

            // Financial Management
            'financial.view',
            'financial.create',
            'financial.edit',
            'financial.delete',
            'financial.invoices.view',
            'financial.invoices.create',
            'financial.invoices.edit',
            'financial.invoices.delete',
            'financial.payments.view',
            'financial.payments.create',
            'financial.payments.edit',
            'financial.payments.delete',

            // Reports
            'reports.view',
            'reports.members',
            'reports.financial',
            'reports.maintenance',
            'reports.export',

            // Events Management
            'events.view',
            'events.create',
            'events.edit',
            'events.delete',
            'events.bookings.view',
            'events.bookings.create',
            'events.bookings.edit',
            'events.bookings.delete',

            // Room Bookings
            'room-bookings.view',
            'room-bookings.create',
            'room-bookings.edit',
            'room-bookings.delete',

            // POS System
            'pos.view',
            'pos.orders.create',
            'pos.orders.edit',
            'pos.orders.delete',
            'pos.menu.view',
            'pos.menu.create',
            'pos.menu.edit',
            'pos.menu.delete',

            // Employee Management
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',
            'employees.attendance.view',
            'employees.attendance.create',
            'employees.attendance.edit',
            'employees.leaves.view',
            'employees.leaves.approve',

            // User Management (Super Admin only)
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Roles & Permissions (Super Admin only)
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',
            'permissions.view',
            'permissions.assign',

            // System Settings (Super Admin only)
            'settings.view',
            'settings.edit',
            'settings.backup',
            'settings.maintenance',

            // Audit Logs (Super Admin only)
            'audit-logs.view',

            // Advanced Features (Super Admin only)
            'advanced.database-access',
            'advanced.system-commands',
        ];

        // Create all permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->command->info('Permissions created successfully!');
    }
}
