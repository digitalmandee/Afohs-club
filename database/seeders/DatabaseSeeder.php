<?php

namespace Database\Seeders;

use App\Models\RoomCategory;
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
            RoomCategorySeeder::class,
            RoomTypeSeeder::class,
            RoomOtherChargesSeeder::class,
            RoomSeeder::class,
            GuestTypeSeeder::class,
            SubscriptionSeeder::class,
            MemberTypeSeeder::class,
            PermissionsDatabaseSeeder::class,
            RestuarantDatabaseSeeder::class,
            FloorDatabaseSeeder::class,
            KitchenDatabaseSeeder::class,
            ProductDatabaseSeeder::class,
            MemberCategorySeeder::class,
            BookingEventSeeder::class,
            BookingSeeder::class,
            // OrderDatabaseSeeder::class
        ]);
    }
}