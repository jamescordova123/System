<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property string $total_paid
 * @property string $total_balance
 * @property Carbon|null $last_payment_date
 * @property int $payment_delay_days
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class PaymentHistory extends Model
{
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'total_paid',
        'total_balance',
        'last_payment_date',
        'payment_delay_days',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_paid' => 'decimal:2',
            'total_balance' => 'decimal:2',
            'last_payment_date' => 'date',
            'payment_delay_days' => 'integer',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Recompute the per-student rollup from billing statements and payments.
     */
    public static function syncFor(int $studentId): void
    {
        $totalBilled = (float) BillingStatement::where('student_id', $studentId)->sum('total_amount');
        $totalPaid = (float) Payment::whereHas(
            'billingStatement',
            fn ($q) => $q->where('student_id', $studentId)
        )->sum('amount_paid');

        $lastPayment = Payment::whereHas(
            'billingStatement',
            fn ($q) => $q->where('student_id', $studentId)
        )->latest('payment_date')->first();

        self::updateOrCreate(
            ['student_id' => $studentId],
            [
                'total_paid' => $totalPaid,
                'total_balance' => max(0, $totalBilled - $totalPaid),
                'last_payment_date' => $lastPayment?->payment_date,
            ]
        );
    }
}
