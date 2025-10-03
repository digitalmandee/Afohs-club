<?php

namespace Database\Seeders;

use App\Models\EmployeeType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [['name' => 'Cashier', 'slug' => 'cashier'], ['name' => 'Waiter', 'slug' => 'waiter'], ['name' => 'Chef', 'slug' => 'chef']];

        foreach ($types as $type) {
            EmployeeType::firstOrCreate($type);
        }
    }
}