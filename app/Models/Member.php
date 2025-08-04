<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'application_no',
        'membership_no',
        'member_type_id',
        'member_category_id',
        'profile_photo',
        'parent_id',
        'family_suffix',
        'first_name',
        'middle_name',
        'last_name',
        'full_name',
        'relation',
        'phone_number',
        'start_date',
        'end_date',
        'picture',
        'membership_date',
        'card_status',
        'status',
        'card_issue_date',
        'card_expiry_date',
        'from_date',
        'to_date',
        'picture',
        'member_image',
        'qr_code',
        'invoice_id',
        'is_document_missing',
        'missing_documents',
        'coa_account',
        'title',
        'state',
        'application_number',
        'name_comments',
        'guardian_name',
        'guardian_membership',
        'nationality',
        'cnic_no',
        'passport_no',
        'gender',
        'ntn',
        'date_of_birth',
        'education',
        'membership_reason',
        'mobile_number_a',
        'mobile_number_b',
        'mobile_number_c',
        'telephone_number',
        'personal_email',
        'critical_email',
        'emergency_name',
        'emergency_relation',
        'emergency_contact',
        'current_address',
        'current_city',
        'current_country',
        'permanent_address',
        'permanent_city',
        'permanent_country',
        'country',
        'documents',
    ];

    protected $casts = [
        'category_ids' => 'array',
        'is_document_missing' => 'boolean',
        'documents' => 'array',
        'education' => 'array',
        'date_of_birth' => 'date',
    ];

    public static function generateNextMembershipNumber(): string
    {
        $lastNumber = self::orderBy('id', 'desc')
            ->pluck('membership_no')
            ->map(function ($number) {
                // Extract the base numeric part (e.g., from "AR 002", "PR 1000-1")
                preg_match('/\b(\d+)\b/', $number, $matches);
                return isset($matches[1]) ? (int) $matches[1] : 0;
            })
            ->max() ?? 0;

        $next = $lastNumber + 1;

        // Minimum 3 digits, but will grow if needed (e.g., "001", "099", "1000")
        return str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }

    public static function generateNextApplicationNo(): string
    {
        $last = self::whereNotNull('application_no')
            ->pluck('application_no')
            ->map(fn($no) => (int) $no)
            ->max() ?? 0;

        $next = $last + 1;

        if ($next > 99) {
            throw new \Exception('Application number limit reached.');
        }

        return $next;
    }

    public function memberType()
    {
        return $this->belongsTo(MemberType::class);
    }

    public function memberCategory()
    {
        return $this->belongsTo(MemberCategory::class);
    }

    public function primaryMember()
    {
        return $this->belongsTo(Member::class, 'primary_member_id');
    }

    public function userDetail()
    {
        return $this->belongsTo(UserDetail::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(Member::class, 'parent_id', 'user_id');
    }

    public function familyMembers()
    {
        return $this->hasMany(Member::class, 'parent_id', 'user_id');
    }

    public function pausedHistories()
    {
        return $this
            ->hasMany(MemberStatusHistory::class, 'user_id', 'user_id')
            ->where('status', 'pause')
            ->whereNull('used_up_to');
    }
}