<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\Tenant\FloorDatabaseSeeder;
use Database\Seeders\Tenant\KitchenDatabaseSeeder;
use Database\Seeders\Tenant\OrderDatabaseSeeder;
use Database\Seeders\Tenant\PermissionsDatabaseSeeder;
use Database\Seeders\Tenant\ProductDatabaseSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MemberTypeSeeder::class,
            FloorDatabaseSeeder::class,
            PermissionsDatabaseSeeder::class,
            KitchenDatabaseSeeder::class,
            ProductDatabaseSeeder::class,
            // OrderDatabaseSeeder::class
        ]);

        // Create Super Admin
        $superAdmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@gmail.com',
            'password' => bcrypt('12345678'),
        ]);

        // Create Tenant
        $tenantName = 'Afohs';
        $tenantEmail = 'afohs@gmail.com';
        $tenantPassword = '123456';
        $subdomain = strtolower($tenantName);
        $fullDomain = $subdomain . '.' . config('app.domain');

        $tenant = Tenant::create([
            'id' => strtolower($tenantName),
            'name' => $tenantName,
            'email' => $tenantEmail,
            'password' => $tenantPassword,
        ]);

        $tenant->domains()->create([
            'domain' => $fullDomain,
        ]);

        // Format the output
        $output = <<<TEXT

            ==================== 🌐 App Setup Complete ====================

            Super Admin:
                URL:       http://localhost:8000
                Login URL: http://localhost:8000/login
                Email:     {$superAdmin->email}
                Password:  12345678

            Tenant ({$tenant->name}):
                id:        12345678
                URL:       http://{$fullDomain}:8000
                Login URL: http://{$fullDomain}:8000/login
                Email:     {$tenant->email}
                Password:  {$tenantPassword}

            ==============================================================

            TEXT;

        // Show in terminal
        $this->command->info($output);
    }
}