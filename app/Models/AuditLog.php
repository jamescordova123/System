<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'event',
        'description',
        'user_id',
        'user_email',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that triggered this log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
