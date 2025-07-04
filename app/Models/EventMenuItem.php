<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventMenuItem extends BaseModel
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_menu_id',
        'name',
        'amount',
        'status',
    ];
}
