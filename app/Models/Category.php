<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Category extends BaseModel
{
    use HasFactory, SoftDeletes;

    protected $table = 'pos_categories';

    protected $fillable = [
        'name',
        'image',
        'tenant_id',
        'status',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
