<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class EmployeeType extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    // Auto-generate slug from name if not provided
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($employeeType) {
            $slug = Str::slug($employeeType->name);
            if (EmployeeType::where('slug', $slug)->exists()) {
                throw new \Exception('Slug already exists');
            }
            $employeeType->slug = $slug;
        });

        static::updating(function ($employeeType) {
            $slug = Str::slug($employeeType->name);
            if (EmployeeType::where('slug', $slug)->where('id', '!=', $employeeType->id)->exists()) {
                throw new \Exception('Slug already exists');
            }
            $employeeType->slug = $slug;
        });
    }
}
