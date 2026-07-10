<?php

namespace App\Models;

use App\Traits\HasAttachments;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\MediaLibrary\HasMedia;

/**
 * @property int $id
 * @property int $requester_id
 * @property int|null $recipient_id
 * @property string $action_type
 * @property string $status
 * @property string $reason
 * @property string|null $sensitive_tracking_data
 * @property int $actionable_id
 * @property string $actionable_type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * 
 * @property-read \App\Models\User $requester
 * @property-read \App\Models\User|null $recipient
 * @property-read \Illuminate\Database\Eloquent\Model $actionable
 */
class ActionRequest extends Model implements HasMedia
{
    use HasAttachments;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'requester_id',
        'recipient_id',
        'action_type',
        'status',
        'reason',
        'sensitive_tracking_data',
        'actionable_id',
        'actionable_type',
    ];

    /**
     * Get the requester who submitted the action request.
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * Get the recipient who is specified to receive/review the action request.
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Get the parent actionable model (polymorphic).
     */
    public function actionable(): MorphTo
    {
        return $this->morphTo();
    }
}
