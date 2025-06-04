<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\Tenant\FloorDatabaseSeeder;
use Database\Seeders\Tenant\KitchenDatabaseSeeder;
use Database\Seeders\Tenant\OrderDatabaseSeeder;
use Database\Seeders\Tenant\PermissionsDatabaseSeeder;
use Database\Seeders\Tenant\ProductDatabaseSeeder;
use Database\Seeders\Tenant\RestuarantDatabaseSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MemberTypeSeeder::class,
            PermissionsDatabaseSeeder::class,
            RestuarantDatabaseSeeder::class,
            FloorDatabaseSeeder::class,
            KitchenDatabaseSeeder::class,
            ProductDatabaseSeeder::class,
            // OrderDatabaseSeeder::class
        ]);
    }
}