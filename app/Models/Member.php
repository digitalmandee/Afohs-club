<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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
        'expiry_extended_by',
        'expiry_extension_date',
        'expiry_extension_reason',
        'auto_expiry_calculated',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'category_ids' => 'array',
        'is_document_missing' => 'boolean',
        'documents' => 'array',
        'date_of_birth' => 'date',
        'card_expiry_date' => 'date',
        'expiry_extension_date' => 'datetime',
        'auto_expiry_calculated' => 'boolean',
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

    public function membershipInvoice()
    {
        return $this->hasOne(FinancialInvoice::class, 'member_id', 'id')
            ->where('fee_type', 'membership_fee')
            ->orderBy('id', 'desc');
    }

    public function pausedHistories()
    {
        return $this
            ->hasMany(MemberStatusHistory::class, 'member_id', 'id')
            ->where('status', 'pause')
            ->whereNull('used_up_to');
    }

    /**
     * Calculate the current age of the member
     */
    public function getAgeAttribute()
    {
        if (!$this->date_of_birth) {
            return null;
        }

        return $this->date_of_birth->diffInYears(now());
    }

    /**
     * Check if member is a family member (has parent_id)
     */
    public function isFamilyMember()
    {
        return !is_null($this->parent_id);
    }

    /**
     * Check if family member should be expired based on age
     */
    public function shouldExpireByAge()
    {
        return $this->isFamilyMember() && 
               $this->age >= 25 && 
               $this->status !== 'expired' &&
               !$this->hasValidExtension();
    }

    /**
     * Check if member has a valid expiry extension
     */
    public function hasValidExtension()
    {
        if (is_null($this->expiry_extension_date)) {
            return false;
        }
        
        // Convert to Carbon if it's a string
        $extensionDate = $this->expiry_extension_date instanceof \Carbon\Carbon 
            ? $this->expiry_extension_date 
            : \Carbon\Carbon::parse($this->expiry_extension_date);
            
        return $extensionDate->isFuture();
    }

    /**
     * Calculate automatic expiry date based on 25th birthday
     */
    public function calculateAutoExpiryDate()
    {
        if (!$this->date_of_birth) {
            return null;
        }

        return $this->date_of_birth->copy()->addYears(25);
    }

    /**
     * Expire family member due to age
     */
    public function expireByAge($reason = 'Automatic expiry - Member reached 25 years of age')
    {
        $this->update([
            'status' => 'expired',
            'card_status' => 'Expired',
            'updated_by' => Auth::id() ?? 1, // System user
        ]);

        // Log the status change
        $this->statusHistories()->create([
            'status' => 'expired',
            'reason' => $reason,
            'start_date' => now()->toDateString(),
            'end_date' => null, // No end date for expired status
            'created_by' => Auth::id() ?? 1,
        ]);
    }

    /**
     * Extend expiry date for family member (Super Admin only)
     */
    public function extendExpiry($extensionDate, $reason, $extendedBy)
    {
        // Convert string date to Carbon object if needed
        $carbonDate = is_string($extensionDate) ? Carbon::parse($extensionDate) : $extensionDate;
        
        $this->update([
            'expiry_extension_date' => $carbonDate,
            'expiry_extension_reason' => $reason,
            'expiry_extended_by' => $extendedBy,
            'status' => 'active', // Reactivate if expired
            'updated_by' => $extendedBy,
        ]);

        // Log the extension
        $this->statusHistories()->create([
            'status' => 'extended',
            'reason' => "Expiry extended until {$carbonDate->format('Y-m-d')}: {$reason}",
            'start_date' => now()->toDateString(),
            'end_date' => $carbonDate->toDateString(),
            'created_by' => $extendedBy,
        ]);
    }

    /**
     * Scope to get family members who should be expired by age
     */
    public function scopeFamilyMembersToExpire($query)
    {
        return $query->whereNotNull('parent_id')
                    ->whereNotNull('date_of_birth')
                    ->whereRaw('TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) >= 25')
                    ->where('status', '!=', 'expired')
                    ->where(function($q) {
                        $q->whereNull('expiry_extension_date')
                          ->orWhere('expiry_extension_date', '<', now());
                    });
    }

    /**
     * Relationship to the user who extended the expiry
     */
    public function expiryExtendedBy()
    {
        return $this->belongsTo(User::class, 'expiry_extended_by');
    }
}
