<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Per-fee deadline. When null, the deadline is worked out from the school-year start (config/risk.php).
        Schema::table('billing_line_items', function (Blueprint $table) {
            $table->date('due_date')->nullable()->after('amount_paid');
        });

        // Model output for each section.
        Schema::table('risk_predictions', function (Blueprint $table) {
            $table->decimal('probability', 5, 4)->nullable()->after('risk_level');
            $table->string('model_version')->nullable()->after('model_used');
            $table->unsignedInteger('fees_scored')->nullable()->after('model_version');
            $table->json('drivers')->nullable()->after('fees_scored');
        });
    }

    public function down(): void
    {
        Schema::table('risk_predictions', function (Blueprint $table) {
            $table->dropColumn(['probability', 'model_version', 'fees_scored', 'drivers']);
        });

        Schema::table('billing_line_items', function (Blueprint $table) {
            $table->dropColumn('due_date');
        });
    }
};
