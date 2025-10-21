<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MemberCategory;
use App\Models\MemberClassification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

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
            $newMembersCount = Member::whereNull('parent_id')->count();
            $newFamiliesCount = Member::whereNotNull('parent_id')->count();
            
            // Check migration status
            $migratedMembersCount = Member::whereNull('parent_id')
                ->whereNotNull('application_no')
                ->count();
            
            $migratedFamiliesCount = Member::whereNotNull('parent_id')
                ->whereNotNull('cnic_no')
                ->count();

            return [
                'old_tables_exist' => true,
                'old_members_count' => $oldMembersCount,
                'old_families_count' => $oldFamiliesCount,
                'new_members_count' => $newMembersCount,
                'new_families_count' => $newFamiliesCount,
                'migrated_members_count' => $migratedMembersCount,
                'migrated_families_count' => $migratedFamiliesCount,
                'members_migration_percentage' => $oldMembersCount > 0 ? round(($migratedMembersCount / $oldMembersCount) * 100, 2) : 0,
                'families_migration_percentage' => $oldFamiliesCount > 0 ? round(($migratedFamiliesCount / $oldFamiliesCount) * 100, 2) : 0,
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
            
            Log::info("Processing batch: offset={$offset}, found " . count($oldMembers) . " records");
            
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
                        'name' => $oldMember->applicant_name ?? 'N/A',
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                        'file' => basename($e->getFile())
                    ];
                    Log::error("Error migrating member {$oldMember->id} ({$oldMember->applicant_name}): " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
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
        // Check if member already exists using multiple criteria
        $query = Member::whereNull('parent_id');
        
        // Primary check: application_no if it exists
        if (!empty($oldMember->application_no)) {
            $query->where('application_no', $oldMember->application_no);
        } else {
            // Fallback: check by membership_no and name if application_no is empty
            $query->where('membership_no', $oldMember->mem_no)
                  ->where('full_name', $oldMember->applicant_name);
        }
        
        $existingMember = $query->first();
            
        if ($existingMember) {
            Log::info("Skipping member {$oldMember->id} - already exists (App No: {$oldMember->application_no})");
            return; // Skip if already migrated
        }
        
        Log::info("Migrating member {$oldMember->id} (App No: {$oldMember->application_no})");

        // Get member category ID
        $memberCategoryId = $this->getMemberCategoryId($oldMember->mem_category_id);
        
        // Prepare member data
        $memberData = [
            'application_no' => $oldMember->application_no,
            'membership_no' => $oldMember->mem_no,
            'membership_date' => $this->validateDate($oldMember->membership_date),
            'full_name' => trim(preg_replace('/\s+/', ' ', $oldMember->title . ' ' . $oldMember->first_name . ' ' . $oldMember->middle_name)),
            'member_category_id' => $memberCategoryId,
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
                    $errors[] = [
                        'family_id' => $oldFamily->id,
                        'member_id' => $oldFamily->member_id ?? 'N/A',
                        'name' => $oldFamily->name ?? 'N/A',
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                        'file' => basename($e->getFile())
                    ];
                    Log::error("Error migrating family member {$oldFamily->id} ({$oldFamily->name}): " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
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
        // Find parent member by member_id
        $parentMember = Member::where('application_no', $oldFamily->member_id)
            ->whereNull('parent_id')
            ->first();
            
        if (!$parentMember) {
            throw new \Exception("Parent member not found for family member ID: {$oldFamily->id}");
        }

        // Check if family member already exists
        $existingFamily = Member::where('parent_id', $parentMember->id)
            ->where('full_name', $oldFamily->name)
            ->first();
            
        if ($existingFamily) {
            return; // Skip if already migrated
        }

        // Prepare family member data
        $familyData = [
            'parent_id' => $parentMember->id,
            'full_name' => $oldFamily->name,
            'date_of_birth' => $this->validateDate($oldFamily->date_of_birth),
            'relation' => $this->mapFamilyRelation($oldFamily->fam_relationship),
            'nationality' => $oldFamily->nationality,
            'cnic_no' => $oldFamily->cnic,
            'mobile_number_a' => $oldFamily->contact,
            'martial_status' => $oldFamily->marital_status,
            'profile_photo' => $this->migrateFamilyPhoto($oldFamily->fam_picture),
            'membership_no' => $oldFamily->sup_card_no,
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
        // Get old category data
        $oldCategory = DB::table('mem_categories')->where('id', $oldCategoryId)->first();
        
        if (!$oldCategory) {
            return null;
        }

        // Find matching new category by name
        $newCategory = MemberCategory::where('name', $oldCategory->unique_code)->first();
        
        return $newCategory ? $newCategory->id : null;
    }

    private function mapCardStatus($oldStatus)
    {
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
        // Get status from mem_statuses table if needed
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
                    throw new \Exception("Status '{$status->desc}' (ID: {$oldStatus}) not found in mapping. Please add mapping for this status.");
                }
                
                return $mappedStatus;
            } else {
                throw new \Exception("Status ID {$oldStatus} not found in mem_statuses table.");
            }
        } catch (\Exception $e) {
            Log::error('Error mapping member status: ' . $e->getMessage());
            throw $e; // Re-throw the exception to be caught by migration error handling
        }
    }

    private function mapFamilyRelation($oldRelation)
    {
        // Get relation from mem_relations table if needed
        try {
            $relation = DB::table('mem_relations')->where('id', $oldRelation)->first();
            return $relation ? $relation->name : $oldRelation;
        } catch (\Exception $e) {
            return $oldRelation;
        }
    }

    private function migrateProfilePhoto($oldPhotoPath)
    {
        if (!$oldPhotoPath) {
            return null;
        }

        try {
            $oldPath = public_path('upload/' . $oldPhotoPath);
            
            if (file_exists($oldPath)) {
                $newPath = 'tenants/default/membership/' . basename($oldPhotoPath);
                $fullNewPath = storage_path('app/public/' . $newPath);
                
                // Create directory if it doesn't exist
                $directory = dirname($fullNewPath);
                if (!is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }
                
                // Copy file
                if (copy($oldPath, $fullNewPath)) {
                    return $newPath;
                }
            }
        } catch (\Exception $e) {
            Log::error('Error migrating profile photo: ' . $e->getMessage());
        }

        return null;
    }

    private function migrateFamilyPhoto($oldPhotoPath)
    {
        if (!$oldPhotoPath) {
            return null;
        }

        try {
            $oldPath = public_path('familymemberupload/' . $oldPhotoPath);
            
            if (file_exists($oldPath)) {
                $newPath = 'tenants/default/familymembers/' . basename($oldPhotoPath);
                $fullNewPath = storage_path('app/public/' . $newPath);
                
                // Create directory if it doesn't exist
                $directory = dirname($fullNewPath);
                if (!is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }
                
                // Copy file
                if (copy($oldPath, $fullNewPath)) {
                    return $newPath;
                }
            }
        } catch (\Exception $e) {
            Log::error('Error migrating family photo: ' . $e->getMessage());
        }

        return null;
    }

    public function resetMigration(Request $request)
    {
        try {
            DB::beginTransaction();
            
            // Delete all migrated data
            Member::truncate();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Migration data reset successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reset migration error: ' . $e->getMessage());
            
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
}
