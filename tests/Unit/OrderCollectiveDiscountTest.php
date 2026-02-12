<?php

use App\Http\Controllers\OrderController;

test('collective discount applies to discountable items and respects max discount', function () {
    $controller = new OrderController();

    $items = [
        [
            'id' => 10,
            'name' => 'Discountable',
            'quantity' => 1,
            'price' => 100,
            'variants' => [],
            'discount_value' => 0,
            'discount_type' => 'percentage',
            'discount_amount' => 0,
        ],
        [
            'id' => 11,
            'name' => 'Non-discountable',
            'quantity' => 1,
            'price' => 200,
            'variants' => [],
            'discount_value' => 5,
            'discount_type' => 'percentage',
            'discount_amount' => 10,
        ],
        [
            'id' => 12,
            'name' => 'Max percent cap',
            'quantity' => 1,
            'price' => 100,
            'variants' => [],
        ],
        [
            'id' => 13,
            'name' => 'Max amount cap',
            'quantity' => 2,
            'price' => 100,
            'variants' => [],
        ],
    ];

    $productsById = [
        10 => [
            'is_discountable' => true,
            'max_discount' => null,
            'max_discount_type' => null,
            'base_price' => 100,
        ],
        11 => [
            'is_discountable' => false,
            'max_discount' => null,
            'max_discount_type' => null,
            'base_price' => 200,
        ],
        12 => [
            'is_discountable' => true,
            'max_discount' => 10,
            'max_discount_type' => 'percentage',
            'base_price' => 100,
        ],
        13 => [
            'is_discountable' => true,
            'max_discount' => 20,
            'max_discount_type' => 'amount',
            'base_price' => 100,
        ],
    ];

    $ref = new ReflectionClass(OrderController::class);
    $method = $ref->getMethod('applyCollectiveDiscountToItems');
    $method->setAccessible(true);

    $result = $method->invoke($controller, $items, $productsById, 30.0);

    expect($result[0]['discount_type'])->toBe('percentage');
    expect($result[0]['discount_value'])->toBe(30.0);
    expect($result[0]['discount_amount'])->toBe(30.0);

    expect($result[1]['discount_value'])->toBe(5);
    expect($result[1]['discount_type'])->toBe('percentage');
    expect($result[1]['discount_amount'])->toBe(10);

    expect($result[2]['discount_value'])->toBe(10.0);
    expect($result[2]['discount_amount'])->toBe(10.0);

    expect($result[3]['discount_value'])->toBe(20.0);
    expect($result[3]['discount_amount'])->toBe(40.0);
});

