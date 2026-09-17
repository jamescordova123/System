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
        Schema::table('billing_statements', function (Blueprint $table) {
            $table->string('program')->nullable()->after('student_id');
            $table->string('school_year')->nullable()->after('program');
            $table->text('remarks')->nullable()->after('status');

            $table->index(['program', 'school_year']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('billing_line_item_id')
                ->nullable()
                ->after('billing_id')
                ->constrained('billing_line_items')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('billing_line_item_id');
        });

        Schema::table('billing_statements', function (Blueprint $table) {
            $table->dropIndex(['program', 'school_year']);
            $table->dropColumn(['program', 'school_year', 'remarks']);
        });
    }
};
