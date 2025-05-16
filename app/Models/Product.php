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
        'kitchen_id',
        'menu_code',
        'description',
        'images',
        'category_id',
        'base_price',
        'cost_of_goods_sold',
        'current_stock',
        'minimal_stock',
        'notify_when_out_of_stock',
        'available_order_types',
        'status'
    ];

    protected $casts = [
        'images' => 'array',
        'available_order_types' => 'array',
    ];

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);  // Or many-to-many if applicable
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function kitchen()
    {
        return $this->belongsTo(User::class, 'kitchen_id', 'id');
    }
}
