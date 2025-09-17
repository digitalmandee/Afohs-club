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
        'parent_user_id',
        'tenant_id',
        'profile_photo'
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

    public function member()
    {
        return $this->hasOne(Member::class);
    }

    public function employee()
    {
        return $this->hasOne(Employee::class);
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
    public function familyMembers()
    {
        return $this->hasMany(User::class, 'parent_user_id');
    }

    public function statusHistories()
    {
        return $this->hasMany(MemberStatusHistory::class);
    }

    /**
     * Set the password for a new user.
     *
     * @param  string  $password
     * @return $this
     */
    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = $password ? $password : Hash::make(1234);
    }
}
