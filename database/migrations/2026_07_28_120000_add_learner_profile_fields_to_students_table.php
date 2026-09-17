<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('school_year')->nullable()->after('status');
            $table->string('grade_to_enroll')->nullable()->after('school_year');
            $table->string('learner_status')->nullable()->after('grade_to_enroll');
            $table->string('place_of_birth')->nullable()->after('learner_status');
            $table->string('mother_tongue')->nullable()->after('place_of_birth');
            $table->boolean('is_indigenous')->default(false)->after('mother_tongue');
            $table->string('indigenous_specify')->nullable()->after('is_indigenous');
            $table->boolean('is_4ps_beneficiary')->default(false)->after('indigenous_specify');
            $table->string('household_id_number')->nullable()->after('is_4ps_beneficiary');
            $table->string('current_house_no')->nullable()->after('household_id_number');
            $table->string('current_street')->nullable()->after('current_house_no');
            $table->string('current_barangay')->nullable()->after('current_street');
            $table->string('current_municipality')->nullable()->after('current_barangay');
            $table->string('current_province')->nullable()->after('current_municipality');
            $table->string('current_country')->nullable()->default('Philippines')->after('current_province');
            $table->string('current_zip_code')->nullable()->after('current_country');
            $table->boolean('permanent_same_as_current')->default(true)->after('current_zip_code');
            $table->string('permanent_house_no')->nullable()->after('permanent_same_as_current');
            $table->string('permanent_street')->nullable()->after('permanent_house_no');
            $table->string('permanent_barangay')->nullable()->after('permanent_street');
            $table->string('permanent_municipality')->nullable()->after('permanent_barangay');
            $table->string('permanent_province')->nullable()->after('permanent_municipality');
            $table->string('permanent_country')->nullable()->after('permanent_province');
            $table->string('permanent_zip_code')->nullable()->after('permanent_country');
            $table->string('father_last_name')->nullable()->after('permanent_zip_code');
            $table->string('father_first_name')->nullable()->after('father_last_name');
            $table->string('father_middle_name')->nullable()->after('father_first_name');
            $table->string('father_contact')->nullable()->after('father_middle_name');
            $table->string('mother_last_name')->nullable()->after('father_contact');
            $table->string('mother_first_name')->nullable()->after('mother_last_name');
            $table->string('mother_middle_name')->nullable()->after('mother_first_name');
            $table->string('mother_contact')->nullable()->after('mother_middle_name');
            $table->string('guardian_last_name')->nullable()->after('mother_contact');
            $table->string('guardian_first_name')->nullable()->after('guardian_last_name');
            $table->string('guardian_middle_name')->nullable()->after('guardian_first_name');
            $table->string('guardian_contact')->nullable()->after('guardian_middle_name');
            $table->date('jhs_graduation_date')->nullable()->after('guardian_contact');
            $table->string('shs_semester')->nullable()->after('jhs_graduation_date');
            $table->string('shs_track')->nullable()->after('shs_semester');
            $table->string('shs_strand')->nullable()->after('shs_track');
            $table->json('learning_modalities')->nullable()->after('shs_strand');
            $table->string('fb_account')->nullable()->after('learning_modalities');
            $table->string('prev_school_name')->nullable()->after('fb_account');
            $table->string('prev_school_address')->nullable()->after('prev_school_name');
            $table->string('prev_section')->nullable()->after('prev_school_address');
            $table->string('prev_school_year')->nullable()->after('prev_section');
            $table->date('prev_graduation_date')->nullable()->after('prev_school_year');
            $table->string('prev_average')->nullable()->after('prev_graduation_date');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'school_year',
                'grade_to_enroll',
                'learner_status',
                'place_of_birth',
                'mother_tongue',
                'is_indigenous',
                'indigenous_specify',
                'is_4ps_beneficiary',
                'household_id_number',
                'current_house_no',
                'current_street',
                'current_barangay',
                'current_municipality',
                'current_province',
                'current_country',
                'current_zip_code',
                'permanent_same_as_current',
                'permanent_house_no',
                'permanent_street',
                'permanent_barangay',
                'permanent_municipality',
                'permanent_province',
                'permanent_country',
                'permanent_zip_code',
                'father_last_name',
                'father_first_name',
                'father_middle_name',
                'father_contact',
                'mother_last_name',
                'mother_first_name',
                'mother_middle_name',
                'mother_contact',
                'guardian_last_name',
                'guardian_first_name',
                'guardian_middle_name',
                'guardian_contact',
                'jhs_graduation_date',
                'shs_semester',
                'shs_track',
                'shs_strand',
                'learning_modalities',
                'fb_account',
                'prev_school_name',
                'prev_school_address',
                'prev_section',
                'prev_school_year',
                'prev_graduation_date',
                'prev_average',
            ]);
        });
    }
};
