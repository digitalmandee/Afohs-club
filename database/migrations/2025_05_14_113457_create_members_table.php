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
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_detail_id')->constrained('user_details')->onDelete('cascade');
            $table->foreignId('member_type_id')->nullable()->constrained('member_types')->onDelete('set null');
            $table->string('membership_category')->nullable();
            $table->string('membership_number')->nullable()->unique();
            $table->date('membership_date')->nullable();
            $table->enum('card_status', ['active', 'inactive'])->default('inactive')->nullable();
            $table->date('card_issue_date')->nullable();
            $table->date('card_expiry_date')->nullable();
            $table->date('from_date')->nullable();
            $table->date('to_date')->nullable();
            $table->string('member_image')->nullable();
            $table->string('full_name')->nullable(); // For family members
            $table->string('relation')->nullable(); // For family members
            $table->string('cnic')->nullable(); // For family members
            $table->string('phone_number')->nullable(); // For family members
            $table->string('membership_type')->nullable(); // For family members
            $table->date('start_date')->nullable(); // For family members
            $table->date('end_date')->nullable(); // For family members
            $table->string('picture')->nullable(); // For family members
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
