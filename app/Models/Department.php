<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends BaseModel
{
    use HasFactory;

    protected $fillable = ['name', 'created_by', 'updated_by', 'deleted_by'];
}
