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
}
