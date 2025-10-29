<?php

namespace App\Console\Commands;

use App\Models\EventBooking;
use App\Models\FinancialInvoice;
use App\Models\RoomBooking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MigrateInvoicePolymorphicData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:migrate-polymorphic {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate financial invoice data from JSON to polymorphic relationships';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('🔍 Running in DRY RUN mode - no changes will be made');
        }

        $this->info('Starting invoice polymorphic data migration...');
        
        // Migrate Room Bookings
        $this->migrateRoomBookings($dryRun);
        
        // Migrate Event Bookings
        $this->migrateEventBookings($dryRun);
        
        // Migrate Food Orders (if applicable)
        // $this->migrateFoodOrders($dryRun);
        
        $this->info('✅ Migration completed!');
    }

    /**
     * Migrate room booking invoices
     */
    protected function migrateRoomBookings($dryRun = false)
    {
        $this->info('📦 Migrating Room Booking invoices...');
        
        $invoices = FinancialInvoice::where('invoice_type', 'room_booking')
            ->whereNull('invoiceable_id')
            ->whereNotNull('data')
            ->get();

        $this->info("Found {$invoices->count()} room booking invoices to migrate");
        
        $bar = $this->output->createProgressBar($invoices->count());
        $bar->start();
        
        $migrated = 0;
        $failed = 0;

        foreach ($invoices as $invoice) {
            try {
                $data = is_array($invoice->data) ? $invoice->data : json_decode($invoice->data, true);
                
                // Extract booking_id from data
                $bookingId = null;
                if (isset($data[0]['booking_id'])) {
                    $bookingId = $data[0]['booking_id'];
                } elseif (isset($data['booking_id'])) {
                    $bookingId = $data['booking_id'];
                }

                if ($bookingId) {
                    // Verify booking exists
                    $booking = RoomBooking::find($bookingId);
                    
                    if ($booking) {
                        if (!$dryRun) {
                            $invoice->invoiceable_id = $bookingId;
                            $invoice->invoiceable_type = RoomBooking::class;
                            $invoice->save();
                        }
                        $migrated++;
                    } else {
                        $this->warn("Room booking ID {$bookingId} not found for invoice {$invoice->id}");
                        $failed++;
                    }
                } else {
                    $this->warn("No booking_id found in data for invoice {$invoice->id}");
                    $failed++;
                }
            } catch (\Exception $e) {
                $this->error("Error migrating invoice {$invoice->id}: " . $e->getMessage());
                Log::error("Invoice migration error", [
                    'invoice_id' => $invoice->id,
                    'error' => $e->getMessage()
                ]);
                $failed++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Room Bookings: {$migrated} migrated, {$failed} failed");
    }

    /**
     * Migrate event booking invoices
     */
    protected function migrateEventBookings($dryRun = false)
    {
        $this->info('🎉 Migrating Event Booking invoices...');
        
        $invoices = FinancialInvoice::where('invoice_type', 'event_booking')
            ->whereNull('invoiceable_id')
            ->whereNotNull('data')
            ->get();

        $this->info("Found {$invoices->count()} event booking invoices to migrate");
        
        $bar = $this->output->createProgressBar($invoices->count());
        $bar->start();
        
        $migrated = 0;
        $failed = 0;

        foreach ($invoices as $invoice) {
            try {
                $data = is_array($invoice->data) ? $invoice->data : json_decode($invoice->data, true);
                
                // Extract booking_id from data
                $bookingId = null;
                if (isset($data['booking_id'])) {
                    $bookingId = $data['booking_id'];
                } elseif (isset($data[0]['booking_id'])) {
                    $bookingId = $data[0]['booking_id'];
                }

                if ($bookingId) {
                    // Verify booking exists
                    $booking = EventBooking::find($bookingId);
                    
                    if ($booking) {
                        if (!$dryRun) {
                            $invoice->invoiceable_id = $bookingId;
                            $invoice->invoiceable_type = EventBooking::class;
                            $invoice->save();
                        }
                        $migrated++;
                    } else {
                        $this->warn("Event booking ID {$bookingId} not found for invoice {$invoice->id}");
                        $failed++;
                    }
                } else {
                    $this->warn("No booking_id found in data for invoice {$invoice->id}");
                    $failed++;
                }
            } catch (\Exception $e) {
                $this->error("Error migrating invoice {$invoice->id}: " . $e->getMessage());
                Log::error("Invoice migration error", [
                    'invoice_id' => $invoice->id,
                    'error' => $e->getMessage()
                ]);
                $failed++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info("✅ Event Bookings: {$migrated} migrated, {$failed} failed");
    }
}
