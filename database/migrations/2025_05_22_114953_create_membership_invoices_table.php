<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMembershipInvoicesTable extends Migration
{
    public function up()
    {
        Schema::create('membership_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('subscription_type');
            $table->decimal('amount', 10, 2);
            $table->decimal('customer_charges', 10, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('membership_invoices');
    }
}
