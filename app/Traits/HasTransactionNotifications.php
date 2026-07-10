<?php

namespace App\Traits;

use App\Notifications\TransactionNotification;
use InvalidArgumentException;

trait HasTransactionNotifications
{
    /**
     * Dispatch a transaction notification to this model.
     *
     * @param array{
     *     id: string|int,
     *     amount: float|int|string,
     *     currency: string,
     *     status: 'success'|'pending'|'failed',
     *     message: string
     * } $details
     *
     * @throws InvalidArgumentException
     */
    public function notifyTransaction(array $details): void
    {
        // Strict production-grade structural validation
        $requiredKeys = ['id', 'amount', 'currency', 'status', 'message'];
        foreach ($requiredKeys as $key) {
            if (! array_key_exists($key, $details)) {
                throw new InvalidArgumentException("Missing required transaction detail key: '{$key}'.");
            }
        }

        if (! in_array($details['status'], ['success', 'pending', 'failed'], true)) {
            throw new InvalidArgumentException("Transaction status must be one of: 'success', 'pending', 'failed'.");
        }

        // Trigger Laravel's internal Notifiable notify method
        $this->notify(new TransactionNotification($details));
    }
}
