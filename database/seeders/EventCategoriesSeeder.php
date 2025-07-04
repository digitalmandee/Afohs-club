<?php

namespace Database\Seeders;

use App\Models\EventMenuCategory;
use Illuminate\Database\Seeder;

class EventCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Assorted Naan', 'status' => 'active'],
            ['name' => 'Chicken Qorma or Karari', 'status' => 'active'],
            ['name' => 'Chicken Biryani', 'status' => 'active'],
            ['name' => 'Salad 3 Types', 'status' => 'active'],
            ['name' => 'Raita', 'status' => 'active'],
            ['name' => 'Desert One Type', 'status' => 'active'],
            ['name' => 'Mineral Water', 'status' => 'active'],
            ['name' => 'Soft Drinks', 'status' => 'active'],
            ['name' => 'Mutton Qorma or Karahi', 'status' => 'active'],
            ['name' => 'Chicken Kabab or Chicken Boti', 'status' => 'active'],
            ['name' => 'Chicken Achari Karahi or Murgh Chana', 'status' => 'active'],
            ['name' => 'Puri or Pathore', 'status' => 'active'],
            ['name' => 'Aloo Bhujia', 'status' => 'active'],
            ['name' => 'Halwa', 'status' => 'active'],
            ['name' => 'Hot & Sour or Chicken Corn Soup', 'status' => 'active'],
            ['name' => 'Fried Fish', 'status' => 'active'],
            ['name' => 'Chicken Kabab', 'status' => 'active'],
            ['name' => 'Chicken Boti', 'status' => 'active'],
            ['name' => 'Chicken Manchurian or Sweet & Sour', 'status' => 'active'],
            ['name' => 'Chicken Fried or Egg Fried Rice', 'status' => 'active'],
            ['name' => 'Chicken Karahi', 'status' => 'active'],
        ];

        foreach ($categories as $category) {
            EventMenuCategory::updateOrCreate(
                ['name' => $category['name']],
                ['status' => $category['status']]
            );
        }
    }
}
