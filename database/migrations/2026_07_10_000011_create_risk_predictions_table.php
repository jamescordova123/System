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
        Schema::create('risk_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->enum('risk_level', ['low', 'medium', 'high']);
            $table->string('model_used');
            $table->date('prediction_date');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['section_id', 'prediction_date']);
            $table->index('risk_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('risk_predictions');
    }
};
