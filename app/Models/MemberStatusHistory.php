<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemberStatusHistory extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'reason',
        'start_date',
        'end_date',
        'created_by',
        'updated_by',
        'deleted_by',
        'used_up_to'
    ];
}
