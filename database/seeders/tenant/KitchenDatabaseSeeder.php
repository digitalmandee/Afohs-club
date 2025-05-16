<?php

namespace Database\Seeders\Tenant;

use App\Models\Category;
use App\Models\KitchenDetail;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class KitchenDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $kitchen = User::create([
                'name' => "kitchen $i",
                'user_id' => 1234569 . $i,
                'email' => "kitchen$i@kitchen",
                'password' => bcrypt('123456'),
            ]);

            $kitchen->assignRole('kitchen', 'web');

            KitchenDetail::create([
                'kitchen_id' => $kitchen->id,
            ]);
        }
    }
}
