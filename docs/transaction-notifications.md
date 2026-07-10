# Transaction Notifications Integration Guide

This guide details how to trigger, monitor, and customize the real-time **Transaction Notifications** system implemented in this starter kit.

---

## 1. Backend Usage

The notification pipeline uses the `HasTransactionNotifications` trait on the `User` model, linking into Laravel's native notification and queue pipeline.

### Triggering via Artisan Tinker (Quick Testing)
Run the following command in your terminal to start an interactive shell:
```bash
php artisan tinker
```
Then copy and run this snippet to test a notification:
```php
// Find any test user
$user = App\Models\User::first();

// Dispatch a real-time transaction notification
$user->notifyTransaction([
    'id' => 'TXN-' . Str::upper(Str::random(8)),
    'amount' => 125.50,
    'currency' => 'USD',
    'status' => 'success', // Options: 'success', 'pending', 'failed'
    'message' => 'Your subscription payment was processed successfully.'
]);
```

### Triggering inside Controllers or Jobs
To fire notifications dynamically on events (e.g. Stripe webhooks or payment processors):

```php
use App\Models\User;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function handleWebhook(Request $request)
    {
        // 1. Process payment and identify the user...
        $user = User::where('email', $request->input('email'))->first();

        // 2. Dispatch the transaction notification
        $user->notifyTransaction([
            'id'       => $request->input('transaction_id'),
            'amount'   => $request->input('amount'),
            'currency' => $request->input('currency', 'USD'),
            'status'   => $request->input('status'), // 'success', 'pending', or 'failed'
            'message'  => 'Payment of ' . $request->input('amount') . ' USD received.'
        ]);

        return response()->json(['status' => 'success']);
    }
}
```

---

## 2. Notification Pipeline & Data Flow

When `notifyTransaction()` is executed, the following actions occur:

1. **Validation:** [HasTransactionNotifications.php](file:///c:/Users/Jelo/Documents/GitHub/jabsstarterkit/LaravelStarterKit/app/Traits/HasTransactionNotifications.php) runs validation checks to ensure all required fields are present (`id`, `amount`, `currency`, `status`, `message`) and that `status` is one of `success`, `pending`, or `failed`.
2. **Database Storage:** A record is written to the `notifications` table containing the array payload under the `data` column.
3. **Queueing:** Since `TransactionNotification` implements `ShouldQueue`, the broadcast job is dispatched to your queue workers.
4. **WebSocket Broadcast:** The notification is broadcasted securely over **Laravel Reverb** on a private channel named:
   ```text
   private-App.Models.User.{id}
   ```

---

## 3. Frontend Real-Time Client Reception

The frontend dropdown listens for Reverb events and displays alerts dynamically.

### Listening to Events
The [NotificationDropdown.tsx](file:///c:/Users/Jelo/Documents/GitHub/jabsstarterkit/LaravelStarterKit/resources/js/components/NotificationDropdown.tsx) component establishes an Echo subscription:

```typescript
const channelName = `App.Models.User.${auth.user.id}`;

window.Echo.private(channelName).notification((notification: any) => {
    // 1. Checks if it is a App\Notifications\TransactionNotification
    // 2. Prepends the item to the notifications state instantly
    // 3. Displays a browser toast with Sonner
});
```

### Visual Styling States
The UI adapts automatically depending on the transaction status:
* **`success`:** Emerald Green circle with checkmark icon ➡️ Displays a green success toast.
* **`pending`:** Amber circle with spinning loader icon ➡️ Displays an info/warning toast.
* **`failed`:** Red circle with X icon ➡️ Displays an error toast.

---

## 4. Production Checklist

* **Queue Worker:** Ensure your queue worker is running in the background to handle the async broadcasting:
  ```bash
  php artisan queue:work
  ```
* **Database Driver:** Ensure the migrations have created the `notifications` table:
  ```bash
  php artisan notifications:table
  php artisan migrate
  ```
* **Broadcasting Setup:** Ensure `BROADCAST_CONNECTION=reverb` is configured in your production `.env` environment.
