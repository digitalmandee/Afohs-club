<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends BaseModel
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'created_by', 'updated_by', 'deleted_by'];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function subdepartments()
    {
        return $this->hasMany(Subdepartment::class);
    }
}
