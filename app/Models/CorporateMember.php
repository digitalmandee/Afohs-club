<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class CorporateMember extends BaseModel
{
    use SoftDeletes;

    protected $table = 'corporate_members';

    protected $fillable = [
        'old_family_id',
        'old_member_id',
        'barcode_no',
        'membership_no',
        'application_number',
        'member_category_id',
        'corporate_company_id',
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
        'classification_id',
        'expiry_extended_by',
        'expiry_extension_date',
        'expiry_extension_reason',
        'auto_expiry_calculated',
        'created_by',
        'updated_by',
        'deleted_by',
        'business_developer_id',
        'membership_fee',
        'additional_membership_charges',
        'membership_fee_additional_remarks',
        'membership_fee_discount',
        'membership_fee_discount_remarks',
        'total_membership_fee',
        'maintenance_fee',
        'additional_maintenance_charges',
        'maintenance_fee_additional_remarks',
        'maintenance_fee_discount',
        'maintenance_fee_discount_remarks',
        'total_maintenance_fee',
        'per_day_maintenance_fee',
        'comment_box',
    ];

    protected $casts = [
        'category_ids' => 'array',
        'is_document_missing' => 'boolean',
        'date_of_birth' => 'date',
        'card_expiry_date' => 'date',
        'expiry_extension_date' => 'datetime',
        'auto_expiry_calculated' => 'boolean',
    ];

    protected $appends = [
        'membership_duration',
        'membership_start_date'
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($member) {
            if ($member->isForceDeleting()) {
                $member->familyMembers()->forceDelete();
                $member->media()->forceDelete();
                $member->professionInfo()->forceDelete();
            } else {
                $member->familyMembers()->delete();
                $member->media()->delete();
                $member->professionInfo()->delete();
            }
        });

        static::restored(function ($member) {
            $member->familyMembers()->restore();
            $member->media()->restore();
            $member->professionInfo()->restore();
        });
    }

    public static function generateNextMembershipNumber(): string
    {
        $lastNumber = self::orderBy('id', 'desc')
            ->whereNull('parent_id')
            ->pluck('membership_no')
            ->map(function ($number) {
                preg_match('/\b(\d+)\b/', $number, $matches);
                return isset($matches[1]) ? (int) $matches[1] : 0;
            })
            ->max() ?? 0;

        $next = $lastNumber + 1;
        return 'C-' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
    }

    public static function generateNextApplicationNo()
    {
        $lastMember = self::orderBy('id', 'desc')->first();
        if ($lastMember && preg_match('/CORP-(\d+)/', $lastMember->application_number, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }
        return 'CORP-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function kinshipMember()
    {
        return $this->belongsTo(CorporateMember::class, 'kinship', 'id');
    }

    public function memberCategory()
    {
        return $this->belongsTo(MemberCategory::class);
    }

    public function primaryMember()
    {
        return $this->belongsTo(CorporateMember::class, 'primary_member_id');
    }

    public function parent()
    {
        return $this->belongsTo(CorporateMember::class, 'parent_id', 'id');
    }

    public function familyMembers()
    {
        return $this->hasMany(CorporateMember::class, 'parent_id', 'id');
    }

    public function statusHistories()
    {
        return $this->hasMany(MemberStatusHistory::class, 'corporate_member_id', 'id');
    }

    public function membershipInvoice()
    {
        return $this
            ->hasOne(FinancialInvoice::class, 'corporate_member_id', 'id')
            ->where('fee_type', 'membership_fee')
            ->orderBy('id', 'desc');
    }

    public function professionInfo()
    {
        return $this->hasOne(MemberProfessionInfo::class, 'corporate_member_id');
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function profilePhoto()
    {
        return $this
            ->morphOne(Media::class, 'mediable')
            ->where('type', 'profile_photo')
            ->latest();
    }

    public function documents()
    {
        return $this
            ->morphMany(Media::class, 'mediable')
            ->where('type', 'member_docs');
    }

    public function getAgeAttribute()
    {
        if (!$this->date_of_birth) {
            return null;
        }
        return $this->date_of_birth->diffInYears(now());
    }

    public function isFamilyMember()
    {
        return !is_null($this->parent_id);
    }

    public function getMembershipDurationAttribute()
    {
        $startDate = $this->membership_date ? Carbon::parse($this->membership_date) : $this->created_at;

        if (!$startDate) {
            return 'N/A';
        }

        try {
            $now = Carbon::now();
            $totalMonths = $startDate->diffInMonths($now);
            $years = intval($totalMonths / 12);
            $months = $totalMonths % 12;

            if ($years > 0) {
                if ($months > 0) {
                    return $years . ' year' . ($years > 1 ? 's' : '') . ', ' . $months . ' month' . ($months > 1 ? 's' : '');
                } else {
                    return $years . ' year' . ($years > 1 ? 's' : '');
                }
            } else {
                if ($months <= 0) {
                    return 'Less than 1 month';
                }
                return $months . ' month' . ($months > 1 ? 's' : '');
            }
        } catch (\Exception $e) {
            return 'Invalid date';
        }
    }

    public function getMembershipStartDateAttribute()
    {
        return $this->membership_date ?: $this->created_at;
    }

    public function businessDeveloper()
    {
        return $this->belongsTo(Employee::class, 'business_developer_id');
    }
}
