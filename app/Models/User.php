<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'member_type_id',
        'phone_number',
        'first_name',
        'middle_name',
        'last_name',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the member type associated with the user.
     */
    public function memberType()
    {
        return $this->belongsTo(MemberType::class);
    }

    /**
     * Get the user's detail.
     */
    public function userDetail()
    {
        return $this->hasOne(UserDetail::class);
    }

    /**
     * Get the kitchen detail.
     */
    public function kitchenDetail()
    {
        return $this->hasOne(kitchenDetail::class, 'kitchen_id', 'id');
    }

    /**
     * Set the password for a new user.
     *
     * @param  string  $password
     * @return $this
     */
    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = $password ? $password : Hash::make(123456);
    }
}