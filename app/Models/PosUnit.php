<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PosUnit extends Model
{
    use SoftDeletes;

    protected $fillable = ['tenant_id', 'name', 'status', 'created_by', 'updated_by', 'deleted_by'];
}
