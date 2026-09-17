<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * These columns are filtered/looked-up on every registrar review and
     * approval request (status filter on the applications list, email
     * lookup when linking an application to an existing user account) but
     * had no index, so those queries were doing full table scans.
     */
    public function up(): void
    {
        Schema::table('online_enrollment_applications', function (Blueprint $table) {
            $table->index('application_status');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::table('online_enrollment_applications', function (Blueprint $table) {
            $table->dropIndex(['application_status']);
            $table->dropIndex(['email']);
        });
    }
};
