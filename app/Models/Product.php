<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'menu_code',
        'description',
        'images',
        'category_id',
        'base_price',
        'cost_of_goods_sold',
        'stock_quantity',
        'minimal_stock',
        'notify_when_out_of_stock',
        'available_order_types',
    ];

    protected $casts = [
        'images' => 'array',
        'available_order_types' => 'array',
    ];
}