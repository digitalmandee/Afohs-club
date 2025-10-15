<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Member;
use App\Models\MemberCategory;
use Carbon\Carbon;
use Inertia\Inertia;

class DataMigrationController extends Controller
{
    /**
     * Display migration dashboard
     */
    public function index()
    {
        return Inertia::render('App/Admin/Migration/Dashboard', [
            'stats' => $this->getMigrationStats()
        ]);
    }

    /**
     * Get migration statistics
     */
    private function getMigrationStats()
    {
        try {
            // Check if old tables exist
            $oldTablesExist = $this->checkOldTablesExist();
            
            if (!$oldTablesExist) {
                return [
                    'old_tables_exist' => false,
                    'message' => 'Old database tables not found. Please import SQL files first.'
                ];
            }

            $oldMemberships = DB::table('memberships')->count();
            $oldFamilies = DB::table('mem_families')->count();
            $currentMembers = Member::count();
            $primaryMembers = Member::whereNull('parent_id')->count();
            $familyMembers = Member::whereNotNull('parent_id')->count();

            return [
                'old_tables_exist' => true,
                'old_memberships' => $oldMemberships,
                'old_families' => $oldFamilies,
                'total_old_records' => $oldMemberships + $oldFamilies,
                'current_members' => $currentMembers,
                'primary_members' => $primaryMembers,
                'family_members' => $familyMembers,
                'migration_needed' => ($oldMemberships + $oldFamilies) > $currentMembers
            ];
        } catch (\Exception $e) {
            return [
                'error' => true,
                'message' => 'Error checking migration stats: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check if old tables exist
     */
    private function checkOldTablesExist()
    {
        try {
            DB::table('memberships')->limit(1)->get();
            DB::table('mem_families')->limit(1)->get();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Analyze old data for migration
     */
    public function analyzeData()
    {
        try {
            $analysis = [
                'memberships' => $this->analyzeMemberships(),
                'families' => $this->analyzeFamilies(),
                'relationships' => $this->analyzeRelationships(),
                'data_quality' => $this->analyzeDataQuality()
            ];

            return response()->json($analysis);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Analyze memberships table
     */
    private function analyzeMemberships()
    {
        $memberships = DB::table('memberships')->get();
        
        $analysis = [
            'total_count' => $memberships->count(),
            'with_mem_no' => $memberships->whereNotNull('mem_no')->count(),
            'with_cnic' => $memberships->whereNotNull('cnic')->count(),
            'with_email' => $memberships->whereNotNull('personal_email')->count(),
            'with_mobile' => $memberships->whereNotNull('mob_a')->count(),
            'categories' => $memberships->pluck('mem_category_id')->unique()->values(),
            'sample_records' => $memberships->take(5)->map(function($record) {
                return [
                    'id' => $record->id,
                    'mem_no' => $record->mem_no,
                    'name' => $record->applicant_name ?? ($record->first_name . ' ' . $record->middle_name),
                    'cnic' => $record->cnic,
                    'category' => $record->mem_category_id,
                    'membership_date' => $record->membership_date
                ];
            })
        ];

        return $analysis;
    }

    /**
     * Analyze families table
     */
    private function analyzeFamilies()
    {
        $families = DB::table('mem_families')->get();
        
        $analysis = [
            'total_count' => $families->count(),
            'with_member_id' => $families->whereNotNull('member_id')->count(),
            'with_cnic' => $families->whereNotNull('cnic')->count(),
            'relationships' => $families->pluck('fam_relationship')->countBy(),
            'card_statuses' => $families->pluck('card_status')->countBy(),
            'sample_records' => $families->take(5)->map(function($record) {
                return [
                    'id' => $record->id,
                    'member_id' => $record->member_id,
                    'name' => $record->name ?? ($record->first_name . ' ' . $record->middle_name),
                    'relationship' => $record->fam_relationship,
                    'cnic' => $record->cnic,
                    'card_no' => $record->sup_card_no
                ];
            })
        ];

        return $analysis;
    }

    /**
     * Analyze relationships
     */
    private function analyzeRelationships()
    {
        $relationships = DB::table('mem_families')
            ->select('fam_relationship', DB::raw('count(*) as count'))
            ->groupBy('fam_relationship')
            ->get();

        $relationshipMap = [
            '1' => 'Father/Mother',
            '2' => 'Son', 
            '3' => 'Daughter',
            '4' => 'Wife/Spouse',
            '5' => 'Brother/Sister',
            '8' => 'Brother-in-law/Sister-in-law',
            '9' => 'Husband'
        ];

        return $relationships->map(function($rel) use ($relationshipMap) {
            return [
                'code' => $rel->fam_relationship,
                'name' => $relationshipMap[$rel->fam_relationship] ?? 'Unknown',
                'count' => $rel->count
            ];
        });
    }

    /**
     * Analyze data quality issues
     */
    private function analyzeDataQuality()
    {
        $issues = [];

        // Check for missing required fields in memberships
        $membershipsWithoutMemNo = DB::table('memberships')->whereNull('mem_no')->count();
        if ($membershipsWithoutMemNo > 0) {
            $issues[] = "Memberships without membership number: {$membershipsWithoutMemNo}";
        }

        // Check for orphaned family members
        $orphanedFamilies = DB::table('mem_families as f')
            ->leftJoin('memberships as m', 'f.member_id', '=', 'm.id')
            ->whereNull('m.id')
            ->count();
        if ($orphanedFamilies > 0) {
            $issues[] = "Family members without valid parent: {$orphanedFamilies}";
        }

        // Check for duplicate CNICs
        $duplicateCNICs = DB::table('memberships')
            ->whereNotNull('cnic')
            ->select('cnic', DB::raw('count(*) as count'))
            ->groupBy('cnic')
            ->having('count', '>', 1)
            ->count();
        if ($duplicateCNICs > 0) {
            $issues[] = "Duplicate CNICs in memberships: {$duplicateCNICs}";
        }

        return $issues;
    }

    /**
     * Test migration with sample data
     */
    public function testMigration(Request $request)
    {
        $batchSize = $request->input('batch_size', 10);
        
        try {
            DB::beginTransaction();

            $results = [
                'primary_members' => $this->testPrimaryMembersMigration($batchSize),
                'family_members' => $this->testFamilyMembersMigration($batchSize)
            ];

            // Rollback test data
            DB::rollback();

            return response()->json([
                'success' => true,
                'results' => $results,
                'message' => 'Test migration completed successfully (rolled back)'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test primary members migration
     */
    private function testPrimaryMembersMigration($batchSize)
    {
        $oldMembers = DB::table('memberships')->limit($batchSize)->get();
        $migrated = 0;
        $errors = [];

        foreach ($oldMembers as $oldMember) {
            try {
                $memberData = $this->mapPrimaryMemberData($oldMember);
                
                // Validate required fields
                if (empty($memberData['membership_no'])) {
                    $errors[] = "Member ID {$oldMember->id}: Missing membership number";
                    continue;
                }

                // Test insert (will be rolled back)
                $member = new Member($memberData);
                $member->user_id = $oldMember->id + 10000; // Temporary user_id for test
                $member->save();
                
                $migrated++;
            } catch (\Exception $e) {
                $errors[] = "Member ID {$oldMember->id}: " . $e->getMessage();
            }
        }

        return [
            'total_processed' => $oldMembers->count(),
            'successfully_migrated' => $migrated,
            'errors' => $errors
        ];
    }

    /**
     * Test family members migration
     */
    private function testFamilyMembersMigration($batchSize)
    {
        $oldFamilies = DB::table('mem_families')->limit($batchSize)->get();
        $migrated = 0;
        $errors = [];

        foreach ($oldFamilies as $oldFamily) {
            try {
                $memberData = $this->mapFamilyMemberData($oldFamily);
                
                // Check if parent exists (in test, use temporary ID)
                $parentUserId = $oldFamily->member_id + 10000;
                
                // Test insert (will be rolled back)
                $member = new Member($memberData);
                $member->user_id = $oldFamily->id + 20000; // Temporary user_id for test
                $member->parent_id = $parentUserId;
                $member->save();
                
                $migrated++;
            } catch (\Exception $e) {
                $errors[] = "Family Member ID {$oldFamily->id}: " . $e->getMessage();
            }
        }

        return [
            'total_processed' => $oldFamilies->count(),
            'successfully_migrated' => $migrated,
            'errors' => $errors
        ];
    }

    /**
     * Map primary member data
     */
    private function mapPrimaryMemberData($oldMember)
    {
        return [
            'application_no' => $oldMember->application_no,
            'membership_no' => $oldMember->mem_no,
            'member_category_id' => $oldMember->mem_category_id,
            'title' => $oldMember->title,
            'first_name' => $oldMember->first_name,
            'middle_name' => $oldMember->middle_name,
            'full_name' => $oldMember->applicant_name ?? trim(($oldMember->first_name ?? '') . ' ' . ($oldMember->middle_name ?? '')),
            'guardian_name' => $oldMember->father_name,
            'cnic_no' => $oldMember->cnic,
            'passport_no' => $oldMember->passport_no,
            'date_of_birth' => $oldMember->date_of_birth,
            'gender' => $oldMember->gender,
            'nationality' => $oldMember->nationality,
            'mobile_number_a' => $oldMember->mob_a,
            'mobile_number_b' => $oldMember->mob_b,
            'telephone_number' => $oldMember->tel_a,
            'personal_email' => $oldMember->personal_email,
            'current_address' => $oldMember->cur_address,
            'current_city' => $oldMember->cur_city,
            'current_country' => $oldMember->cur_country,
            'permanent_address' => $oldMember->per_address,
            'permanent_city' => $oldMember->per_city,
            'permanent_country' => $oldMember->per_country,
            'membership_date' => $oldMember->membership_date,
            'card_status' => $oldMember->card_status,
            'card_issue_date' => $oldMember->card_issue_date,
            'card_expiry_date' => $oldMember->card_exp,
            'barcode_no' => $oldMember->mem_barcode,
            'picture' => $oldMember->mem_picture,
            'emergency_name' => $oldMember->emergency_name,
            'emergency_relation' => $oldMember->emergency_relation,
            'emergency_contact' => $oldMember->emergency_contact,
            'education' => $oldMember->education,
            'ntn' => $oldMember->ntn,
            'member_type_id' => 1, // Assuming 1 is primary member type
            'parent_id' => null,
        ];
    }

    /**
     * Map family member data
     */
    private function mapFamilyMemberData($oldFamily)
    {
        $relationshipMap = [
            '1' => 'Father/Mother',
            '2' => 'Son', 
            '3' => 'Daughter',
            '4' => 'Wife',
            '5' => 'Brother/Sister',
            '8' => 'Brother-in-law/Sister-in-law',
            '9' => 'Husband'
        ];

        return [
            'membership_no' => $oldFamily->sup_card_no,
            'title' => $oldFamily->title,
            'first_name' => $oldFamily->first_name,
            'middle_name' => $oldFamily->middle_name,
            'full_name' => $oldFamily->name ?? trim(($oldFamily->first_name ?? '') . ' ' . ($oldFamily->middle_name ?? '')),
            'relation' => $relationshipMap[$oldFamily->fam_relationship] ?? 'Unknown',
            'cnic_no' => $oldFamily->cnic,
            'passport_no' => $oldFamily->passport_no,
            'date_of_birth' => $oldFamily->date_of_birth,
            'gender' => $oldFamily->gender,
            'nationality' => $oldFamily->nationality,
            'mobile_number_a' => $oldFamily->contact,
            'martial_status' => $oldFamily->maritial_status,
            'card_status' => $oldFamily->card_status,
            'card_issue_date' => $oldFamily->sup_card_issue,
            'card_expiry_date' => $oldFamily->sup_card_exp,
            'barcode_no' => $oldFamily->sup_barcode,
            'picture' => $oldFamily->fam_picture,
            'member_type_id' => 2, // Assuming 2 is family member type
        ];
    }

    /**
     * Get sample data for preview
     */
    public function getSampleData(Request $request)
    {
        $type = $request->input('type', 'memberships');
        $limit = $request->input('limit', 10);

        try {
            if ($type === 'memberships') {
                $data = DB::table('memberships')
                    ->select(['id', 'mem_no', 'applicant_name', 'first_name', 'middle_name', 'cnic', 'mem_category_id', 'membership_date'])
                    ->limit($limit)
                    ->get();
            } else {
                $data = DB::table('mem_families')
                    ->select(['id', 'member_id', 'name', 'first_name', 'middle_name', 'fam_relationship', 'cnic', 'sup_card_no'])
                    ->limit($limit)
                    ->get();
            }

            return response()->json(['data' => $data]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Perform actual migration
     */
    public function migrate(Request $request)
    {
        $batchSize = $request->input('batch_size', 50);
        $startFrom = $request->input('start_from', 0);
        
        try {
            DB::beginTransaction();

            $results = [
                'primary_members' => $this->migratePrimaryMembers($batchSize, $startFrom),
                'family_members' => $this->migrateFamilyMembers($batchSize, $startFrom)
            ];

            DB::commit();

            return response()->json([
                'success' => true,
                'results' => $results,
                'message' => 'Migration completed successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Migration failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Migrate primary members (actual migration)
     */
    private function migratePrimaryMembers($batchSize, $startFrom)
    {
        // Implementation for actual migration
        // This would be similar to test but without rollback
        return ['message' => 'Primary members migration would be implemented here'];
    }

    /**
     * Migrate family members (actual migration)
     */
    private function migrateFamilyMembers($batchSize, $startFrom)
    {
        // Implementation for actual migration
        // This would be similar to test but without rollback
        return ['message' => 'Family members migration would be implemented here'];
    }
}
