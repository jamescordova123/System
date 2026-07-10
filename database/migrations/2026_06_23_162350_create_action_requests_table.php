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
        Schema::create('action_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('action_type');
            $table->string('status')->default('pending');
            $table->text('reason');
            $table->text('sensitive_tracking_data')->nullable();
            
            // Polymorphic association fields (actionable_id & actionable_type)
            $table->morphs('actionable');
            
            $table->timestamps();

            // Indexing for performance optimization
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('action_requests');
    }
};
