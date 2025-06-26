<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'name',
        'number_of_beds',
        'max_capacity',
        'number_of_bathrooms',
        'photo_path',
        'room_type_id'
    ];
}
