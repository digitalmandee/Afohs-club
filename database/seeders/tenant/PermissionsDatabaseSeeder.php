<?php

namespace Database\Seeders\Tenant;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Define Permissions with Category (Role Type) and Subcategory (Functional Group)
        $permissions = [
            'dashboard',
            'order',
            'kitchen',
            'user',
        ];

        // Create Permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);
        $kitchenRole = Role::firstOrCreate(['name' => 'kitchen']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Assign Permissions to Roles
        $adminRole->syncPermissions($permissions);
        $employeeRole->syncPermissions(['dashboard', 'order']);
        $kitchenRole->syncPermissions(['dashboard', 'kitchen']);
        $userRole->syncPermissions(['dashboard']);
    }
}