<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Member;

class TestMigrationCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'migration:test {--limit=10 : Number of records to test}';

    /**
     * The console command description.
     */
    protected $description = 'Test migration of old membership data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = $this->option('limit');
        
        $this->info("Testing migration with {$limit} records...");
        
        try {
            // Check if old tables exist
            if (!$this->checkOldTablesExist()) {
                $this->error('Old tables (memberships, mem_families) not found!');
                $this->info('Please import the SQL files first.');
                return 1;
            }

            // Test memberships migration
            $this->info('Testing memberships migration...');
            $membershipResults = $this->testMemberships($limit);
            
            // Test families migration  
            $this->info('Testing families migration...');
            $familyResults = $this->testFamilies($limit);
            
            // Display results
            $this->displayResults($membershipResults, $familyResults);
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('Migration test failed: ' . $e->getMessage());
            return 1;
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
     * Test memberships migration
     */
    private function testMemberships($limit)
    {
        $memberships = DB::table('memberships')->limit($limit)->get();
        $results = [
            'total' => $memberships->count(),
            'success' => 0,
            'errors' => []
        ];

        foreach ($memberships as $membership) {
            try {
                // Test field mapping
                $mapped = $this->mapMembershipData($membership);
                
                // Validate required fields
                $validation = $this->validateMemberData($mapped);
                if (!$validation['valid']) {
                    $results['errors'][] = "ID {$membership->id}: " . $validation['error'];
                    continue;
                }
                
                $results['success']++;
                
            } catch (\Exception $e) {
                $results['errors'][] = "ID {$membership->id}: " . $e->getMessage();
            }
        }

        return $results;
    }

    /**
     * Test families migration
     */
    private function testFamilies($limit)
    {
        $families = DB::table('mem_families')->limit($limit)->get();
        $results = [
            'total' => $families->count(),
            'success' => 0,
            'errors' => []
        ];

        foreach ($families as $family) {
            try {
                // Check if parent exists
                $parentExists = DB::table('memberships')->where('id', $family->member_id)->exists();
                if (!$parentExists) {
                    $results['errors'][] = "ID {$family->id}: Parent member {$family->member_id} not found";
                    continue;
                }
                
                // Test field mapping
                $mapped = $this->mapFamilyData($family);
                
                // Validate required fields
                $validation = $this->validateMemberData($mapped);
                if (!$validation['valid']) {
                    $results['errors'][] = "ID {$family->id}: " . $validation['error'];
                    continue;
                }
                
                $results['success']++;
                
            } catch (\Exception $e) {
                $results['errors'][] = "ID {$family->id}: " . $e->getMessage();
            }
        }

        return $results;
    }

    /**
     * Map membership data to new format
     */
    private function mapMembershipData($membership)
    {
        return [
            'old_member_id' => $membership->id,
            'migration_source' => 'memberships',
            'membership_no' => $membership->mem_no,
            'application_no' => $membership->application_no,
            'member_category_id' => $membership->mem_category_id,
            'title' => $membership->title,
            'first_name' => $membership->first_name,
            'middle_name' => $membership->middle_name,
            'full_name' => $membership->applicant_name ?? trim(($membership->first_name ?? '') . ' ' . ($membership->middle_name ?? '')),
            'guardian_name' => $membership->father_name,
            'cnic_no' => $membership->cnic,
            'date_of_birth' => $membership->date_of_birth,
            'gender' => $membership->gender,
            'nationality' => $membership->nationality,
            'mobile_number_a' => $membership->mob_a,
            'mobile_number_b' => $membership->mob_b,
            'personal_email' => $membership->personal_email,
            'current_address' => $membership->cur_address,
            'current_city' => $membership->cur_city,
            'current_country' => $membership->cur_country,
            'permanent_address' => $membership->per_address,
            'permanent_city' => $membership->per_city,
            'permanent_country' => $membership->per_country,
            'membership_date' => $membership->membership_date,
            'card_status' => $membership->card_status,
            'card_issue_date' => $membership->card_issue_date,
            'card_expiry_date' => $membership->card_exp,
            'barcode_no' => $membership->mem_barcode,
            'picture' => $membership->mem_picture,
            'parent_id' => null,
        ];
    }

    /**
     * Map family data to new format
     */
    private function mapFamilyData($family)
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
            'old_member_id' => $family->id,
            'migration_source' => 'mem_families',
            'membership_no' => $family->sup_card_no,
            'title' => $family->title,
            'first_name' => $family->first_name,
            'middle_name' => $family->middle_name,
            'full_name' => $family->name ?? trim(($family->first_name ?? '') . ' ' . ($family->middle_name ?? '')),
            'relation' => $relationshipMap[$family->fam_relationship] ?? 'Unknown',
            'cnic_no' => $family->cnic,
            'date_of_birth' => $family->date_of_birth,
            'gender' => $family->gender,
            'nationality' => $family->nationality,
            'mobile_number_a' => $family->contact,
            'martial_status' => $family->maritial_status,
            'card_status' => $family->card_status,
            'card_issue_date' => $family->sup_card_issue,
            'card_expiry_date' => $family->sup_card_exp,
            'barcode_no' => $family->sup_barcode,
            'picture' => $family->fam_picture,
            'parent_id' => $family->member_id, // Will need to map to new user_id
        ];
    }

    /**
     * Validate member data
     */
    private function validateMemberData($data)
    {
        // Check required fields
        if (empty($data['full_name'])) {
            return ['valid' => false, 'error' => 'Missing full name'];
        }

        // For primary members, membership_no is required
        if ($data['migration_source'] === 'memberships' && empty($data['membership_no'])) {
            return ['valid' => false, 'error' => 'Missing membership number'];
        }

        return ['valid' => true];
    }

    /**
     * Display test results
     */
    private function displayResults($membershipResults, $familyResults)
    {
        $this->info('=== MIGRATION TEST RESULTS ===');
        
        // Memberships results
        $this->info("Memberships:");
        $this->info("  Total: {$membershipResults['total']}");
        $this->info("  Success: {$membershipResults['success']}");
        $this->info("  Errors: " . count($membershipResults['errors']));
        
        if (!empty($membershipResults['errors'])) {
            $this->warn("Membership Errors:");
            foreach (array_slice($membershipResults['errors'], 0, 5) as $error) {
                $this->warn("  - {$error}");
            }
            if (count($membershipResults['errors']) > 5) {
                $this->warn("  ... and " . (count($membershipResults['errors']) - 5) . " more");
            }
        }

        // Families results
        $this->info("\nFamilies:");
        $this->info("  Total: {$familyResults['total']}");
        $this->info("  Success: {$familyResults['success']}");
        $this->info("  Errors: " . count($familyResults['errors']));
        
        if (!empty($familyResults['errors'])) {
            $this->warn("Family Errors:");
            foreach (array_slice($familyResults['errors'], 0, 5) as $error) {
                $this->warn("  - {$error}");
            }
            if (count($familyResults['errors']) > 5) {
                $this->warn("  ... and " . (count($familyResults['errors']) - 5) . " more");
            }
        }

        // Summary
        $totalRecords = $membershipResults['total'] + $familyResults['total'];
        $totalSuccess = $membershipResults['success'] + $familyResults['success'];
        $totalErrors = count($membershipResults['errors']) + count($familyResults['errors']);
        
        $this->info("\n=== SUMMARY ===");
        $this->info("Total Records: {$totalRecords}");
        $this->info("Successful: {$totalSuccess}");
        $this->info("Errors: {$totalErrors}");
        $this->info("Success Rate: " . round(($totalSuccess / $totalRecords) * 100, 2) . "%");
    }
}
