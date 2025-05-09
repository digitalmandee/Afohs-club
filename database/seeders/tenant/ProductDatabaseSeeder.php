<?php

namespace Database\Seeders\Tenant;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Category::factory()->count(10)->hasProducts(6)->create();
    }
}