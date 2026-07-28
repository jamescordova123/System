<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $school_year
 * @property string $grade_to_enroll
 * @property string $last_name
 * @property string $first_name
 * @property string|null $middle_name
 * @property Carbon $birthdate
 * @property string $application_status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class OnlineEnrollmentApplication extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'school_year',
        'grade_to_enroll',
        'last_name',
        'first_name',
        'middle_name',
        'birthdate',
        'place_of_birth',
        'mother_tongue',
        'sex',
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
        'contact_number',
        'email',
        'fb_account',
        'prev_school_name',
        'prev_school_address',
        'prev_section',
        'prev_school_year',
        'prev_graduation_date',
        'prev_average',
        'learner_status',
        'application_status',
        'registrar_notes',
        'reviewed_by',
        'reviewed_at',
        'student_id',
    ];

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
            'jhs_graduation_date' => 'date',
            'prev_graduation_date' => 'date',
            'is_indigenous' => 'boolean',
            'is_4ps_beneficiary' => 'boolean',
            'permanent_same_as_current' => 'boolean',
            'learning_modalities' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Once an application has been finalized (approved or rejected), the
     * registrar can no longer change its status.
     */
    public function isFinalized(): bool
    {
        return in_array($this->application_status, ['approved', 'rejected'], true);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->last_name}, {$this->first_name} {$this->middle_name}");
    }
}
