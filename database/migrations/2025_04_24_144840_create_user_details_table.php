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
        Schema::create('user_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('address_type')->nullable();
            $table->string('country');
            $table->string('state');
            $table->string('city');
            $table->string('zip')->nullable();
            $table->string('address')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('inactive');
            // $table->string('profile_picture')->nullable(); // Store image path or filename
            // $table->string('coa_account')->nullable();
            // $table->string('title')->nullable(); // e.g., Mr., Mrs., Dr.
            $table->string('application_number')->nullable();
            $table->text('name_comments')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_membership')->nullable();
            $table->string('nationality')->nullable();
            $table->string('cnic_no', 13);
            $table->string('passport_no');
            $table->string('gender');
            $table->string('ntn')->nullable();
            $table->date('date_of_birth');
            $table->json('education')->nullable();
            $table->text('membership_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_details');
    }
};
