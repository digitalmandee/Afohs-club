<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPrimaryMemberIdToMembersTable extends Migration
{
    public function up()
    {
        Schema::table('members', function (Blueprint $table) {
            $table->bigInteger('primary_member_id')->unsigned()->nullable()->after('user_detail_id');
            $table->foreign('primary_member_id')->references('id')->on('members')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropForeign(['primary_member_id']);
            $table->dropColumn('primary_member_id');
        });
    }
}
