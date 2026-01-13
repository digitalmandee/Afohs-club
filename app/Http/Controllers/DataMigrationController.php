<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\CorporateMember;
use App\Models\FinancialInvoice;
use App\Models\Media;
use App\Models\Member;
use App\Models\MemberCategory;
use App\Models\SubscriptionType;
use App\Models\TransactionType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class DataMigrationController extends Controller
{
    public function index()
    {
        // Get statistics for migration dashboard
        $stats = $this->getMigrationStats();

        return Inertia::render('App/Admin/DataMigration/Index', [
            'stats' => $stats
        ]);
    }

    public function getMigrationStats()
    {
        try {
            // Check if old tables exist
            $oldTablesExist = $this->checkOldTablesExist();

            if (!$oldTablesExist) {
                return [
                    'old_tables_exist' => false,
                    'message' => 'Old tables (memberships, mem_families) not found in database'
                ];
            }

            $oldMembersCount = DB::table('memberships')->count();
            $oldFamiliesCount = DB::table('mem_families')->count();
            $oldMediaCount = DB::table('old_media')->count();
            $oldEmployeesCount = DB::table('old_afohs.hr_employments')->count();
            $newMembersCount = Member::whereNull('parent_id')->count();
            $newFamiliesCount = Member::whereNotNull('parent_id')->count();
            $newMediaCount = Media::count();
            $newEmployeesCount = \App\Models\Employee::whereNotNull('old_employee_id')->count();

            // Check migration status
            $migratedMembersCount = Member::whereNull('parent_id')
                ->where('status', '!=', 'deleted')  // using status or just count all specific
                ->count();

            $migratedFamiliesCount = Member::whereNotNull('parent_id')
                ->whereNotNull('cnic_no')
                ->count();

            $migratedMediaCount = Media::whereNotNull('mediable_id')->count();

            $migratedMediaCount = Media::whereNotNull('mediable_id')->count();

            $pendingQrCodesCount = Member::whereNull('qr_code')->orWhere('qr_code', '')->count();

            return [
                'pending_qr_codes_count' => $pendingQrCodesCount,
                'old_tables_exist' => true,
                'old_members_count' => $oldMembersCount,
                'old_families_count' => $oldFamiliesCount,
                'old_media_count' => $oldMediaCount,
                'new_members_count' => $newMembersCount,
                'new_families_count' => $newFamiliesCount,
                'new_media_count' => $newMediaCount,
                'migrated_members_count' => $migratedMembersCount,
                'migrated_families_count' => $migratedFamiliesCount,
                'migrated_media_count' => $migratedMediaCount,
                'members_migration_percentage' => $oldMembersCount > 0 ? round(($migratedMembersCount / $oldMembersCount) * 100, 2) : 0,
                'families_migration_percentage' => $oldFamiliesCount > 0 ? round(($migratedFamiliesCount / $oldFamiliesCount) * 100, 2) : 0,
                'media_migration_percentage' => $oldMediaCount > 0 ? round(($migratedMediaCount / $oldMediaCount) * 100, 2) : 0,
                // Invoice Stats
                'old_invoices_count' => DB::connection('old_afohs')->table('finance_invoices')->whereIn('charges_type', [3, 4])->whereNotNull('member_id')->count(),
                'migrated_invoices_count' => FinancialInvoice::whereIn('invoice_type', ['membership', 'maintenance'])->count(),
                'invoices_migration_percentage' => DB::connection('old_afohs')->table('finance_invoices')->whereIn('charges_type', [3, 4])->whereNotNull('member_id')->count() > 0
                    ? round((FinancialInvoice::whereIn('invoice_type', ['membership', 'maintenance'])->count() / DB::connection('old_afohs')->table('finance_invoices')->whereIn('charges_type', [3, 4])->whereNotNull('member_id')->count()) * 100, 2)
                    : 0,
                // Corporate Stats
                'old_corporate_members_count' => DB::connection('old_afohs')->table('corporate_memberships')->count(),
                'old_corporate_families_count' => DB::connection('old_afohs')->table('corporate_mem_families')->count(),
                'corporate_members_count' => CorporateMember::whereNull('parent_id')->count(),
                'corporate_families_count' => CorporateMember::whereNotNull('parent_id')->count(),
                'corporate_members_migration_percentage' => DB::connection('old_afohs')->table('corporate_memberships')->count() > 0
                    ? round((CorporateMember::whereNull('parent_id')->count() / DB::connection('old_afohs')->table('corporate_memberships')->count()) * 100, 2)
                    : 0,
                'corporate_families_migration_percentage' => DB::connection('old_afohs')->table('corporate_mem_families')->count() > 0
                    ? round((CorporateMember::whereNotNull('parent_id')->count() / DB::connection('old_afohs')->table('corporate_mem_families')->count()) * 100, 2)
                    : 0,
                'pending_corporate_qr_codes_count' => CorporateMember::whereNull('qr_code')->orWhere('qr_code', '')->count(),
                // Customer Stats
                'old_customers_count' => DB::connection('old_afohs')->table('customers')->count(),
                'new_customers_count' => \App\Models\Customer::count(),
                'customers_migration_percentage' => DB::connection('old_afohs')->table('customers')->count() > 0
                    ? round((\App\Models\Customer::count() / DB::connection('old_afohs')->table('customers')->count()) * 100, 2)
                    : 0,
                // Employee Stats
                'old_employees_count' => $oldEmployeesCount,
                'new_employees_count' => $newEmployeesCount,
                'employees_migration_percentage' => $oldEmployeesCount > 0 ? round(($newEmployeesCount / $oldEmployeesCount) * 100, 2) : 0,
                // Transaction Types Stats
                'old_transaction_types_count' => DB::connection('old_afohs')->table('trans_types')->count(),
                'migrated_transaction_types_count' => \App\Models\TransactionType::withTrashed()->count(),
                // Financial Invoices (All)
                'old_financial_invoices_count' => DB::connection('old_afohs')->table('finance_invoices')->distinct('invoice_no')->count('invoice_no'),
                'migrated_financial_invoices_count' => \App\Models\FinancialInvoice::withTrashed()->count(),
            ];
        } catch (\Exception $e) {
            Log::error('Error getting migration stats: ' . $e->getMessage());
            return [
                'old_tables_exist' => false,
                'error' => 'Error accessing database: ' . $e->getMessage()
            ];
        }
    }

    private function checkOldTablesExist()
    {
        try {
            $tables = DB::select("SHOW TABLES LIKE 'memberships'");
            $familyTables = DB::select("SHOW TABLES LIKE 'mem_families'");

            // Check for finance_invoices table in old database connection if possible, or just assume it exists if others do
            // Better to check explicitly if we can
            try {
                $invoiceTables = DB::select("SHOW TABLES LIKE 'finance_invoices'");
            } catch (\Exception $e) {
                $invoiceTables = [];  // Connection might fail or table might not exist
            }

            return !empty($tables) && !empty($familyTables);
        } catch (\Exception $e) {
            return false;
        }
    }

    public function migrateMembers(Request $request)
    {
        $batchSize = $request->get('batch_size', 100);
        $offset = $request->get('offset', 0);

        try {
            DB::beginTransaction();

            // Get batch of old members
            $oldMembers = DB::table('memberships')
                ->offset($offset)
                ->limit($batchSize)
                ->get();

            Log::info("Processing batch: offset={$offset}, found " . count($oldMembers) . ' records');

            $migrated = 0;
            $errors = [];

            foreach ($oldMembers as $oldMember) {
                try {
                    $this->migrateSingleMember($oldMember);
                    $migrated++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'member_id' => $oldMember->id,
                        'application_no' => $oldMember->application_no ?? 'N/A',
                        'membership_no' => $oldMember->mem_no ?? 'N/A',
                        'name' => $oldMember->applicant_name ?? 'N/A',
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                        'file' => basename($e->getFile())
                    ];
                    Log::error("Error migrating member {$oldMember->id} ({$oldMember->applicant_name}): " . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'migrated' => $migrated,
                'errors' => $errors,
                'has_more' => count($oldMembers) == $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Migration batch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function migrateSingleMember($oldMember)
    {
        // Check if member already exists using old_member_id first, then other criteria
        $existingMember = Member::where('old_member_id', $oldMember->id)
            ->whereNull('parent_id')
            ->first();

        // If not found by old_member_id, check by other criteria
        if (!$existingMember) {
            $query = Member::whereNull('parent_id');

            // Fallback: check by membership_no and name if application_no is empty
            $query
                ->where('membership_no', $oldMember->mem_no)
                ->where('full_name', $oldMember->applicant_name);

            $existingMember = $query->first();
        }

        if ($existingMember) {
            Log::info("Skipping member {$oldMember->id} - already exists");
            return;  // Skip if already migrated
        }

        Log::info("Migrating member {$oldMember->id}");

        // Get member category ID
        $memberCategoryId = $this->getMemberCategoryId($oldMember->mem_category_id);

        // Prepare member data
        $memberData = [
            'old_member_id' => $oldMember->id,
            'membership_no' => $oldMember->mem_no,
            'membership_date' => $this->validateDate($oldMember->membership_date),
            'full_name' => trim(preg_replace('/\s+/', ' ', $oldMember->title . ' ' . $oldMember->first_name . ' ' . $oldMember->middle_name)),
            'member_category_id' => $memberCategoryId,
            'member_type_id' => 13,
            'classification_id' => $oldMember->mem_classification_id ?? null,
            'card_status' => $this->mapCardStatus($oldMember->card_status ?? null),
            'guardian_name' => $oldMember->father_name ?? null,
            'guardian_membership' => $oldMember->father_mem_no ?? null,
            'cnic_no' => $oldMember->cnic ?? null,
            'date_of_birth' => $this->validateDate($oldMember->date_of_birth),
            'gender' => $oldMember->gender ?? null,
            'education' => $oldMember->education ?? null,
            'ntn' => $oldMember->ntn ?? null,
            'reason' => $oldMember->reason ?? null,
            'blood_group' => $oldMember->blood_group ?? null,
            'mobile_number_a' => $oldMember->mob_a ?? null,
            'mobile_number_b' => $oldMember->mob_b ?? null,
            'tel_number_a' => $oldMember->tel_a ?? null,
            'tel_number_b' => $oldMember->tel_b ?? null,
            'personal_email' => $oldMember->personal_email ?? null,
            'critical_email' => $oldMember->official_email ?? null,
            'card_issue_date' => $this->validateDate($oldMember->card_issue_date),
            'barcode_no' => $oldMember->mem_barcode ?? null,
            'profile_photo' => $this->migrateProfilePhoto($oldMember->mem_picture ?? null),
            'status' => $this->mapMemberStatus($oldMember->active),
            'permanent_address' => $oldMember->per_address ?? null,
            'permanent_city' => $oldMember->per_city ?? null,
            'permanent_country' => $oldMember->per_country ?? null,
            'current_address' => $oldMember->cur_address ?? null,
            'current_city' => $oldMember->cur_city ?? null,
            'current_country' => $oldMember->cur_country ?? null,
            'card_expiry_date' => $this->validateDate($oldMember->card_exp),
            'active_remarks' => $oldMember->active_remarks ?? null,
            'from_date' => $this->validateDate($oldMember->from),
            'to_date' => $this->validateDate($oldMember->to),
            'emergency_name' => $oldMember->emergency_name ?? null,
            'emergency_relation' => $oldMember->emergency_relation ?? null,
            'emergency_contact' => $oldMember->emergency_contact ?? null,
            'passport_no' => $oldMember->passport_no ?? null,
            'title' => $oldMember->title ?? null,
            'first_name' => $oldMember->first_name ?? null,
            'middle_name' => $oldMember->middle_name ?? null,
            'name_comments' => $oldMember->name_comment ?? null,
            'kinship' => $oldMember->kinship ?? null,
            'coa_category_id' => $oldMember->coa_category_id ?? null,
            'nationality' => $oldMember->nationality ?? null,
            'created_at' => $this->validateDate($oldMember->created_at),
            'updated_at' => $this->validateDate($oldMember->updated_at),
            'deleted_at' => $this->validateDate($oldMember->deleted_at),
            'created_by' => $oldMember->created_by ?? null,
            'updated_by' => $oldMember->updated_by ?? null,
            'deleted_by' => $oldMember->deleted_by ?? null,
        ];

        // Create new member
        Member::create($memberData);
    }

    public function migrateFamilies(Request $request)
    {
        $batchSize = $request->get('batch_size', 100);
        $offset = $request->get('offset', 0);

        try {
            DB::beginTransaction();

            // Get batch of old family members
            $oldFamilies = DB::table('mem_families')
                ->offset($offset)
                ->limit($batchSize)
                ->get();

            $migrated = 0;
            $errors = [];

            foreach ($oldFamilies as $oldFamily) {
                try {
                    $this->migrateSingleFamily($oldFamily);
                    $migrated++;
                } catch (\Exception $e) {
                    // Get parent membership number for better error tracking
                    $parentMembershipNo = $oldFamily->membership_number;

                    $errors[] = [
                        'family_id' => $oldFamily->id,
                        'member_id' => $oldFamily->member_id ?? 'N/A',
                        'parent_membership_no' => $parentMembershipNo,
                        'family_membership_no' => $oldFamily->sup_card_no ?? 'N/A',
                        'name' => ($oldFamily->title ?? '') . ' ' . ($oldFamily->first_name ?? '') . ' ' . ($oldFamily->middle_name ?? ''),
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                        'file' => basename($e->getFile())
                    ];
                    Log::error("Error migrating family member {$oldFamily->id} ({$oldFamily->name}): " . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'migrated' => $migrated,
                'errors' => $errors,
                'has_more' => count($oldFamilies) == $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Family migration batch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function migrateSingleFamily($oldFamily)
    {
        // Find parent member by old_member_id instead of application_no
        $parentMember = Member::where('old_member_id', $oldFamily->member_id)
            ->whereNull('parent_id')
            ->first();

        if (!$parentMember) {
            throw new \Exception("Parent member not found for family member ID: {$oldFamily->id}");
        }

        // Check if family member already exists using old_family_id
        $existingFamily = Member::where('old_family_id', $oldFamily->id)
            ->first();

        if ($existingFamily) {
            return;  // Skip if already migrated
        }

        // Generate unique membership number for family member
        $familyMembershipNo = $oldFamily->sup_card_no;

        // Prepare family member data
        $familyData = [
            'old_family_id' => $oldFamily->id,
            'parent_id' => $parentMember->id,
            'full_name' => trim(preg_replace('/\s+/', ' ', $oldFamily->title . ' ' . $oldFamily->first_name . ' ' . $oldFamily->middle_name)),
            'first_name' => $oldFamily->first_name,
            'middle_name' => $oldFamily->middle_name,
            'date_of_birth' => $this->validateDate($oldFamily->date_of_birth),
            'relation' => $this->mapFamilyRelation($oldFamily->fam_relationship),
            'nationality' => $oldFamily->nationality,
            'cnic_no' => $oldFamily->cnic,
            'mobile_number_a' => $oldFamily->contact,
            'martial_status' => $oldFamily->maritial_status,
            'gender' => $oldFamily->gender ?? null,
            'membership_no' => $familyMembershipNo,
            'card_status' => $this->mapCardStatus($oldFamily->card_status),
            'card_issue_date' => $this->validateDate($oldFamily->sup_card_issue),
            'card_expiry_date' => $this->validateDate($oldFamily->sup_card_exp),
            'barcode_no' => $oldFamily->sup_barcode,
            'status' => $this->mapMemberStatus($oldFamily->status),
            'created_at' => $this->validateDate($oldFamily->created_at),
            'updated_at' => $this->validateDate($oldFamily->updated_at),
            'deleted_at' => $this->validateDate($oldFamily->deleted_at),
            'created_by' => $oldFamily->created_by,
            'updated_by' => $oldFamily->updated_by,
            'deleted_by' => $oldFamily->deleted_by,
        ];

        // Create family member
        Member::create($familyData);
    }

    private function getMemberCategoryId($oldCategoryId)
    {
        // Check if oldCategoryId has valid data before querying
        if (empty($oldCategoryId) || is_null($oldCategoryId)) {
            Log::info('getMemberCategoryId: oldCategoryId is empty or null');
            return null;
        }

        // Check if it's a valid numeric ID
        if (!is_numeric($oldCategoryId)) {
            Log::info("getMemberCategoryId: oldCategoryId is not numeric: {$oldCategoryId}");
            return null;
        }

        try {
            // Get old category data
            $oldCategory = DB::table('mem_categories')->where('id', $oldCategoryId)->first();

            if (!$oldCategory) {
                return null;
            }

            // Find matching new category by name
            $newCategory = MemberCategory::where('name', $oldCategory->unique_code)->first();

            return $newCategory ? $newCategory->id : null;
        } catch (\Exception $e) {
            Log::error('getMemberCategoryId: Database error - ' . $e->getMessage());
            return null;
        }
    }

    private function mapCardStatus($oldStatus)
    {
        // Check if oldStatus has valid data before mapping
        if (empty($oldStatus) || is_null($oldStatus)) {
            return 'Not Applicable';
        }

        $statusMap = [
            'issued' => 'Issued',
            'not_applicable' => 'Not Applicable',
            'in_process' => 'In-Process',
            'printed' => 'Printed',
            'received' => 'Received',
            're_printed' => 'Re-Printed',
            'e_card_issued' => 'E-Card Issued',
        ];

        return $statusMap[strtolower($oldStatus)] ?? 'Not Applicable';
    }

    private function mapMemberStatus($oldStatus)
    {
        // Check if oldStatus has valid data before querying
        if (empty($oldStatus) || is_null($oldStatus)) {
            return 'active';  // Default status
        }

        // Check if it's a valid numeric ID
        if (!is_numeric($oldStatus)) {
            return 'active';  // Default status for non-numeric values
        }

        // Get status from mem_statuses table
        try {
            $status = DB::table('mem_statuses')->where('id', $oldStatus)->first();

            if ($status) {
                // Map status name to new enum values
                $statusMap = [
                    'active' => 'active',
                    'expired' => 'expired',
                    'suspended' => 'suspended',
                    'terminated' => 'terminated',
                    'absent' => 'absent',
                    'cancelled' => 'cancelled',
                    'not assign' => 'not_assign',
                    'manual inactive' => 'suspended',
                    'not qualified' => 'not_assign',
                    'transferred' => 'terminated',
                    'in suspension process' => 'in_suspension_process',
                ];

                $mappedStatus = $statusMap[strtolower($status->desc)] ?? null;

                if ($mappedStatus === null) {
                    Log::error("mapMemberStatus: Status '{$status->desc}' (ID: {$oldStatus}) not found in mapping");
                    throw new \Exception("Status '{$status->desc}' (ID: {$oldStatus}) not found in mapping. Please add mapping for this status.");
                }

                return $mappedStatus;
            } else {
                Log::error("mapMemberStatus: Status ID {$oldStatus} not found in mem_statuses table");
                throw new \Exception("Status ID {$oldStatus} not found in mem_statuses table.");
            }
        } catch (\Exception $e) {
            Log::error('Error mapping member status: ' . $e->getMessage());
            throw $e;  // Re-throw the exception to be caught by migration error handling
        }
    }

    private function mapFamilyRelation($oldRelation)
    {
        // Check if oldRelation has valid data before querying
        if (empty($oldRelation) || is_null($oldRelation)) {
            Log::info('mapFamilyRelation: oldRelation is empty or null');
            return null;
        }

        // Check if it's a valid numeric ID
        if (!is_numeric($oldRelation)) {
            Log::info("mapFamilyRelation: oldRelation is not numeric: {$oldRelation}");
            return $oldRelation;  // Return as-is if it's already a string relation
        }

        // Get relation from mem_relations table
        try {
            $relation = DB::table('mem_relations')->where('id', $oldRelation)->first();

            if ($relation) {
                return $relation->desc;
            } else {
                Log::info("mapFamilyRelation: No relation found for ID: {$oldRelation}");
                return $oldRelation;
            }
        } catch (\Exception $e) {
            Log::error('mapFamilyRelation: Database error - ' . $e->getMessage());
            return $oldRelation;
        }
    }

    private function migrateProfilePhoto($oldPhotoPath)
    {
        if (!$oldPhotoPath) {
            return null;
        }

        // Only change the path name, don't move or save files
        // Convert: public/upload/xxxxx.png to tenants/default/membership/xxxxx.png
        return 'tenants/default/membership/' . basename($oldPhotoPath);
    }

    private function migrateFamilyPhoto($oldPhotoPath)
    {
        if (!$oldPhotoPath) {
            return null;
        }

        // Only change the path name, don't move or save files
        // Convert: public/familymemberupload/xxxxx.png to tenants/default/familymembers/xxxxx.png
        return 'tenants/default/familymembers/' . basename($oldPhotoPath);
    }

    public function resetMigration(Request $request)
    {
        try {
            DB::beginTransaction();

            // Disable foreign key checks temporarily
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Force delete all migrated data (bypass soft delete) - first delete family members (children), then primary members
            // Get all family members including soft deleted ones and force delete them
            $familyMembers = Member::withTrashed()->whereNotNull('parent_id')->get();
            foreach ($familyMembers as $familyMember) {
                $familyMember->forceDelete();
            }

            // Get all primary members including soft deleted ones and force delete them
            $primaryMembers = Member::withTrashed()->whereNull('parent_id')->get();
            foreach ($primaryMembers as $primaryMember) {
                $primaryMember->forceDelete();
            }

            // Reset auto-increment counter to start from 1
            DB::statement('ALTER TABLE members AUTO_INCREMENT = 1;');

            // DB::truncate('members');

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            DB::commit();

            Log::info('Migration data reset completed - all records permanently deleted');

            return response()->json([
                'success' => true,
                'message' => 'Migration data reset successfully - all records permanently deleted'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Make sure to re-enable foreign key checks even on error
            try {
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            } catch (\Exception $fkError) {
                Log::error('Error re-enabling foreign key checks: ' . $fkError->getMessage());
            }

            Log::error('Reset migration error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resetFamiliesOnly(Request $request)
    {
        try {
            DB::beginTransaction();

            // Disable foreign key checks temporarily
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Force delete only family members (children), keep primary members
            $familyMembers = Member::withTrashed()->whereNotNull('parent_id')->get();
            foreach ($familyMembers as $familyMember) {
                $familyMember->forceDelete();
            }

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            DB::commit();

            Log::info('Family members reset completed - all family member records permanently deleted');

            return response()->json([
                'success' => true,
                'message' => 'Family members reset successfully - all family member records permanently deleted'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Make sure to re-enable foreign key checks even on error
            try {
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            } catch (\Exception $fkError) {
                Log::error('Error re-enabling foreign key checks: ' . $fkError->getMessage());
            }

            Log::error('Reset families error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteProfilePhotos(Request $request)
    {
        try {
            DB::beginTransaction();

            // Delete all media records where type is 'profile_photo' (including soft deleted ones)
            $mediaRecords = \App\Models\Media::withTrashed()->where('type', 'profile_photo')->get();
            $deletedCount = $mediaRecords->count();

            foreach ($mediaRecords as $media) {
                $media->forceDelete();  // Permanently delete including soft deleted records
            }

            DB::commit();

            Log::info('Profile photos deletion completed', [
                'deleted_count' => $deletedCount
            ]);

            return response()->json([
                'success' => true,
                'message' => "Profile photos deleted successfully - {$deletedCount} records removed",
                'deleted_count' => $deletedCount
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Delete profile photos error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function validateMigration()
    {
        try {
            $validation = [
                'members_count_match' => false,
                'families_count_match' => false,
                'sample_data_integrity' => [],
                'errors' => []
            ];

            // Count validation
            $oldMembersCount = DB::table('memberships')->count();
            $oldFamiliesCount = DB::table('mem_families')->count();
            $newMembersCount = Member::whereNull('parent_id')->count();
            $newFamiliesCount = Member::whereNotNull('parent_id')->count();

            $validation['members_count_match'] = $oldMembersCount == $newMembersCount;
            $validation['families_count_match'] = $oldFamiliesCount == $newFamiliesCount;

            // Sample data integrity check
            $sampleOldMembers = DB::table('memberships')->limit(5)->get();
            foreach ($sampleOldMembers as $oldMember) {
                $newMember = Member::where('application_no', $oldMember->application_no)->first();

                if ($newMember) {
                    $validation['sample_data_integrity'][] = [
                        'old_id' => $oldMember->id,
                        'new_id' => $newMember->id,
                        'name_match' => $oldMember->applicant_name == $newMember->full_name,
                        'membership_no_match' => $oldMember->mem_no == $newMember->membership_no,
                        'cnic_match' => $oldMember->cnic == $newMember->cnic_no,
                    ];
                } else {
                    $validation['errors'][] = "Member not found: {$oldMember->application_no}";
                }
            }

            return response()->json($validation);
        } catch (\Exception $e) {
            Log::error('Validation error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function validateDate($date)
    {
        // Handle null or empty dates
        if (empty($date) || is_null($date)) {
            return null;
        }

        // Handle invalid dates like '0000-00-00' or '0000-00-00 00:00:00'
        if (strpos($date, '0000-00-00') === 0) {
            return null;
        }

        // Handle other invalid date formats
        try {
            $carbonDate = Carbon::parse($date);

            // Check if the date is valid (not year 0 or before 1900)
            if ($carbonDate->year < 1900) {
                return null;
            }

            return $date;
        } catch (\Exception $e) {
            // If Carbon can't parse it, return null
            return null;
        }
    }

    public function migrateCustomers(Request $request)
    {
        $batchSize = $request->get('batch_size', 100);
        $offset = $request->get('offset', 0);

        try {
            DB::beginTransaction();

            // Get batch of old customers from old_afohs database
            $oldCustomers = DB::table('old_afohs.customers')
                ->offset($offset)
                ->limit($batchSize)
                ->get();

            $migrated = 0;
            $errors = [];

            foreach ($oldCustomers as $oldCustomer) {
                try {
                    $this->migrateSingleCustomer($oldCustomer);
                    $migrated++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'customer_id' => $oldCustomer->id,
                        'customer_name' => $oldCustomer->customer_name ?? 'N/A',
                        'error' => $e->getMessage(),
                    ];
                    Log::error("Error migrating customer {$oldCustomer->id}: " . $e->getMessage());
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'migrated' => $migrated,
                'errors' => $errors,
                'has_more' => count($oldCustomers) == $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer migration batch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function migrateSingleCustomer($oldCustomer)
    {
        // Check if customer already exists using old_customer_id
        $existingCustomer = \App\Models\Customer::where('old_customer_id', $oldCustomer->id)->first();

        if ($existingCustomer) {
            return;  // Skip if already migrated
        }

        // Map data
        $customerData = [
            'old_customer_id' => $oldCustomer->id,
            'customer_no' => $oldCustomer->customer_no,
            'name' => $oldCustomer->customer_name,
            'address' => $oldCustomer->customer_address,
            'cnic' => $oldCustomer->customer_cnic,
            'contact' => $oldCustomer->customer_contact,
            'email' => $oldCustomer->customer_email,
            'guest_type_id' => !empty($oldCustomer->guest_type) && $oldCustomer->guest_type > 0 ? $oldCustomer->guest_type : null,
            'member_name' => $oldCustomer->member_name,
            'member_no' => $oldCustomer->mem_no,
            'account' => $oldCustomer->account,
            'affiliate' => $oldCustomer->affiliate,
            'gender' => $oldCustomer->gender,
            'created_by' => $oldCustomer->created_by,
            'updated_by' => $oldCustomer->updated_by,
            'deleted_by' => $oldCustomer->deleted_by,
            'created_at' => $this->validateDate($oldCustomer->created_at),
            'updated_at' => $this->validateDate($oldCustomer->updated_at),
            'deleted_at' => $this->validateDate($oldCustomer->deleted_at),
        ];

        \App\Models\Customer::create($customerData);
    }

    public function migrateCorporateMembers(Request $request)
    {
        $batchSize = $request->get('batch_size', 100);
        $offset = $request->get('offset', 0);

        try {
            DB::beginTransaction();

            // Sourcing from legacy memberships table, assuming filtered by category
            // or if there is a specific table for corporate, use that.
            // Since user said "same logic... only extra field is corporate company",
            // I will assume source is same memberships table but we might need to look for company info.
            // However, typical setup might have them in same table.
            // CAUTION: If "corporate company" field is in legacy table, we map it.
            // If not, we might need to defaults or lookups.
            // Assuming 'company_id' exists in source table 'memberships' or similar.
            // If not found, it will be null.

            $oldMembers = DB::table('corporate_memberships')
                // ->where('mem_category_id', 'some_corporate_id') // Optional: Filter if needed
                ->offset($offset)
                ->limit($batchSize)
                ->get();

            $migrated = 0;
            $errors = [];

            foreach ($oldMembers as $oldMember) {
                try {
                    $this->migrateSingleCorporateMember($oldMember);
                    $migrated++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'member_id' => $oldMember->id,
                        'application_no' => $oldMember->application_no ?? 'N/A',
                        'membership_no' => $oldMember->mem_no ?? 'N/A',
                        'name' => $oldMember->applicant_name ?? 'N/A',
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'migrated' => $migrated,
                'errors' => $errors,
                'has_more' => count($oldMembers) == $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Corporate Migration batch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function migrateSingleCorporateMember($oldMember)
    {
        // Check if member already exists
        $existingMember = CorporateMember::where('old_member_id', $oldMember->id)
            ->whereNull('parent_id')
            ->first();

        if ($existingMember) {
            return;
        }

        // Get member category ID
        $memberCategoryId = $this->getMemberCategoryId($oldMember->mem_category_id);

        // Map Corporate Company
        // Adjust column name 'company_id' based on actual legacy table structure
        $corporateCompanyId = isset($oldMember->corporate_company) ? $oldMember->corporate_company : null;

        // Prepare member data
        $memberData = [
            'old_member_id' => $oldMember->id,
            'application_number' => $oldMember->application_no,
            'membership_no' => $oldMember->mem_no,
            'membership_date' => $this->validateDate($oldMember->membership_date),
            'full_name' => trim(preg_replace('/\s+/', ' ', $oldMember->title . ' ' . $oldMember->first_name . ' ' . $oldMember->middle_name)),
            'member_category_id' => $memberCategoryId,
            'corporate_company_id' => $corporateCompanyId,  // Mapped field
            'card_status' => $this->mapCardStatus($oldMember->card_status ?? null),
            'guardian_name' => $oldMember->father_name ?? null,
            'guardian_membership' => $oldMember->father_mem_no ?? null,
            'cnic_no' => $oldMember->cnic ?? null,
            'date_of_birth' => $this->validateDate($oldMember->date_of_birth),
            'gender' => $oldMember->gender ?? null,
            'education' => $oldMember->education ?? null,
            'ntn' => $oldMember->ntn ?? null,
            'reason' => $oldMember->reason ?? null,
            'blood_group' => $oldMember->blood_group ?? null,
            'mobile_number_a' => $oldMember->mob_a ?? null,
            'mobile_number_b' => $oldMember->mob_b ?? null,
            'tel_number_a' => $oldMember->tel_a ?? null,
            'tel_number_b' => $oldMember->tel_b ?? null,
            'personal_email' => $oldMember->personal_email ?? null,
            'critical_email' => $oldMember->official_email ?? null,
            'card_issue_date' => $this->validateDate($oldMember->card_issue_date),
            'barcode_no' => $oldMember->mem_barcode ?? null,
            'profile_photo' => $this->migrateProfilePhoto($oldMember->mem_picture ?? null),
            'status' => $this->mapMemberStatus($oldMember->active),
            'permanent_address' => $oldMember->per_address ?? null,
            'permanent_city' => $oldMember->per_city ?? null,
            'permanent_country' => $oldMember->per_country ?? null,
            'current_address' => $oldMember->cur_address ?? null,
            'current_city' => $oldMember->cur_city ?? null,
            'current_country' => $oldMember->cur_country ?? null,
            'card_expiry_date' => $this->validateDate($oldMember->card_exp),
            'active_remarks' => $oldMember->active_remarks ?? null,
            'from_date' => $this->validateDate($oldMember->from),
            'to_date' => $this->validateDate($oldMember->to),
            'emergency_name' => $oldMember->emergency_name ?? null,
            'emergency_relation' => $oldMember->emergency_relation ?? null,
            'emergency_contact' => $oldMember->emergency_contact ?? null,
            'passport_no' => $oldMember->passport_no ?? null,
            'title' => $oldMember->title ?? null,
            'first_name' => $oldMember->first_name ?? null,
            'middle_name' => $oldMember->middle_name ?? null,
            'name_comments' => $oldMember->name_comment ?? null,
            'kinship' => $oldMember->kinship ?? null,
            'created_at' => $this->validateDate($oldMember->created_at),
            'updated_at' => $this->validateDate($oldMember->updated_at),
            'deleted_at' => $this->validateDate($oldMember->deleted_at),
            'created_by' => $oldMember->created_by ?? null,
            'updated_by' => $oldMember->updated_by ?? null,
            'deleted_by' => $oldMember->deleted_by ?? null,
        ];

        // Create new corporate member
        CorporateMember::create($memberData);
    }

    public function migrateCorporateFamilies(Request $request)
    {
        $batchSize = $request->get('batch_size', 100);
        $offset = $request->get('offset', 0);

        try {
            DB::beginTransaction();

            $oldFamilies = DB::table('corporate_mem_families')
                ->offset($offset)
                ->limit($batchSize)
                ->get();

            $migrated = 0;
            $errors = [];

            foreach ($oldFamilies as $oldFamily) {
                try {
                    $this->migrateSingleCorporateFamily($oldFamily);
                    $migrated++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'family_id' => $oldFamily->id,
                        'name' => ($oldFamily->title ?? '') . ' ' . ($oldFamily->first_name ?? ''),
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'migrated' => $migrated,
                'errors' => $errors,
                'has_more' => count($oldFamilies) == $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Corporate Family migration batch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function migrateSingleCorporateFamily($oldFamily)
    {
        // Find parent member
        $parentMember = CorporateMember::where('old_member_id', $oldFamily->member_id)
            ->whereNull('parent_id')
            ->first();

        if (!$parentMember) {
            throw new \Exception("Parent corporate member not found (old_member_id: {$oldFamily->member_id})");
        }

        // Check if family member already exists
        $existingFamily = CorporateMember::where('old_family_id', $oldFamily->id)
            ->first();

        if ($existingFamily) {
            return;
        }

        $familyMembershipNo = $oldFamily->sup_card_no;

        $familyData = [
            'old_family_id' => $oldFamily->id,
            'parent_id' => $parentMember->id,
            'full_name' => trim(preg_replace('/\s+/', ' ', $oldFamily->title . ' ' . $oldFamily->first_name . ' ' . $oldFamily->middle_name)),
            'first_name' => $oldFamily->first_name,
            'middle_name' => $oldFamily->middle_name,
            'date_of_birth' => $this->validateDate($oldFamily->date_of_birth),
            'relation' => $this->mapFamilyRelation($oldFamily->fam_relationship),
            'nationality' => $oldFamily->nationality,
            'cnic_no' => $oldFamily->cnic,
            'mobile_number_a' => $oldFamily->contact,
            'martial_status' => $oldFamily->maritial_status,
            'gender' => $oldFamily->gender ?? null,
            'membership_no' => $familyMembershipNo,
            'card_status' => $this->mapCardStatus($oldFamily->card_status),
            'card_issue_date' => $this->validateDate($oldFamily->sup_card_issue),
            'card_expiry_date' => $this->validateDate($oldFamily->sup_card_exp),
            'barcode_no' => $oldFamily->sup_barcode,
            'status' => $this->mapMemberStatus($oldFamily->status),
            'created_at' => $this->validateDate($oldFamily->created_at),
            'updated_at' => $this->validateDate($oldFamily->updated_at),
            'deleted_at' => $this->validateDate($oldFamily->deleted_at),
            'created_by' => $oldFamily->created_by,
            'updated_by' => $oldFamily->updated_by,
            'deleted_by' => $oldFamily->deleted_by,
        ];

        CorporateMember::create($familyData);
    }

    public function migrateMedia(Request $request)
    {
        $batchSize = $request->get('batch_size', 100);
        $offset = $request->get('offset', 0);

        try {
            DB::beginTransaction();

            // Get batch of old media records
            $oldMediaRecords = DB::table('old_media')
                ->offset($offset)
                ->limit($batchSize)
                ->get();

            Log::info("Processing media batch: offset={$offset}, found " . count($oldMediaRecords) . ' records');

            if ($oldMediaRecords->isEmpty()) {
                DB::commit();
                return response()->json([
                    'success' => true,
                    'processed' => 0,
                    'message' => 'No more media records to migrate'
                ]);
            }

            $processed = 0;
            $errors = [];

            foreach ($oldMediaRecords as $oldMedia) {
                try {
                    // Map trans_type to new type
                    $typeMapping = [
                        3 => 'profile_photo',  // Member profile photos
                        90 => 'member_docs',  // Member documents
                        100 => 'profile_photo',  // Family member profile photos
                    ];

                    $newType = $typeMapping[$oldMedia->trans_type] ?? null;

                    if (!$newType) {
                        Log::warning("Unknown trans_type: {$oldMedia->trans_type} for media ID: {$oldMedia->id}");
                        continue;
                    }

                    // Find the new member ID based on trans_type and old ID
                    $newMemberId = null;

                    if ($oldMedia->trans_type == 3 || $oldMedia->trans_type == 90) {
                        // For member photos and documents, check old_member_id
                        $member = Member::where('old_member_id', $oldMedia->trans_type_id)->first();
                        $newMemberId = $member ? $member->id : null;
                    } elseif ($oldMedia->trans_type == 100) {
                        // For family member photos, check old_family_id
                        $member = Member::where('old_family_id', $oldMedia->trans_type_id)->first();
                        $newMemberId = $member ? $member->id : null;
                    }

                    // Skip if member not found
                    if (!$newMemberId) {
                        Log::warning("Member not found for media ID: {$oldMedia->id}, trans_type: {$oldMedia->trans_type}, trans_type_id: {$oldMedia->trans_type_id}");
                        $errors[] = [
                            'media_id' => $oldMedia->id,
                            'error' => "Member not found (trans_type: {$oldMedia->trans_type}, old_id: {$oldMedia->trans_type_id})"
                        ];
                        continue;
                    }

                    // Transform file path based on trans_type
                    $newFilePath = $this->transformMediaPath($oldMedia->url, $oldMedia->trans_type);
                    $fileName = basename($newFilePath);

                    // Determine mediable_type based on trans_type
                    $mediableType = 'App\Models\Member';

                    // Get MIME type from file extension
                    $mimeType = $this->getMimeTypeFromPath($newFilePath);

                    // Create new media record
                    Media::create([
                        'mediable_type' => $mediableType,
                        'mediable_id' => $newMemberId,  // Use the mapped new member ID
                        'type' => $newType,
                        'file_name' => $fileName,
                        'file_path' => $newFilePath,
                        'mime_type' => $mimeType,
                        'disk' => 'public',
                        'created_at' => $this->validateDate($oldMedia->created_at),
                        'updated_at' => $this->validateDate($oldMedia->updated_at),
                        'deleted_at' => $this->validateDate($oldMedia->deleted_at),
                        'created_by' => $oldMedia->created_by,
                        'updated_by' => $oldMedia->updated_by,
                        'deleted_by' => $oldMedia->deleted_by,
                    ]);

                    $processed++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'media_id' => $oldMedia->id,
                        'error' => $e->getMessage()
                    ];
                    Log::error("Error migrating media ID {$oldMedia->id}: " . $e->getMessage());
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'processed' => $processed,
                'errors' => $errors,
                'has_more' => count($oldMediaRecords) === $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Media migration error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function transformMediaPath($oldUrl, $transType)
    {
        // Remove 'public/' prefix if exists
        $cleanUrl = str_replace('public/', '', $oldUrl);

        // Extract original filename
        $originalFileName = basename($cleanUrl);

        // Map trans_type to new directory structure
        switch ($transType) {
            case 3:  // Member profile photos
                return '/tenants/default/membership/' . $originalFileName;
            case 90:  // Member documents
                return '/tenants/default/member_documents/' . $originalFileName;
            case 100:  // Family member profile photos
                return '/tenants/default/familymembers/' . $originalFileName;
            default:
                return '/tenants/default/media/' . $originalFileName;
        }
    }

    private function getMimeTypeFromPath($path)
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }

    public function generateQrCodes(Request $request)
    {
        $batchSize = $request->get('batch_size', 50);  // Smaller batch size for image generation
        $offset = $request->get('offset', 0);

        try {
            // Get batch of members without QR codes
            // We use skip/take logic, but since we are updating records, the "offset" strategy
            // might be tricky if we re-query "whereNull" every time (the list shrinks).
            // However, the frontend sends an increasing offset.
            // IF the frontend sends offset 0, 100, 200... then we should NOT use "whereNull" with offset,
            // because the first 100 would be fixed, and the next 100 would be the *new* first 100.
            //
            // BETTER STRATEGY: The frontend logic in Index.jsx uses a fixed offset loop?
            // Let's look at Index.jsx... it passes `offset`.
            // If I use `whereNull`, I should ALWAYS use offset 0 if I'm processing a queue.
            // BUT, if the user wants to resume or if we want to show progress based on total,
            // it's safer to just query *all* members and check if they need update, OR
            // rely on the frontend to handle the "progress" visualization but the backend to just "take next batch".
            //
            // User asked: "only those create which has not"
            //
            // If I use `whereNull(...)->limit($batchSize)->get()`, I get the next batch of pending ones.
            // I don't need `offset` from the request if I'm always grabbing the "next pending".
            // BUT, if the frontend sends offset, and I ignore it, the progress bar math might be weird if it relies on offset.
            //
            // Let's stick to: Query ALL members, but only process those with missing QR codes?
            // No, that's inefficient.
            //
            // Correct approach for "Queue" processing:
            // Always take the first N records that match the "Pending" criteria.
            // Ignore the 'offset' parameter for the query itself, OR use it if we are iterating through a fixed list.
            // Since we are modifying the state (adding QR code), the "Pending" list shrinks.
            // So `offset` should effectively be 0 for the query.

            $members = Member::where(function ($query) {
                $query
                    ->whereNull('qr_code')
                    ->orWhere('qr_code', '');
            })
                ->limit($batchSize)
                ->get();

            Log::info('Processing QR code batch: found ' . count($members) . ' records');

            if ($members->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'processed' => 0,
                    'message' => 'No more members pending QR codes',
                    'has_more' => false
                ]);
            }

            $processed = 0;
            $errors = [];

            foreach ($members as $member) {
                try {
                    $qrCodeData = route('member.profile', ['id' => $member->id]);

                    // Create QR code image
                    $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);

                    // Save it
                    $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');

                    // Update member
                    $member->qr_code = $qrImagePath;
                    $member->save();

                    $processed++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'member_id' => $member->id,
                        'name' => $member->full_name,
                        'error' => $e->getMessage()
                    ];
                    Log::error("Error generating QR for member {$member->id}: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'processed' => $processed,
                'errors' => $errors,
                'has_more' => count($members) == $batchSize
            ]);
        } catch (\Exception $e) {
            Log::error('QR Code generation batch error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function generateCorporateQrCodes(Request $request)
    {
        $batchSize = $request->get('batch_size', 50);

        try {
            $members = CorporateMember::where(function ($query) {
                $query
                    ->whereNull('qr_code')
                    ->orWhere('qr_code', '');
            })
                ->limit($batchSize)
                ->get();

            Log::info('Processing Corporate QR code batch: found ' . count($members) . ' records');

            if ($members->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'processed' => 0,
                    'message' => 'No more corporate members pending QR codes',
                    'has_more' => false
                ]);
            }

            $processed = 0;
            $errors = [];

            foreach ($members as $member) {
                try {
                    $qrCodeData = route('member.profile', ['id' => $member->id, 'type' => 'corporate']);

                    // Create QR code image
                    $qrBinary = QrCode::format('png')->size(300)->generate($qrCodeData);

                    // Save it
                    $qrImagePath = FileHelper::saveBinaryImage($qrBinary, 'qr_codes');

                    // Update member
                    $member->qr_code = $qrImagePath;
                    $member->save();

                    $processed++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'member_id' => $member->id,
                        'name' => $member->full_name,
                        'error' => $e->getMessage()
                    ];
                    Log::error("Error generating Corporate QR for member {$member->id}: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'processed' => $processed,
                'errors' => $errors,
                'has_more' => count($members) == $batchSize
            ]);
        } catch (\Exception $e) {
            Log::error('Corporate QR Code generation batch error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function migrateEmployees(Request $request)
    {
        $batchSize = $request->get('batch_size', 100);
        $offset = $request->get('offset', 0);

        try {
            DB::beginTransaction();

            $oldEmployees = DB::table('old_afohs.hr_employments')
                ->offset($offset)
                ->limit($batchSize)
                ->get();

            $migrated = 0;
            $errors = [];

            foreach ($oldEmployees as $oldEmployee) {
                try {
                    $this->migrateSingleEmployee($oldEmployee);
                    $migrated++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'old_id' => $oldEmployee->id,
                        'name' => $oldEmployee->name ?? 'N/A',
                        'error' => $e->getMessage(),
                    ];
                    Log::error("Error migrating employee {$oldEmployee->id}: " . $e->getMessage());
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'migrated' => $migrated,
                'errors' => $errors,
                'has_more' => count($oldEmployees) == $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Employee migration batch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function migrateSingleEmployee($oldEmployee)
    {
        // Check if exists
        $existing = \App\Models\Employee::where('old_employee_id', $oldEmployee->id)->first();

        if ($existing) {
            return;
        }

        $employeeData = [
            'old_employee_id' => $oldEmployee->id,
            'employee_id' => $oldEmployee->barcode ?: 'OLD-' . $oldEmployee->id,
            'name' => $oldEmployee->name,
            'father_name' => $oldEmployee->father_name,
            'national_id' => $oldEmployee->cnic,
            'phone_no' => $oldEmployee->mob_a,
            'mob_b' => $oldEmployee->mob_b,
            'tel_a' => $oldEmployee->tel_a,
            'tel_b' => $oldEmployee->tel_b,
            'email' => !empty($oldEmployee->email) ? $oldEmployee->email : null,
            'address' => $oldEmployee->cur_address,
            'cur_city' => $oldEmployee->cur_city,
            'cur_country' => $oldEmployee->cur_country,
            'per_address' => $oldEmployee->per_address,
            'per_city' => $oldEmployee->per_city,
            'per_country' => $oldEmployee->per_country,
            'gender' => $oldEmployee->gender,
            'age' => $oldEmployee->age,
            'license' => $oldEmployee->license,
            'license_no' => $oldEmployee->license_no,
            'bank_details' => $oldEmployee->bank_details,
            'account_no' => $oldEmployee->account,  // Map account -> account_no
            'vehicle_details' => $oldEmployee->vehicle_details,
            'learn_of_org' => $oldEmployee->learn_of_org,
            'anyone_in_org' => $oldEmployee->anyone_in_org,
            'crime' => $oldEmployee->crime,
            'crime_details' => $oldEmployee->crime_details,
            'company' => $oldEmployee->company,
            'remarks' => $oldEmployee->remarks,
            'salary' => $oldEmployee->current_salary,  // Map current_salary -> salary
            'total_salary' => $oldEmployee->total_salary,
            'total_addon_charges' => $oldEmployee->total_addon_charges,
            'total_deduction_charges' => $oldEmployee->total_deduction_charges,
            'days' => $oldEmployee->days,
            'hours' => $oldEmployee->hours,
            'joining_date' => $oldEmployee->date_of_joining,
            'barcode' => $oldEmployee->barcode,
            'designation' => $oldEmployee->designation,
            'old_department' => $oldEmployee->department,  // Map string
            'old_subdepartment' => $oldEmployee->subdepartment,  // Map string
            'created_by' => $oldEmployee->created_by,
            'updated_by' => $oldEmployee->updated_by,
            'deleted_by' => $oldEmployee->deleted_by,
            'created_at' => $this->validateDate($oldEmployee->created_at),
            'updated_at' => $this->validateDate($oldEmployee->updated_at),
            'deleted_at' => $this->validateDate($oldEmployee->deleted_at),
        ];

        \App\Models\Employee::create($employeeData);
    }

    public function migrateFinancials(Request $request)
    {
        $stats = [
            'transaction_types' => 0,
            'invoices' => 0,
            'receipts' => 0,
            'transactions' => 0,
            'errors' => []
        ];

        try {
            DB::beginTransaction();

            $stats['transaction_types'] = $this->migrateTransactionTypes();
            $stats['receipts'] = $this->migrateReceipts();
            $stats['invoices'] = $this->migrateInvoices();
            $stats['transactions'] = $this->migrateTransactions();

            // Relations are handled within transactions or separately if needed.
            // Based on plan, we can migrate relations here too.
            $this->migrateTransactionRelations();

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Financials migrated successfully', 'stats' => $stats]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Migration failed: ' . $e->getMessage() . ' Line: ' . $e->getLine(), 'trace' => $e->getTraceAsString()], 500);
        }
    }

    public function migrateTransactionTypesPublic(Request $request)
    {
        try {
            DB::beginTransaction();
            $count = $this->migrateTransactionTypes();
            DB::commit();

            // Get total count for progress
            $total = DB::connection('old_afohs')->table('trans_types')->count();

            return response()->json([
                'success' => true,
                'message' => 'Transaction Types migrated successfully',
                'migrated' => $count,
                'total' => $total
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function migrateReceipts()
    {
        $oldReceipts = DB::connection('old_afohs')->table('finance_cash_receipts')->get();
        $count = 0;

        foreach ($oldReceipts as $old) {
            if (\App\Models\FinancialReceipt::where('id', $old->id)->exists())
                continue;

            $payer = null;
            if ($old->member_id) {
                $payer = \App\Models\Member::where('old_member_id', $old->member_id)->first();
            } elseif ($old->corporate_id) {
                $payer = \App\Models\CorporateMember::where('old_member_id', $old->corporate_id)->first();  // Use old_member_id as per plan
            } elseif ($old->customer_id) {
                $payer = \App\Models\Customer::where('old_customer_id', $old->customer_id)->first();
            }

            \App\Models\FinancialReceipt::create([
                'id' => $old->id,  // Preserve ID
                'receipt_no' => $old->receipt_no,
                'amount' => $old->total ?? 0,
                'payment_method' => $old->account == 1 ? 'Cash' : ($old->account == 2 ? 'Bank' : 'Other'),
                'receipt_date' => $this->validateDate($old->invoice_date),
                'payer_type' => $payer ? get_class($payer) : null,
                'payer_id' => $payer ? $payer->id : null,
                'remarks' => $old->remarks,
                'created_at' => $this->validateDate($old->created_at),
                'updated_at' => $this->validateDate($old->updated_at),
            ]);
            $count++;
        }
        return $count;
    }

    private function migrateInvoices()
    {
        // Group by invoice_no - Include deleted records
        $oldInvoices = DB::connection('old_afohs')
            ->table('finance_invoices')
            ->orderBy('id')
            ->get()
            ->groupBy('invoice_no');

        $count = 0;

        foreach ($oldInvoices as $invoiceNo => $rows) {
            $first = $rows->first();

            // Check if already migrated
            if (\App\Models\FinancialInvoice::where('invoice_no', $invoiceNo)->withTrashed()->exists())
                continue;

            $memberId = null;
            $corporateMemberId = null;
            $customerId = null;

            if ($first->member_id) {
                $member = \App\Models\Member::where('old_member_id', $first->member_id)->withTrashed()->first();
                $memberId = $member ? $member->id : null;
            } elseif ($first->corporate_id) {
                $corp = \App\Models\CorporateMember::where('old_member_id', $first->corporate_id)->withTrashed()->first();
                $corporateMemberId = $corp ? $corp->id : null;
            } elseif ($first->customer_id) {
                $cust = \App\Models\Customer::where('old_customer_id', $first->customer_id)->withTrashed()->first();
                $customerId = $cust ? $cust->id : null;
            }

            // Create Header
            $invoice = \App\Models\FinancialInvoice::create([
                'invoice_no' => $invoiceNo,
                'member_id' => $memberId,
                'corporate_member_id' => $corporateMemberId,
                'customer_id' => $customerId,
                'issue_date' => $this->validateDate($first->invoice_date),
                // period_start and period_end removed as per request (exist in items)
                'total_price' => $rows->sum('grand_total'),
                'remarks' => $first->comments,
                'status' => 'unpaid',
                'created_at' => $this->validateDate($first->created_at),
                'updated_at' => $this->validateDate($first->updated_at),
                'deleted_at' => $first->deleted_at ? $this->validateDate($first->deleted_at) : null,
            ]);

            // Create Items
            foreach ($rows as $row) {
                $familyMember = null;
                if ($row->family) {
                    $familyMember = \App\Models\Member::where('old_family_id', $row->family)->first();
                }

                $feeTypeMap = [
                    3 => 'membership_fee',
                    4 => 'maintenance_fee',
                ];
                $feeType = $feeTypeMap[$row->charges_type] ?? 'other';

                $taxAmount = ($row->sub_total * ($row->tax_percentage ?? 0)) / 100;

                \App\Models\FinancialInvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'fee_type' => $feeType,
                    'description' => $row->comments,
                    'qty' => $row->qty ?? 1,
                    'amount' => $row->charges_amount ?? 0,
                    'sub_total' => $row->sub_total ?? 0,
                    'total' => $row->grand_total ?? 0,
                    'tax_percentage' => $row->tax_percentage ?? 0,
                    'tax_amount' => $taxAmount,
                    'discount_amount' => $row->discount_amount ?? 0,
                    'discount_details' => $row->discount_details,
                    'start_date' => $this->validateDate($row->start_date),
                    'end_date' => $this->validateDate($row->end_date),
                    'family_member_id' => $familyMember ? $familyMember->id : null,
                    'additional_charges' => $row->extra_charges,
                    'remarks' => $row->comments,  // Redundant but requested
                    'data' => [
                        'per_day_amount' => $row->per_day_amount,
                        'days' => $row->days,
                        'extra_details' => $row->extra_details,
                        'tax_details' => $row->tax_details,
                    ]
                ]);
            }
            $count++;
        }
        return $count;
    }

    public function migrateInvoicesPublic(Request $request)
    {
        $batchSize = $request->get('batch_size', 50);
        $offset = $request->get('offset', 0);

        try {
            DB::beginTransaction();

            // Get all unique invoice numbers for this batch
            $invoiceNos = DB::connection('old_afohs')
                ->table('finance_invoices')
                ->select('invoice_no')
                ->distinct()
                ->orderBy('invoice_no')
                ->offset($offset)
                ->limit($batchSize)
                ->pluck('invoice_no')
                ->toArray();

            $migrated = 0;
            $errors = [];

            if (!empty($invoiceNos)) {
                // Fetch rows for this chunk of invoices
                $rows = DB::connection('old_afohs')
                    ->table('finance_invoices')
                    ->whereIn('invoice_no', $invoiceNos)
                    ->orderBy('id')
                    ->get();

                $grouped = $rows->groupBy('invoice_no');

                foreach ($grouped as $invoiceNo => $groupRows) {
                    try {
                        $first = $groupRows->first();

                        // Check if already migrated
                        if (\App\Models\FinancialInvoice::where('invoice_no', $invoiceNo)->withTrashed()->exists())
                            continue;

                        $memberId = null;
                        $corporateMemberId = null;
                        $customerId = null;

                        if ($first->member_id) {
                            $member = \App\Models\Member::where('old_member_id', $first->member_id)->withTrashed()->first();
                            $memberId = $member ? $member->id : null;
                        } elseif ($first->corporate_id) {
                            $corp = \App\Models\CorporateMember::where('old_member_id', $first->corporate_id)->withTrashed()->first();
                            $corporateMemberId = $corp ? $corp->id : null;
                        } elseif ($first->customer_id) {
                            $cust = \App\Models\Customer::where('old_customer_id', $first->customer_id)->withTrashed()->first();
                            $customerId = $cust ? $cust->id : null;
                        }

                        // Create Header
                        $invoice = \App\Models\FinancialInvoice::create([
                            'invoice_no' => $invoiceNo,
                            'member_id' => $memberId,
                            'corporate_member_id' => $corporateMemberId,
                            'customer_id' => $customerId,
                            'name' => $first->name,  // Mapped from old table
                            'mem_no' => $first->mem_no,
                            'address' => $first->address,
                            'contact' => $first->contact,
                            'cnic' => $first->cnic,
                            'email' => $first->email,
                            'coa_code' => $first->coa_code,
                            'invoice_type' => $first->invoice_type,  // Mapped from old table (nullable now)
                            'issue_date' => $this->validateDate($first->invoice_date),
                            'total_price' => $groupRows->sum('grand_total'),
                            'remarks' => $first->comments,
                            'status' => 'unpaid',
                            'created_at' => $this->validateDate($first->created_at),
                            'updated_at' => $this->validateDate($first->updated_at),
                            'deleted_at' => $first->deleted_at ? $this->validateDate($first->deleted_at) : null,
                        ]);

                        // Create Items
                        foreach ($groupRows as $row) {
                            $familyMember = null;
                            if ($row->family) {
                                $familyMember = \App\Models\Member::where('old_family_id', $row->family)->withTrashed()->first();
                            }

                            $feeTypeMap = [
                                3 => 'membership_fee',
                                4 => 'maintenance_fee',
                                1 => 'guest_fee',
                                11 => 'subscription_fee'
                            ];

                            $chargeTypeId = null;
                            if (array_key_exists($row->charges_type, $feeTypeMap)) {
                                $feeType = $feeTypeMap[$row->charges_type];
                            } elseif (!empty($row->charges_type)) {
                                $feeType = (string) $row->charges_type;
                                $chargeTypeId = $row->charges_type;
                            } else {
                                $feeType = 'general';
                            }

                            $taxAmount = ($row->sub_total * ($row->tax_percentage ?? 0)) / 100;

                            \App\Models\FinancialInvoiceItem::create([
                                'invoice_id' => $invoice->id,
                                'fee_type' => $feeType,
                                'financial_charge_type_id' => $chargeTypeId,
                                'description' => $row->comments,
                                'qty' => $row->qty ?? 1,
                                'amount' => $row->charges_amount ?? 0,
                                'sub_total' => $row->sub_total ?? 0,
                                'total' => $row->grand_total ?? 0,
                                'tax_percentage' => $row->tax_percentage ?? 0,
                                'tax_amount' => $taxAmount,
                                'discount_amount' => $row->discount_amount ?? 0,
                                'discount_details' => $row->discount_details,
                                'discount_type' => 'percent',
                                'discount_value' => $row->discount_percentage ?? 0,
                                'start_date' => $this->validateDate($row->start_date),
                                'end_date' => $this->validateDate($row->end_date),
                                'family_member_id' => $familyMember ? $familyMember->id : null,
                                'additional_charges' => $row->extra_charges ?? 0,
                                'extra_percentage' => $row->extra_percentage ?? 0,
                                'overdue_percentage' => $row->overdue_percentage ?? 0,
                                'remarks' => $row->comments,
                                'data' => [
                                    'per_day_amount' => $row->per_day_amount,
                                    'days' => $row->days,
                                    'extra_details' => $row->extra_details,
                                    'tax_details' => $row->tax_details,
                                ]
                            ]);
                        }
                        $migrated++;
                    } catch (\Exception $e) {
                        $errors[] = [
                            'invoice_no' => $invoiceNo,
                            'error' => $e->getMessage()
                        ];
                    }
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'migrated' => $migrated,
                'errors' => $errors,
                'has_more' => count($invoiceNos) == $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function migrateTransactions()
    {
        $count = 0;

        DB::connection('old_afohs')
            ->table('transactions')
            ->orderBy('id')
            ->chunk(1000, function ($oldTrans) use (&$count) {
                foreach ($oldTrans as $t) {
                    $payable = null;
                    if ($t->trans_moc) {
                        $payable = \App\Models\Member::where('old_member_id', $t->trans_moc)->first();
                        if (!$payable)
                            $payable = \App\Models\CorporateMember::where('old_member_id', $t->trans_moc)->first();
                        if (!$payable)
                            $payable = \App\Models\Customer::where('old_customer_id', $t->trans_moc)->first();
                    }

                    $referenceType = null;
                    $referenceId = null;

                    if ($t->debit_or_credit == 1) {
                        // Invoice (Debit)
                        $oldInvoiceRow = DB::connection('old_afohs')->table('finance_invoices')->where('id', $t->trans_type_id)->first();
                        if ($oldInvoiceRow) {
                            $newInvoice = \App\Models\FinancialInvoice::where('invoice_no', $oldInvoiceRow->invoice_no)->first();
                            if ($newInvoice) {
                                $referenceType = \App\Models\FinancialInvoice::class;
                                $referenceId = $newInvoice->id;
                            }
                        }
                    } else {
                        // Receipt (Credit)
                        if ($t->receipt_id) {
                            $newReceipt = \App\Models\FinancialReceipt::find($t->receipt_id);
                            if ($newReceipt) {
                                $referenceType = \App\Models\FinancialReceipt::class;
                                $referenceId = $newReceipt->id;
                            }
                        }
                    }

                    \App\Models\Transaction::create([
                        'amount' => $t->trans_amount,
                        'type' => $t->debit_or_credit == 1 ? 'debit' : 'credit',
                        'payable_type' => $payable ? get_class($payable) : null,
                        'payable_id' => $payable ? $payable->id : null,
                        'reference_type' => $referenceType,
                        'reference_id' => $referenceId,
                        'created_at' => $this->validateDate($t->created_at),
                        'updated_at' => $this->validateDate($t->updated_at),
                    ]);
                    $count++;
                }
            });

        return $count;
    }

    public function getOldTransactionTypesPublic()
    {
        try {
            $types = DB::connection('old_afohs')
                ->table('trans_types')
                ->select('id', 'name')
                ->orderBy('id')
                ->get();
            return response()->json($types);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getPendingInvoicesCount(Request $request)
    {
        $typeId = $request->get('type_id');
        if (!$typeId) {
            return response()->json(['count' => 0]);
        }

        try {
            // Count invoices in old db with this charge type
            // Note: Invoices are grouped by invoice_no, so we count distinct invoice_no
            $count = DB::connection('old_afohs')
                ->table('finance_invoices')
                ->where('charges_type', $typeId)
                ->distinct('invoice_no')
                ->count('invoice_no');

            // Check established count (optional, but good for UI "Pending" logic)
            // But getting exact "pending" (Old - New) is hard without mapping every single one.
            // For now, return Total Old Records count for that type.
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Atomic Deep Migration for Invoices
     */
    public function migrateInvoicesDeep(Request $request)
    {
        $batchSize = $request->get('batch_size', 50);
        $oldTransTypeId = $request->get('old_trans_type_id');

        if (!$oldTransTypeId) {
            return response()->json(['success' => false, 'error' => 'Transaction Type ID required'], 400);
        }

        try {
            DB::beginTransaction();

            // 1. Fetch Batch of Invoices
            // We need to find invoices that are NOT yet migrated.
            // Complex to check "not migrated" efficiently in SQL across DBs.
            // Strategy: Get chunk from old DB, check existence in foreach.
            // To make "chunk" effective (skipping already processed), we might need offset.
            // But if we simply iterate all, it's slow.
            // Better: User provides offset from frontend loop.

            $offset = $request->get('offset', 0);

            $invoiceNos = DB::connection('old_afohs')
                ->table('finance_invoices')
                ->where('charges_type', $oldTransTypeId)
                ->select('invoice_no')
                ->distinct()
                ->orderBy('invoice_no')
                ->offset($offset)
                ->limit($batchSize)
                ->pluck('invoice_no')
                ->toArray();

            if (empty($invoiceNos)) {
                DB::commit();
                return response()->json(['success' => true, 'migrated' => 0, 'has_more' => false]);
            }

            $rows = DB::connection('old_afohs')
                ->table('finance_invoices')
                ->whereIn('invoice_no', $invoiceNos)
                ->get();

            $grouped = $rows->groupBy('invoice_no');
            $migratedCount = 0;
            $errors = [];

            foreach ($grouped as $invoiceNo => $groupRows) {
                try {
                    // Check if exists
                    if (FinancialInvoice::where('invoice_no', $invoiceNo)->exists()) {
                        continue;
                    }

                    $first = $groupRows->first();

                    // --- A. Migrate Invoice Header & Items ---
                    $invoice = $this->createInvoiceFromLegacy($first, $groupRows, $oldTransTypeId);

                    // --- B. Migrate Debit Transaction ---
                    $this->migrateDebitTransaction($invoiceNo, $first->id, $invoice);

                    // --- C. Atomic Receipt & Relation Migration ---
                    $this->migrateRelatedReceipts($invoice);

                    $migratedCount++;
                } catch (\Exception $e) {
                    $errors[] = ['invoice_no' => $invoiceNo, 'error' => $e->getMessage()];
                    Log::error("Deep migration error for invoice $invoiceNo: " . $e->getMessage());
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'migrated' => $migratedCount,
                'errors' => $errors,
                'has_more' => count($invoiceNos) == $batchSize
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    private function createInvoiceFromLegacy($first, $groupRows, $typeId)
    {
        // Resolve Payer
        $memberId = null;
        $corpId = null;
        $custId = null;

        if ($first->member_id) {
            $m = Member::where('old_member_id', $first->member_id)->first();
            $memberId = $m ? $m->id : null;
        } elseif ($first->corporate_id) {
            $c = CorporateMember::where('old_member_id', $first->corporate_id)->first();
            $corpId = $c ? $c->id : null;
        } elseif ($first->customer_id) {
            $cu = \App\Models\Customer::where('old_customer_id', $first->customer_id)->first();
            $custId = $cu ? $cu->id : null;
        }

        // Map Type & Reference IDs
        $feeType = 'custom';
        $finChargeTypeId = null;
        $subTypeId = null;

        if ($typeId == 3) {
            $feeType = 'membership_fee';
        } elseif ($typeId == 4) {
            $feeType = 'maintenance_fee';
        } else {
            // Lookup Legacy Definition to decide strategy
            $legacyDef = DB::connection('old_afohs')->table('trans_types')->where('id', $typeId)->first();

            if ($legacyDef) {
                if ($legacyDef->type == 3) {
                    // --- SUBSCRIPTION STRATEGY ---
                    // Link to "Monthly Subscription" Generic TransactionType AND Specific SubscriptionType
                    $feeType = 'subscription_fee';

                    $generic = TransactionType::where('name', 'Monthly Subscription')->first();
                    $finChargeTypeId = $generic ? $generic->id : null;

                    $subTypeModel = \App\Models\SubscriptionType::where('title', $legacyDef->name)->first();
                    $subTypeId = $subTypeModel ? $subTypeModel->id : null;
                } else {
                    // --- AD-HOC / CHARGES STRATEGY ---
                    // Link directly to specific TransactionType
                    $feeType = 'custom';

                    $tt = TransactionType::where('name', $legacyDef->name)->first();
                    $finChargeTypeId = $tt ? $tt->id : null;
                }
            }
        }

        // Header
        $invoice = FinancialInvoice::create([
            'invoice_no' => $first->invoice_no,
            'member_id' => $memberId,
            'corporate_member_id' => $corpId,
            'customer_id' => $custId,
            'issue_date' => $this->validateDate($first->invoice_date),
            'total_price' => $groupRows->sum('grand_total'),
            'remarks' => $first->comments,
            'status' => 'unpaid',  // Will update later
            'created_at' => $this->validateDate($first->created_at),
            'updated_at' => $this->validateDate($first->updated_at),
        ]);

        // Items
        foreach ($groupRows as $row) {
            \App\Models\FinancialInvoiceItem::create([
                'invoice_id' => $invoice->id,
                'fee_type' => $feeType,
                'financial_charge_type_id' => $finChargeTypeId,
                'subscription_type_id' => $subTypeId,
                'description' => $row->comments,
                'amount' => $row->charges_amount ?? 0,
                'qty' => $row->qty ?? 1,
                'sub_total' => $row->sub_total ?? 0,
                'total' => $row->grand_total ?? 0,
                'tax_amount' => ($row->sub_total * ($row->tax_percentage ?? 0)) / 100,
                'start_date' => $this->validateDate($row->start_date),
                'end_date' => $this->validateDate($row->end_date),
            ]);
        }

        return $invoice;
    }

    private function migrateDebitTransaction($invoiceNo, $legacyInvoiceId, $newInvoice)
    {
        // In old system, transactions table had trans_type_id pointing to invoice ID (or sometimes invoice_no, need check)
        // Usually trans_type_id = finance_invoices.id when trans_type is invoice.

        $oldTrans = DB::connection('old_afohs')
            ->table('transactions')
            ->where('trans_type_id', $legacyInvoiceId)  // Assuming ID linkage
            ->where('debit_or_credit', 1)  // Debit
            ->first();

        if ($oldTrans) {
            \App\Models\Transaction::create([
                'amount' => $oldTrans->trans_amount,
                'type' => 'debit',
                'payable_type' => $this->getPayableType($newInvoice),
                'payable_id' => $this->getPayableId($newInvoice),
                'reference_type' => FinancialInvoice::class,
                'reference_id' => $newInvoice->id,
                'created_at' => $this->validateDate($oldTrans->created_at),
                'updated_at' => $this->validateDate($oldTrans->updated_at),
            ]);
        }
    }

    private function migrateRelatedReceipts($invoice)
    {
        // 1. Find relations in legacy DB using Invoice ID (we need the legacy ID)
        // We can get legacy ID by querying old invoice table by invoice_no again or passing it.
        // Let's query quickly.
        $oldInvoice = DB::connection('old_afohs')->table('finance_invoices')->where('invoice_no', $invoice->invoice_no)->first();
        if (!$oldInvoice)
            return;

        $relations = DB::connection('old_afohs')
            ->table('trans_relations')
            ->where('invoice', $oldInvoice->id)
            ->get();

        $totalPaid = 0;

        foreach ($relations as $rel) {
            // Receipt ID
            $receiptId = $rel->receipt;

            // Check existence
            $receipt = \App\Models\FinancialReceipt::find($receiptId);

            if (!$receipt) {
                // Must migrate NOW
                $oldReceipt = DB::connection('old_afohs')->table('finance_cash_receipts')->where('id', $receiptId)->first();
                if ($oldReceipt) {
                    $receipt = $this->migrateSingleReceipt($oldReceipt);
                }
            }

            if ($receipt) {
                // Create Relation
                \App\Models\TransactionRelation::firstOrCreate([
                    'invoice_id' => $invoice->id,
                    'receipt_id' => $receipt->id
                ], [
                    'amount' => $rel->amount
                ]);
                $totalPaid += $rel->amount;
            }
        }

        // Update Status
        if ($totalPaid >= $invoice->total_price) {
            $invoice->update(['status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $invoice->update(['status' => 'partial']);
        }
    }

    private function migrateSingleReceipt($old)
    {
        // 1. Resolve Payer
        $payerType = null;
        $payerId = null;

        // "mem_number" -> Member
        if (!empty($old->mem_number)) {
            $m = Member::where('membership_no', $old->mem_number)->first();
            $payerType = Member::class;
            $payerId = $m ? $m->id : null;
        }
        // "corporate_id" -> Corporate
        elseif (!empty($old->corporate_id)) {
            // CAREFUL: corporate_id might be ID or some code. Assuming old_member_id map.
            // If corporate_id is integer from corporate_memberships.id logic:
            $c = CorporateMember::where('old_member_id', $old->corporate_id)->first();
            $payerType = CorporateMember::class;
            $payerId = $c ? $c->id : null;
        }
        // "customer_id" -> Customer
        elseif (!empty($old->customer_id)) {
            $cu = \App\Models\Customer::where('old_customer_id', $old->customer_id)->first();
            $payerType = \App\Models\Customer::class;
            $payerId = $cu ? $cu->id : null;
        }

        // 2. Resolve Employee (Created By)
        // Map old employee_id -> Employee -> User -> created_by
        $createdBy = null;
        if (!empty($old->employee_id)) {
            // Find employee by old_employee_id
            $emp = \App\Models\Employee::where('old_employee_id', $old->employee_id)->first();
            if ($emp && $emp->user_id) {
                $createdBy = $emp->user_id;
            }
        }
        // Fallback: use current user/system if needed, or null.
        // If old data has valid employee, we used it. If not, maybe use receipt creator?
        // Fallback logic removed.
        // Priority given to employee_id as requested.

        // 3. Create Receipt
        $receiptData = [
            // 'id' => $old->id, // REMOVED: User requested auto-increment
            'receipt_no' => $old->invoice_no,  // finance_cash_receipts.invoice_no is the receipt #
            'amount' => $old->total ?? 0,
            'payment_method' => ($old->account == 1) ? 'cash' : 'bank',  // Simple map
            'receipt_date' => $this->validateDate($old->invoice_date),
            'payer_type' => $payerType,
            'payer_id' => $payerId,
            'remarks' => $old->remarks,
            'created_by' => $createdBy,  // Set the mapped user ID
            // New Fields
            'employee_id' => $old->employee_id,  // Legacy HR Employee ID string
            'guest_name' => $old->guest_name,
            'guest_contact' => $old->guest_contact,
            'legacy_id' => $old->id,
            'created_at' => $this->validateDate($old->created_at),
            'updated_at' => $this->validateDate($old->updated_at),
            'deleted_at' => $old->deleted_at ? $this->validateDate($old->deleted_at) : null,
        ];

        $newId = \App\Models\FinancialReceipt::insertGetId($receiptData);

        // Hydrate a model instance manually for return/usage to avoid re-query
        $receiptData['id'] = $newId;  // Add the new ID to data
        $receipt = new \App\Models\FinancialReceipt($receiptData);
        $receipt->exists = true;  // Mark as existing to avoid issues if used later

        // 4. Create Credit Transaction
        \App\Models\Transaction::create([
            'amount' => $old->total ?? 0,
            'type' => 'credit',
            'payable_type' => $payerType,
            'payable_id' => $payerId,
            'reference_type' => \App\Models\FinancialReceipt::class,
            'reference_id' => $receipt->id,
            'created_at' => $this->validateDate($old->created_at),
            'updated_at' => $this->validateDate($old->updated_at),
        ]);

        return $receipt;
    }

    private function getPayableType($invoice)
    {
        if ($invoice->member_id)
            return Member::class;
        if ($invoice->corporate_member_id)
            return CorporateMember::class;
        if ($invoice->customer_id)
            return \App\Models\Customer::class;
        return null;
    }

    private function getPayableId($invoice)
    {
        if ($invoice->member_id)
            return $invoice->member_id;
        if ($invoice->corporate_member_id)
            return $invoice->corporate_member_id;
        if ($invoice->customer_id)
            return $invoice->customer_id;
        return null;
    }

    public function migrateTransactionTypes(Request $request = null)
    {
        $count = 0;

        // 1. Migrate Types 1, 2, 4, 6 (Charges, Ad-hoc, Finance, POS)
        $types = DB::connection('old_afohs')
            ->table('trans_types')
            ->whereIn('type', [1, 2, 4, 6])  // Exclude 3 (Subscriptions) and 7 (Payments)
            ->get();

        foreach ($types as $t) {
            // Check if exists
            $exists = TransactionType::where('name', $t->name)->exists();
            if (!$exists) {
                TransactionType::create([
                    'name' => $t->name,
                    'type' => 2,  // Default to "Charges Type" behavior for new system compatibility
                    'status' => 'active',
                    'cash_or_payment' => 0,  // Assuming charge
                    'table_name' => 'finance_invoice',  // Default
                ]);
                $count++;
            }
        }

        // 2. Ensure Generic "Monthly Subscription" Type Exists
        $genericName = 'Monthly Subscription';
        if (!TransactionType::where('name', $genericName)->exists()) {
            TransactionType::create([
                'name' => $genericName,
                'type' => 2,
                'status' => 'active',
                'cash_or_payment' => 0,
                'table_name' => 'finance_invoice'
            ]);
            $count++;
        }

        return $count;
    }

    public function migrateSubscriptionTypes(Request $request = null)
    {
        $count = 0;

        // Migrate Type 3 (Subscriptions) -> Valid Subscription Types
        $types = DB::connection('old_afohs')
            ->table('sports_subscriptions')
            ->get();

        foreach ($types as $t) {
            // Check existence
            $exists = \App\Models\SubscriptionCategory::where('title', $t->name)->exists();
            if (!$exists) {
                \App\Models\SubscriptionCategory::create([
                    'subscription_type_id' => 1,
                    'title' => $t->name,
                    'status' => 'active',
                    'fee' => 0,  // We don't know the default fee from trans_types
                ]);
                $count++;
            }
        }

        return $count;
    }

    public function migrateSubscriptionTypesPublic(Request $request)
    {
        try {
            DB::beginTransaction();
            $count = $this->migrateSubscriptionTypes($request);
            DB::commit();

            $total = DB::connection('old_afohs')
                ->table('trans_types')
                ->where('type', 3)
                ->count();

            return response()->json([
                'success' => true,
                'migrated' => $count,
                'total' => $total,
                'message' => 'Subscription Types migrated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
