<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('rooms')->insert([
            [
                'name' => 'Standard Room',
                'number_of_beds' => 2,
                'max_capacity' => 4,
                'price_per_night' => 120.00,
                'number_of_bathrooms' => 1,
                'photo_path' => 'images/standard.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Deluxe Suite',
                'number_of_beds' => 3,
                'max_capacity' => 6,
                'price_per_night' => 200.00,
                'number_of_bathrooms' => 2,
                'photo_path' => 'images/deluxe.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Economy Room',
                'number_of_beds' => 1,
                'max_capacity' => 2,
                'price_per_night' => 80.00,
                'number_of_bathrooms' => 1,
                'photo_path' => 'images/economy.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
