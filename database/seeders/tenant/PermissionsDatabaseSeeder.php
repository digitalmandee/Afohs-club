<?php

namespace Database\Seeders\Tenant;

use App\Models\MemberType;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

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
        $waiterRole = Role::firstOrCreate(['name' => 'waiter']);
        $kitchenRole = Role::firstOrCreate(['name' => 'kitchen']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Assign Permissions to Roles
        $adminRole->syncPermissions($permissions);
        $employeeRole->syncPermissions(['dashboard', 'order']);
        $waiterRole->syncPermissions(['dashboard', 'waiter']);
        $kitchenRole->syncPermissions(['dashboard', 'kitchen']);
        $userRole->syncPermissions(['dashboard']);


        // Create Users
        $user = User::factory()->create([
            'user_id' => 12345676,
            'password' => bcrypt('123456'),
            'member_type_id' => 1,
        ]);
        $user2 = User::factory()->create([
            'user_id' => 12345677,
            'password' => bcrypt('123456'),
            'member_type_id' => 2,
        ]);
        $user3 = User::factory()->create([
            'user_id' => 12345679,
            'password' => bcrypt('123456'),
            'member_type_id' => 3,
        ]);
        $user4 = User::factory()->create([
            'user_id' => 12345680,
            'password' => bcrypt('123456'),
            'member_type_id' => 4,
        ]);
        $user5 = User::factory()->create([
            'user_id' => 12345681,
            'password' => bcrypt('123456'),
            'member_type_id' => 5,
        ]);

        $user->assignRole('user');
        $user2->assignRole('user');
        $user3->assignRole('user');
        $user4->assignRole('user');
        $user5->assignRole('user');
    }
}
