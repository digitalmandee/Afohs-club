<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_id',
        'member_type_id',
        'phone_number',
        'profile_photo',
        'addresses',
        'address',
    ];

    protected $casts = [
        'addresses' => 'array',
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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function memberType()
    {
        return $this->belongsTo(MemberType::class);
    }

    public function userDetail()
    {
        return $this->hasMany(UserDetail::class)->where('status', 'active');
    }

    public function userDetails()
    {
        return $this->hasMany(UserDetail::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}