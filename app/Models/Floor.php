<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Floor extends Model
{
    protected $fillable = ['name', 'area', 'status'];

    public function tables()
    {
        return $this->hasMany(Table::class);
    }
}
