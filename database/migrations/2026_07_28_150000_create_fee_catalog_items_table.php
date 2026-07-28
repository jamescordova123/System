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
        Schema::create('fee_catalog_items', function (Blueprint $table) {
            $table->id();
            $table->string('program'); // grade_11, grade_12, graduation, japanese_language
            $table->string('code');
            $table->string('label');
            $table->string('category')->default('fee'); // fee, test_paper, consumable
            $table->decimal('default_amount', 12, 2)->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['program', 'code']);
            $table->index('program');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_catalog_items');
    }
};
