<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_no')->unique();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->foreignId('event_venue_id')->nullable()->constrained('event_venues')->onDelete('set null');
            $table->unsignedBigInteger('family_id')->nullable();
            $table->date('booking_date')->nullable();
            $table->date('event_date')->nullable();
            $table->time('event_time_from')->nullable();
            $table->time('event_time_to')->nullable();
            $table->string('arrival_details')->nullable();

            // booking metadata
            $table->string('booking_type')->nullable();
            $table->string('booked_by')->nullable();
            $table->decimal('menu_charges', 10, 2)->nullable();
            $table->decimal('addons_charges', 10, 2)->nullable();
            $table->decimal('total_per_person_charges', 10, 2)->nullable();
            $table->bigInteger('no_of_guests')->default(0);
            $table->bigInteger('guest_charges')->default(0);
            $table->bigInteger('extra_guests')->default(0);
            $table->bigInteger('extra_guest_charges')->default(0);
            $table->bigInteger('total_food_charges')->default(0);
            $table->bigInteger('total_other_charges')->default(0);
            $table->bigInteger('total_charges')->default(0);
            $table->decimal('surcharge', 10, 2)->default(0);
            $table->decimal('reduction', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2)->nullable();
            $table->text('booking_docs')->nullable();
            $table->text('additional_notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'refunded'])->default('pending');
            $table->json('additional_data')->nullable();

            $table->bigInteger('created_by')->nullable();
            $table->bigInteger('updated_by')->nullable();
            $table->bigInteger('deleted_by')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_bookings');
    }
};
