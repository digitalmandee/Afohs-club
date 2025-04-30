<?php

namespace Database\Factories;

use App\Models\OrderTaking;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderTakingFactory extends Factory
{
    protected $model = OrderTaking::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'order_item' => [
                'item' => $this->faker->word(),
                'qty' => $this->faker->numberBetween(1, 5),
                'price' => $this->faker->randomFloat(2, 10, 100),
            ],
            'status' => $this->faker->randomElement(['pending', 'completed', 'cancelled']),
        ];
    }
}
