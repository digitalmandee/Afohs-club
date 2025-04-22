<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use HasFactory;

    // Allow mass assignment for these attributes
    protected $fillable = ['floor_id', 'table_no', 'capacity'];

    // Define the relationship with the Floor model
    public function floor()
    {
        return $this->belongsTo(Floor::class);
    }
}
