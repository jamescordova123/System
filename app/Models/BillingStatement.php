<?php

namespace App\Models;

use App\Enums\BillingStatus;
use App\Enums\FeeProgram;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property FeeProgram|null $program
 * @property string|null $school_year
 * @property string $total_amount
 * @property Carbon $due_date
 * @property BillingStatus $status
 * @property string|null $remarks
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class BillingStatement extends Model
{
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'program',
        'school_year',
        'total_amount',
        'due_date',
        'status',
        'remarks',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'program' => FeeProgram::class,
            'total_amount' => 'decimal:2',
            'due_date' => 'date',
            'status' => BillingStatus::class,
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'billing_id');
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(BillingLineItem::class, 'billing_id');
    }

    /**
     * Recompute total_amount and status from line items. Only meaningful
     * for itemized (program-based) statements.
     */
    public function recalculateFromLineItems(): void
    {
        $totalDue = (float) $this->lineItems()->sum('amount_due');
        $totalPaid = (float) $this->lineItems()->sum('amount_paid');

        $status = BillingStatus::Unpaid;
        if ($totalDue > 0 && $totalPaid >= $totalDue) {
            $status = BillingStatus::Paid;
        } elseif ($totalPaid > 0) {
            $status = BillingStatus::Partial;
        }

        $this->update([
            'total_amount' => $totalDue,
            'status' => $status,
        ]);
    }
}
