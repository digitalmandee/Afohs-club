<?php

namespace Database\Seeders\Tenant;

use App\Models\User;
use Illuminate\Database\Seeder;
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
            'admin'
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
        $adminRole->syncPermissions(['dashboard', 'order', 'user', 'admin']);
        $employeeRole->syncPermissions(['dashboard', 'order']);
        $waiterRole->syncPermissions(['dashboard', 'order']);
        $kitchenRole->syncPermissions(['kitchen']);
        $userRole->syncPermissions(['dashboard']);


        // Create Users
        $user = User::factory()->create([
            'user_id' => 12345676,
            'password' => bcrypt('123456'),
            'member_type_id' => 1,
            'phone_number' => '1234567890',
        ]);
        $user2 = User::factory()->create([
            'user_id' => 12345677,
            'password' => bcrypt('123456'),
            'member_type_id' => 2,
            'phone_number' => '1234567890',
        ]);
        $user3 = User::factory()->create([
            'user_id' => 12345679,
            'password' => bcrypt('123456'),
            'member_type_id' => 3,
            'phone_number' => '1234567890',
        ]);
        $user4 = User::factory()->create([
            'user_id' => 12345680,
            'password' => bcrypt('123456'),
            'member_type_id' => 4,
            'phone_number' => '1234567890',
        ]);
        $user5 = User::factory()->create([
            'user_id' => 12345681,
            'password' => bcrypt('123456'),
            'member_type_id' => 5,
            'phone_number' => '1234567890',
        ]);

        $waiter1 = User::factory()->create([
            'user_id' => 12345682,
            'password' => bcrypt('123456'),
            'phone_number' => '1234567890',
        ]);
        $waiter2 = User::factory()->create([
            'user_id' => 12345683,
            'password' => bcrypt('123456'),
            'phone_number' => '1234567890',
        ]);


        $user->assignRole('user');
        $user2->assignRole('user');
        $user3->assignRole('user');
        $user4->assignRole('user');
        $user5->assignRole('user');

        $waiter1->assignRole('waiter');
        $waiter2->assignRole('waiter');
    }
}