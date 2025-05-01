<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'menu_code' => $this->faker->bothify('MC-###'),
            'description' => $this->faker->paragraph(),
            'images' => [$this->faker->imageUrl()],
            'category_id' => Category::factory(),
            'base_price' => $this->faker->randomFloat(2, 10, 100),
            'cost_of_goods_sold' => $this->faker->randomFloat(2, 5, 50),
            'current_stock' => $this->faker->numberBetween(0, 100),
            'minimal_stock' => $this->faker->numberBetween(1, 10),
            'notify_when_out_of_stock' => $this->faker->boolean(),
            'available_order_types' => ['dine_in', 'take_away'],
        ];
    }
}