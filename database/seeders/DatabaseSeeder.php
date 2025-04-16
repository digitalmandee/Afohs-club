<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@gmail.com',
            'password' => bcrypt('12345678'),
        ]);

        // Create Tenant
        $tenantName = 'Afohs';
        $tenantEmail = 'afohs@gmail.com';
        $tenantPassword = '12345678';
        $subdomain = strtolower($tenantName);
        $fullDomain = $subdomain . '.' . config('app.domain');

        $tenant = Tenant::create([
            'name' => $tenantName,
            'email' => $tenantEmail,
            'password' => bcrypt($tenantPassword),
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