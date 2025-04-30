<?php

namespace Database\Seeders\Tenant;

use App\Models\Order;
use Illuminate\Database\Seeder;

class OrderDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Order::factory()->count(5)->hasOrderTakings(3)->create();
    }
}
