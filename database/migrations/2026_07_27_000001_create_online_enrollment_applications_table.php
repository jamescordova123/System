<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('online_enrollment_applications', function (Blueprint $table) {
            $table->id();

            // Learner basic info
            $table->string('school_year');
            $table->string('grade_to_enroll');
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->date('birthdate');
            $table->string('place_of_birth');
            $table->string('mother_tongue')->nullable();
            $table->string('sex');

            // Indigenous people / 4Ps
            $table->boolean('is_indigenous')->default(false);
            $table->string('indigenous_specify')->nullable();
            $table->boolean('is_4ps_beneficiary')->default(false);
            $table->string('household_id_number')->nullable();

            // Current address
            $table->string('current_house_no')->nullable();
            $table->string('current_street')->nullable();
            $table->string('current_barangay');
            $table->string('current_municipality');
            $table->string('current_province');
            $table->string('current_country')->default('Philippines');
            $table->string('current_zip_code')->nullable();

            // Permanent address
            $table->boolean('permanent_same_as_current')->default(true);
            $table->string('permanent_house_no')->nullable();
            $table->string('permanent_street')->nullable();
            $table->string('permanent_barangay')->nullable();
            $table->string('permanent_municipality')->nullable();
            $table->string('permanent_province')->nullable();
            $table->string('permanent_country')->nullable();
            $table->string('permanent_zip_code')->nullable();

            // Parents / guardians
            $table->string('father_last_name')->nullable();
            $table->string('father_first_name')->nullable();
            $table->string('father_middle_name')->nullable();
            $table->string('father_contact')->nullable();

            $table->string('mother_last_name')->nullable();
            $table->string('mother_first_name')->nullable();
            $table->string('mother_middle_name')->nullable();
            $table->string('mother_contact')->nullable();

            $table->string('guardian_last_name')->nullable();
            $table->string('guardian_first_name')->nullable();
            $table->string('guardian_middle_name')->nullable();
            $table->string('guardian_contact')->nullable();

            // Senior high school
            $table->date('jhs_graduation_date')->nullable();
            $table->string('shs_semester')->nullable();
            $table->string('shs_track')->nullable();
            $table->string('shs_strand')->nullable();

            // Distance learning preferences
            $table->json('learning_modalities')->nullable();

            // Contact
            $table->string('contact_number');
            $table->string('fb_account')->nullable();

            // Previous school
            $table->string('prev_school_name')->nullable();
            $table->string('prev_school_address')->nullable();
            $table->string('prev_section')->nullable();
            $table->string('prev_school_year')->nullable();
            $table->date('prev_graduation_date')->nullable();
            $table->string('prev_average')->nullable();

            // Enrollment status type
            $table->string('learner_status'); // PEAC, paying, working, scholar

            // Application workflow
            $table->string('application_status')->default('pending'); // pending, reviewed, approved, rejected
            $table->text('registrar_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('online_enrollment_applications');
    }
};
