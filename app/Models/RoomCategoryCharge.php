<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoomCategoryCharge extends Model
{
    use SoftDeletes;

    protected $fillable = ['room_category_id', 'room_id', 'amount', 'status', 'created_by', 'updated_by', 'deleted_by'];
}
