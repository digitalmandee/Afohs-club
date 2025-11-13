<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Product extends BaseModel
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
        'current_stock',
        'minimal_stock',
        'discount',
        'discount_type',
        'notify_when_out_of_stock',
        'available_order_types',
        'status',
        'tenant_id',
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

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Relationship with ingredients through pivot table
     */
    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'product_ingredients', 'product_id', 'ingredient_id')
                    ->withPivot('quantity_used', 'cost')
                    ->withTimestamps();
    }

    /**
     * Get the product ingredients pivot records
     */
    public function productIngredients()
    {
        return $this->hasMany(ProductIngredient::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

}
