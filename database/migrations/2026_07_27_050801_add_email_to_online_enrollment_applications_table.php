<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('online_enrollment_applications', function (Blueprint $table) {
            $table->string('email')->nullable()->after('contact_number');
        });
    }

    public function down(): void
    {
        Schema::table('online_enrollment_applications', function (Blueprint $table) {
            $table->dropColumn('email');
        });
    }
};
