<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MemberType;

class MemberTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        MemberType::insert([
            [
                'name' => 'Basic',
                'duration' => 3,
                'fee' => 5000,
                'maintenance_fee' => 500,
                'discount' => 10,
                'discount_authorized' => true,
                'benefit' => 'Access to gym floor and locker room',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Premium',
                'duration' => 6,
                'fee' => 9000,
                'maintenance_fee' => 800,
                'discount' => 15,
                'discount_authorized' => true,
                'benefit' => 'Access to gym, pool, and sauna',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'VIP',
                'duration' => 12,
                'fee' => 15000,
                'maintenance_fee' => 1000,
                'discount' => 20,
                'discount_authorized' => true,
                'benefit' => 'All-access pass with personal trainer',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
