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
        $memberTypes = [
            [
                'name' => 'Basic',
                'duration' => 3,
                'fee' => 5000,
                'maintenance_fee' => 500,
                'discount_type' => 'percentage',
                'discount_value' => 0,
                'benefit' => ['Access to gym floor', 'locker room'],
            ],
            [
                'name' => 'Premium',
                'duration' => 6,
                'fee' => 9000,
                'maintenance_fee' => 800,
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'benefit' => ['Access to gym', 'pool', 'sauna'],
            ],
            [
                'name' => 'Silver',
                'duration' => 3,
                'fee' => 4000,
                'maintenance_fee' => 400,
                'discount_type' => 'percentage',
                'discount_value' => 5,
                'benefit' => ['Access to gym floor'],
            ],
            [
                'name' => 'Gold',
                'duration' => 6,
                'fee' => 8000,
                'maintenance_fee' => 700,
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'benefit' => ['Access to gym', 'sauna'],
            ],
            [
                'name' => 'Applied Member',
                'duration' => 1,
                'fee' => 1000,
                'maintenance_fee' => 100,
                'discount_type' => 'amount',
                'discount_value' => 0,
                'benefit' => ['Access to lobby'],
            ],
            [
                'name' => 'Affiliated Member',
                'duration' => 12,
                'fee' => 12000,
                'maintenance_fee' => 1100,
                'discount_type' => 'percentage',
                'discount_value' => 25,
                'benefit' => ['Access to gym', 'pool', 'sauna', 'guest pass'],
            ],
            [
                'name' => 'VIP Guest',
                'duration' => 1,
                'fee' => 2000,
                'maintenance_fee' => 200,
                'discount_type' => 'amount',
                'discount_value' => 0,
                'benefit' => ['Access to VIP lounge'],
            ],
            [
                'name' => 'Employee',
                'duration' => 12,
                'fee' => 0,
                'maintenance_fee' => 0,
                'discount_type' => 'percentage',
                'discount_value' => 0,
                'benefit' => ['Full access'],
            ],
            [
                'name' => 'Platinum',
                'duration' => 12,
                'fee' => 20000,
                'maintenance_fee' => 1500,
                'discount_type' => 'percentage',
                'discount_value' => 30,
                'benefit' => ['All-access pass with personal trainer and nutritionist'],
            ],
        ];

        foreach ($memberTypes as $memberType) {
            MemberType::create($memberType);
        }
    }
}