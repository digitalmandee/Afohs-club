<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image',
        'tenant_id',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}