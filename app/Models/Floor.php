<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Floor extends Model
{
    protected $fillable = ['name', 'area'];

    public function tables()
    {
        return $this->hasMany(Table::class);
    }
}
