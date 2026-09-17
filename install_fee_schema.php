<?php

/**
 * One-shot installer for the Student Fees schema.
 * Run from the project root:
 *   php install_fee_schema.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Database\Seeders\FeeCatalogSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Installing Student Fees schema...\n";

if (! Schema::hasTable('fee_catalog_items')) {
    Schema::create('fee_catalog_items', function ($table) {
        $table->id();
        $table->string('program');
        $table->string('code');
        $table->string('label');
        $table->string('category')->default('fee');
        $table->decimal('default_amount', 12, 2)->default(0);
        $table->unsignedSmallInteger('sort_order')->default(0);
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
        $table->unique(['program', 'code']);
        $table->index('program');
    });
    echo "  + fee_catalog_items\n";
} else {
    echo "  = fee_catalog_items already exists\n";
}

if (! Schema::hasTable('billing_line_items')) {
    Schema::create('billing_line_items', function ($table) {
        $table->id();
        $table->foreignId('billing_id')->constrained('billing_statements')->cascadeOnDelete();
        $table->foreignId('fee_catalog_item_id')->constrained('fee_catalog_items')->restrictOnDelete();
        $table->string('ar_number')->nullable();
        $table->decimal('amount_due', 12, 2);
        $table->decimal('amount_paid', 12, 2)->default(0);
        $table->timestamps();
        $table->softDeletes();
        $table->unique(['billing_id', 'fee_catalog_item_id']);
    });
    echo "  + billing_line_items\n";
} else {
    echo "  = billing_line_items already exists\n";
}

if (! Schema::hasColumn('billing_statements', 'program')) {
    Schema::table('billing_statements', function ($table) {
        $table->string('program')->nullable()->after('student_id');
        $table->string('school_year')->nullable()->after('program');
        $table->text('remarks')->nullable()->after('status');
        $table->index(['program', 'school_year']);
    });
    echo "  + billing_statements.program / school_year / remarks\n";
} else {
    echo "  = billing_statements fee columns already exist\n";
}

if (! Schema::hasColumn('payments', 'billing_line_item_id')) {
    Schema::table('payments', function ($table) {
        $table->foreignId('billing_line_item_id')
            ->nullable()
            ->after('billing_id')
            ->constrained('billing_line_items')
            ->nullOnDelete();
    });
    echo "  + payments.billing_line_item_id\n";
} else {
    echo "  = payments.billing_line_item_id already exists\n";
}

$batch = ((int) DB::table('migrations')->max('batch')) + 1;
foreach ([
    '2026_07_28_150000_create_fee_catalog_items_table',
    '2026_07_28_150100_create_billing_line_items_table',
    '2026_07_28_150200_add_fee_fields_to_billing_statements_and_payments_tables',
] as $migration) {
    if (! DB::table('migrations')->where('migration', $migration)->exists()) {
        DB::table('migrations')->insert(['migration' => $migration, 'batch' => $batch]);
    }
}

Artisan::call('db:seed', ['--class' => FeeCatalogSeeder::class, '--force' => true]);
echo "  + FeeCatalogSeeder\n";
echo "Done. Reload /cashier/student-fees\n";
