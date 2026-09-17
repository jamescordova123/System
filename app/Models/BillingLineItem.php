<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * One assessed fee for one student — replaces the AR#_X / X_Fee column
 * pairs from the legacy per-grade fee sheets. Carries its own AR number
 * and paid amount so each fee can be settled and audited individually.
 *
 * @property int $id
 * @property int $billing_id
 * @property int $fee_catalog_item_id
 * @property string|null $ar_number
 * @property string $amount_due
 * @property string $amount_paid
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class BillingLineItem extends Model
{
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'billing_id',
        'fee_catalog_item_id',
        'ar_number',
        'amount_due',
        'amount_paid',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount_due' => 'decimal:2',
            'amount_paid' => 'decimal:2',
        ];
    }

    public function billingStatement(): BelongsTo
    {
        return $this->belongsTo(BillingStatement::class, 'billing_id');
    }

    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(FeeCatalogItem::class, 'fee_catalog_item_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'billing_line_item_id');
    }

    public function balance(): float
    {
        return max(0, (float) $this->amount_due - (float) $this->amount_paid);
    }
}
