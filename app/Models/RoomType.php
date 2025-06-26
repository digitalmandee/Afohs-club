<?php


namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class RoomType extends BaseModel
{
    use SoftDeletes;

    protected $fillable = ['name', 'created_by', 'updated_by', 'deleted_by'];
}