<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventMenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_menu_id',
        'name',
        'amount',
        'status',
    ];
}