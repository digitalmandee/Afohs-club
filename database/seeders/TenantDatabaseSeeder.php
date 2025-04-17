<?php

namespace Database\Seeders;

use Database\Seeders\Tenant\PermissionsDatabaseSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(PermissionsDatabaseSeeder::class);

        //
    }
}