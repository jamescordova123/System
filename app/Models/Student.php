<?php

namespace App\Models;

use App\Enums\StudentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $student_number
 * @property string $first_name
 * @property string $last_name
 * @property string|null $middle_name
 * @property Carbon $birthdate
 * @property string $gender
 * @property string|null $contact_number
 * @property string|null $address
 * @property StudentStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class Student extends Model
{
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'student_number',
        'first_name',
        'last_name',
        'middle_name',
        'birthdate',
        'gender',
        'contact_number',
        'address',
        'status',
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
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
            'jhs_graduation_date' => 'date',
            'prev_graduation_date' => 'date',
            'status' => StudentStatus::class,
            'is_indigenous' => 'boolean',
            'is_4ps_beneficiary' => 'boolean',
            'permanent_same_as_current' => 'boolean',
            'learning_modalities' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function billingStatements(): HasMany
    {
        return $this->hasMany(BillingStatement::class);
    }

    public function paymentHistory(): HasOne
    {
        return $this->hasOne(PaymentHistory::class);
    }

    /**
     * Online enrollment applications linked to this student. An application
     * is only linked once it has been approved and a portal account created
     * for it — pending/reviewed/rejected applications have no student yet.
     */
    public function onlineEnrollmentApplications(): HasMany
    {
        return $this->hasMany(OnlineEnrollmentApplication::class);
    }
}
