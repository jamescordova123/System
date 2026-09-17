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
        Schema::create('billing_line_items', function (Blueprint $table) {
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_line_items');
    }
};
