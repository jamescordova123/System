<?php

namespace App\Models;

use App\Enums\RiskLevel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $section_id
 * @property RiskLevel $risk_level
 * @property float|null $probability
 * @property string $model_used
 * @property string|null $model_version
 * @property int|null $fees_scored
 * @property array<int, string>|null $drivers
 * @property Carbon $prediction_date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class RiskPrediction extends Model
{
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'section_id',
        'risk_level',
        'probability',
        'model_used',
        'model_version',
        'fees_scored',
        'drivers',
        'prediction_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'risk_level' => RiskLevel::class,
            'prediction_date' => 'date',
            'probability' => 'float',
            'drivers' => 'array',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
}
