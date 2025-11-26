<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use App\Models\Media;
use App\Models\Member;
use App\Models\MemberCategory;
use App\Models\MemberClassification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
            $newMembersCount = Member::whereNull('parent_id')->count();
            $newFamiliesCount = Member::whereNotNull('parent_id')->count();
            $newMediaCount = Media::count();

            // Check migration status
            $migratedMembersCount = Member::whereNull('parent_id')
                ->whereNotNull('application_no')
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

            // Primary check: application_no if it exists
            if (!empty($oldMember->application_no)) {
                $query->where('application_no', $oldMember->application_no);
            } else {
                // Fallback: check by membership_no and name if application_no is empty
                $query
                    ->where('membership_no', $oldMember->mem_no)
                    ->where('full_name', $oldMember->applicant_name);
            }

            $existingMember = $query->first();
        }

        if ($existingMember) {
            Log::info("Skipping member {$oldMember->id} - already exists (App No: {$oldMember->application_no})");
            return;  // Skip if already migrated
        }

        Log::info("Migrating member {$oldMember->id} (App No: {$oldMember->application_no})");

        // Get member category ID
        $memberCategoryId = $this->getMemberCategoryId($oldMember->mem_category_id);

        // Prepare member data
        $memberData = [
            'old_member_id' => $oldMember->id,
            'application_no' => $oldMember->application_no,
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
}
