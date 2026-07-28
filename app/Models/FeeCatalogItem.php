<?php

namespace App\Models;

use App\Enums\FeeProgram;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * A single billable fee item in the catalog, scoped to a program
 * (Grade 11, Grade 12, Graduation, Japanese Language). New fees are
 * added as rows here instead of new columns on wide per-grade tables.
 *
 * @property int $id
 * @property FeeProgram $program
 * @property string $code
 * @property string $label
 * @property string $category
 * @property string $default_amount
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class FeeCatalogItem extends Model
{
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'program',
        'code',
        'label',
        'category',
        'default_amount',
        'sort_order',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'program' => FeeProgram::class,
            'default_amount' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(BillingLineItem::class);
    }
}
