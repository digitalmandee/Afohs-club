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
            'dashboard.stats.view',

            // Members Management
            'members.view',
            'members.create',
            'members.edit',
            'members.delete',

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
            'financial.dashboard.view',
            'financial.view',
            'financial.create',
            'financial.edit',
            'financial.delete',

            // Sports Subscription
            'subscriptions.dashboard.view',
            'subscriptions.view',
            'subscriptions.create',
            'subscriptions.edit',
            'subscriptions.delete',
            'subscriptions.types.view',
            'subscriptions.types.create',
            'subscriptions.types.edit',
            'subscriptions.types.delete',
            'subscriptions.categories.view',
            'subscriptions.categories.create',
            'subscriptions.categories.edit',
            'subscriptions.categories.delete',

            'kitchen.dashboard.view',
            'kitchen.view',
            'kitchen.create',
            'kitchen.edit',
            'kitchen.delete',

            // Events Management
            'events.bookings.create',
            'events.bookings.edit',
            'events.bookings.delete',
            'events.bookings.view',
            'events.bookings.completed',
            'events.bookings.cancelled',
            'events.bookings.calendar',
            
            'events.venue.view',
            'events.venue.create',
            'events.venue.edit',
            'events.venue.delete',

            'events.menu.view',
            'events.menu.create',
            'events.menu.edit',
            'events.menu.delete',
            
            'events.menuCategories.view',
            'events.menuCategories.create',
            'events.menuCategories.edit',
            'events.menuCategories.delete',
            
            'events.menuTypes.view',
            'events.menuTypes.create',
            'events.menuTypes.edit',
            'events.menuTypes.delete',

            'events.menuAdons.view',
            'events.menuAdons.create',
            'events.menuAdons.edit',
            'events.menuAdons.delete',
            
            'events.chargesTypes.view',
            'events.chargesTypes.create',
            'events.chargesTypes.edit',
            'events.chargesTypes.delete',
            'events.bookings.view',
            'events.bookings.create',
            'events.bookings.edit',
            'events.bookings.delete',

            // Room Bookings
            'rooms.bookings.view',
            'rooms.bookings.create',
            'rooms.bookings.edit',
            'rooms.bookings.delete',
            'rooms.bookings.calendar',
            'rooms.bookings.checkin',
            'rooms.bookings.checkout',
            'rooms.bookings.requests',

            'rooms.view',
            'rooms.create',
            'rooms.edit',
            'rooms.delete',
            
            'rooms.types.view',
            'rooms.types.create',
            'rooms.types.edit',
            'rooms.types.delete',
            
            'rooms.categories.view',
            'rooms.categories.create',
            'rooms.categories.edit',
            'rooms.categories.delete',
            
            'rooms.chargesTypes.view',
            'rooms.chargesTypes.create',
            'rooms.chargesTypes.edit',
            'rooms.chargesTypes.delete',
            
            'rooms.miniBar.view',
            'rooms.miniBar.create',
            'rooms.miniBar.edit',
            'rooms.miniBar.delete',
            
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

            'finance.dashboard.view',
            'finance.view',
            'finance.create',
            
            // Reports
            'reports.view',

            // // POS System
            // 'pos.view',
            // 'pos.orders.create',
            // 'pos.orders.edit',
            // 'pos.orders.delete',
            // 'pos.product.view',
            // 'pos.product.create',
            // 'pos.product.edit',
            // 'pos.product.delete',

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
