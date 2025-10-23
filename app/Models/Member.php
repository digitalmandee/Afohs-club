<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends BaseModel
{
    use SoftDeletes;

    protected $fillable = [
        'application_no',
        'old_family_id',
        'old_member_id',
        'barcode_no',
        'membership_no',
        'member_type_id',
        'member_category_id',
        'profile_photo',
        'kinship',
        'parent_id',
        'family_suffix',
        'first_name',
        'middle_name',
        'last_name',
        'full_name',
        'relation',
        'martial_status',
        'phone_number',
        'start_date',
        'end_date',
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
        'coa_category_id',
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
        'reason',
        'blood_group',
        'tel_number_a',
        'tel_number_b',
        'active_remarks',
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
        'classification_id',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'category_ids' => 'array',
        'is_document_missing' => 'boolean',
        'documents' => 'array',
        'date_of_birth' => 'date',
    ];

    public static function generateNextMembershipNumber(): string
    {
        $lastNumber = self::orderBy('id', 'desc')
            ->whereNull('parent_id')
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
            ->whereNull('parent_id')
            ->pluck('application_no')
            ->map(fn($no) => (int) $no)
            ->max() ?? 0;

        $next = $last + 1;

        return $next;
    }

    public function memberType()
    {
        return $this->belongsTo(MemberType::class);
    }

    public function kinshipMember()
    {
        return $this->belongsTo(Member::class, 'kinship', 'id');
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
        return $this->belongsTo(Member::class, 'parent_id', 'id');
    }

    public function familyMembers()
    {
        return $this->hasMany(Member::class, 'parent_id', 'id');
    }

    public function statusHistories()
    {
        return $this->hasMany(MemberStatusHistory::class, 'member_id', 'id');
    }

    public function pausedHistories()
    {
        return $this
            ->hasMany(MemberStatusHistory::class, 'member_id', 'id')
            ->where('status', 'pause')
            ->whereNull('used_up_to');
    }
}
