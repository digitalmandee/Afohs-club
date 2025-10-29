# Financial Invoice Polymorphic Relationship Migration Guide

## Overview
This guide explains how to migrate from JSON-based booking references to Laravel's polymorphic relationships for the `financial_invoices` table.

## What Was Changed

### Before (JSON Approach)
```php
// Storing booking ID in JSON column
$invoice->data = [['booking_id' => 123]];

// Querying was complex
$invoice = FinancialInvoice::where('invoice_type', 'room_booking')
    ->whereJsonContains('data', [['booking_id' => $bookingId]])
    ->first();
```

### After (Polymorphic Approach)
```php
// Storing with polymorphic relationship
$invoice->invoiceable_id = 123;
$invoice->invoiceable_type = RoomBooking::class;

// Querying is simple and fast
$invoice = $roomBooking->invoice;
$booking = $invoice->invoiceable;
```

## Files Created/Modified

### 1. Migration File
**File:** `database/migrations/2025_10_29_114100_add_polymorphic_columns_to_financial_invoices_table.php`

Adds:
- `invoiceable_id` (unsigned big integer, nullable)
- `invoiceable_type` (string, nullable)
- Composite index for performance

### 2. Models Updated

#### FinancialInvoice.php
- Added `invoiceable_id` and `invoiceable_type` to fillable
- Added `invoiceable()` morphTo relationship

#### RoomBooking.php
- Added `invoice()` morphOne relationship
- Updated `getInvoiceAttribute()` with fallback to JSON (backward compatibility)

#### EventBooking.php
- Added `invoice()` morphOne relationship
- Updated `getInvoiceAttribute()` with fallback to JSON (backward compatibility)

### 3. Data Migration Command
**File:** `app/Console/Commands/MigrateInvoicePolymorphicData.php`

Command to migrate existing JSON data to polymorphic columns.

## Migration Steps

### Step 1: Run Database Migration
```bash
php artisan migrate
```

This adds the `invoiceable_id` and `invoiceable_type` columns to the `financial_invoices` table.

### Step 2: Test Migration (Dry Run)
```bash
php artisan invoices:migrate-polymorphic --dry-run
```

This shows what will be migrated without making changes.

### Step 3: Run Actual Migration
```bash
php artisan invoices:migrate-polymorphic
```

This migrates all existing invoices from JSON to polymorphic relationships.

### Step 4: Verify Migration
Check the results in the database:
```sql
SELECT 
    id, 
    invoice_no, 
    invoice_type, 
    invoiceable_id, 
    invoiceable_type 
FROM financial_invoices 
WHERE invoiceable_id IS NOT NULL 
LIMIT 10;
```

## Usage Examples

### Creating New Invoices

#### Room Booking Invoice
```php
// Method 1: Direct creation
$invoice = FinancialInvoice::create([
    'invoice_no' => 'INV-001',
    'invoice_type' => 'room_booking',
    'invoiceable_id' => $roomBooking->id,
    'invoiceable_type' => RoomBooking::class,
    'total_price' => 5000,
    // ... other fields
]);

// Method 2: Using relationship
$invoice = $roomBooking->invoice()->create([
    'invoice_no' => 'INV-001',
    'invoice_type' => 'room_booking',
    'total_price' => 5000,
    // ... other fields
]);
```

#### Event Booking Invoice
```php
$invoice = $eventBooking->invoice()->create([
    'invoice_no' => 'INV-002',
    'invoice_type' => 'event_booking',
    'total_price' => 15000,
    // ... other fields
]);
```

### Retrieving Data

#### Get Invoice from Booking
```php
$roomBooking = RoomBooking::find(1);
$invoice = $roomBooking->invoice; // Returns FinancialInvoice or null
```

#### Get Booking from Invoice
```php
$invoice = FinancialInvoice::find(1);
$booking = $invoice->invoiceable; // Returns RoomBooking, EventBooking, etc.
```

#### Eager Loading
```php
// Load bookings with invoices
$bookings = RoomBooking::with('invoice')->get();

// Load invoices with bookings
$invoices = FinancialInvoice::with('invoiceable')
    ->where('invoice_type', 'room_booking')
    ->get();

foreach ($invoices as $invoice) {
    $booking = $invoice->invoiceable; // RoomBooking instance
    echo $booking->booking_no;
}
```

### Querying

#### Find Invoices by Booking
```php
// Old way (still works as fallback)
$invoice = FinancialInvoice::where('invoice_type', 'room_booking')
    ->whereJsonContains('data', [['booking_id' => $bookingId]])
    ->first();

// New way (faster, cleaner)
$invoice = FinancialInvoice::where('invoiceable_type', RoomBooking::class)
    ->where('invoiceable_id', $bookingId)
    ->first();

// Best way (using relationship)
$invoice = $roomBooking->invoice;
```

#### Find All Room Booking Invoices
```php
$roomInvoices = FinancialInvoice::where('invoiceable_type', RoomBooking::class)
    ->with('invoiceable')
    ->get();
```

## Controller Updates

### Example: RoomController.php

#### Before
```php
$invoice = FinancialInvoice::where('invoice_type', 'room_booking')
    ->whereJsonContains('data->*.booking_id', $id)
    ->select('id', 'status', 'data')
    ->first();
```

#### After
```php
$booking = RoomBooking::with('invoice')->find($id);
$invoice = $booking->invoice;

// Or directly
$invoice = FinancialInvoice::where('invoiceable_type', RoomBooking::class)
    ->where('invoiceable_id', $id)
    ->select('id', 'status')
    ->first();
```

### Example: BookingController.php

#### Before
```php
if ($invoice->invoice_type == 'room_booking') {
    $booking = RoomBooking::find($invoice->data[0]['booking_id']);
    $booking->status = $request->booking_status;
    $booking->save();
}
```

#### After
```php
if ($invoice->invoiceable_type === RoomBooking::class) {
    $booking = $invoice->invoiceable;
    $booking->status = $request->booking_status;
    $booking->save();
}
```

## Benefits

### 1. Performance
- ✅ Indexed columns vs JSON queries
- ✅ Faster lookups and joins
- ✅ Better query optimization by database

### 2. Type Safety
- ✅ Proper model instances returned
- ✅ IDE autocomplete support
- ✅ Relationship methods available

### 3. Maintainability
- ✅ Clear, readable code
- ✅ Laravel standard approach
- ✅ Easier to debug and test

### 4. Flexibility
- ✅ Easy to add new invoice types (e.g., gym_membership, spa_booking)
- ✅ Eager loading support
- ✅ Relationship constraints

### 5. Backward Compatibility
- ✅ Old JSON data still works during transition
- ✅ Gradual migration possible
- ✅ No breaking changes

## Adding New Invoice Types

To add a new invoice type (e.g., FoodOrder):

### 1. Update the Model
```php
// app/Models/FoodOrder.php
public function invoice()
{
    return $this->morphOne(FinancialInvoice::class, 'invoiceable');
}
```

### 2. Create Invoice
```php
$invoice = $foodOrder->invoice()->create([
    'invoice_no' => 'INV-003',
    'invoice_type' => 'food',
    'total_price' => 2500,
    // ... other fields
]);
```

### 3. Update Migration Command (Optional)
Add a new method in `MigrateInvoicePolymorphicData.php` if you have existing food order invoices to migrate.

## Rollback Plan

If you need to rollback:

### 1. Rollback Migration
```bash
php artisan migrate:rollback
```

### 2. Models Automatically Fallback
The models are designed with fallback logic, so they'll automatically use JSON data if polymorphic columns don't exist.

## Testing Checklist

- [ ] Run migration successfully
- [ ] Run data migration command (dry-run first)
- [ ] Verify data migrated correctly
- [ ] Test creating new room booking invoices
- [ ] Test creating new event booking invoices
- [ ] Test retrieving invoices from bookings
- [ ] Test retrieving bookings from invoices
- [ ] Test eager loading
- [ ] Test existing functionality still works
- [ ] Update controllers to use new approach
- [ ] Remove JSON queries after full migration (optional)

## Performance Comparison

### JSON Query
```sql
-- Slow: Full table scan + JSON parsing
SELECT * FROM financial_invoices 
WHERE invoice_type = 'room_booking' 
AND JSON_CONTAINS(data, '{"booking_id": 123}');
```

### Polymorphic Query
```sql
-- Fast: Uses index
SELECT * FROM financial_invoices 
WHERE invoiceable_type = 'App\\Models\\RoomBooking' 
AND invoiceable_id = 123;
```

## Support

For questions or issues:
1. Check this guide first
2. Review the migration command output
3. Check Laravel logs: `storage/logs/laravel.log`
4. Test with dry-run mode before actual migration

## Next Steps

1. ✅ Run database migration
2. ✅ Test with dry-run
3. ✅ Run actual data migration
4. 🔄 Update controllers to use polymorphic relationships
5. 🔄 Remove old JSON-based queries (optional, after testing)
6. 🔄 Add new invoice types as needed

---

**Created:** October 29, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation
