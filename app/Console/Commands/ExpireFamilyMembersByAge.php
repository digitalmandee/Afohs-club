<?php

namespace App\Console\Commands;

use App\Models\Member;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireFamilyMembersByAge extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'members:expire-by-age {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically expire family members who have reached 25 years of age (excludes wives)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        $this->info('Starting family member age-based expiry process (excluding wives)...');
        
        // Get family members who should be expired by age
        $membersToExpire = Member::familyMembersToExpire()->get();
        
        if ($membersToExpire->isEmpty()) {
            $this->info('No family members found that need to be expired by age.');
            return Command::SUCCESS;
        }
        
        $this->info("Found {$membersToExpire->count()} family member(s) to expire:");
        
        $expiredCount = 0;
        
        foreach ($membersToExpire as $member) {
            $age = $member->age;
            $memberInfo = "{$member->full_name} (ID: {$member->id}, Age: {$age})";
            
            if ($isDryRun) {
                $this->line("Would expire: {$memberInfo}");
            } else {
                try {
                    $member->expireByAge("Automatic expiry - Member reached {$age} years of age");
                    $this->line("✓ Expired: {$memberInfo}");
                    $expiredCount++;
                } catch (\Exception $e) {
                    $this->error("✗ Failed to expire {$memberInfo}: {$e->getMessage()}");
                    Log::error("Failed to expire family member by age", [
                        'member_id' => $member->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
        
        if ($isDryRun) {
            $this->warn("DRY RUN: No changes were made. Use without --dry-run to actually expire members.");
        } else {
            $this->info("Successfully expired {$expiredCount} family member(s).");
            
            // Send notification to admins if any members were expired
            if ($expiredCount > 0) {
                $this->notifyAdmins($expiredCount);
            }
        }
        
        return Command::SUCCESS;
    }
    
    /**
     * Notify administrators about expired members
     */
    private function notifyAdmins($expiredCount)
    {
        // You can implement email notification, database notification, etc.
        Log::info("Family member expiry notification", [
            'expired_count' => $expiredCount,
            'date' => now()->toDateString(),
            'message' => "{$expiredCount} family member(s) were automatically expired due to reaching 25 years of age."
        ]);
        
        $this->info("Admin notification logged for {$expiredCount} expired member(s).");
    }
}
