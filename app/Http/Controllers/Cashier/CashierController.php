<?php

namespace App\Http\Controllers\Cashier;

use App\Enums\BillingStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Models\BillingStatement;
use App\Models\Payment;
use App\Models\PaymentHistory;
use App\Models\Receipt;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Cashier/Dashboard', [
            'stats' => [
                'billing_total' => BillingStatement::count(),
                'unpaid' => BillingStatement::where('status', 'unpaid')->count(),
                'partial' => BillingStatement::where('status', 'partial')->count(),
                'collected' => Payment::sum('amount_paid'),
                'payments_today' => Payment::whereDate('payment_date', today())->count(),
            ],
            'recentPayments' => Payment::with(['billingStatement.student', 'receivedBy'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn (Payment $p) => $this->formatPayment($p)),
        ]);
    }

    public function billing()
    {
        return Inertia::render('Cashier/Billing/Index', [
            'statements' => BillingStatement::with('student')
                ->latest()
                ->get()
                ->map(fn (BillingStatement $b) => $this->formatBilling($b)),
            'stats' => [
                'total' => BillingStatement::count(),
                'unpaid' => BillingStatement::where('status', 'unpaid')->count(),
                'partial' => BillingStatement::where('status', 'partial')->count(),
                'paid' => BillingStatement::where('status', 'paid')->count(),
            ],
            'studentOptions' => Student::orderBy('last_name')
                ->get()
                ->map(fn (Student $s) => [
                    'value' => $s->id,
                    'label' => trim("{$s->student_number} — {$s->first_name} {$s->last_name}"),
                ]),
        ]);
    }

    public function storeBilling(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'status' => ['required', Rule::enum(BillingStatus::class)],
        ]);

        BillingStatement::create($validated);
        $this->syncPaymentHistory((int) $validated['student_id']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Billing statement created successfully.']);

        return redirect()->route('cashier.billing');
    }

    public function updateBilling(Request $request, BillingStatement $billing)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'status' => ['required', Rule::enum(BillingStatus::class)],
        ]);

        $billing->update($validated);
        $this->syncPaymentHistory((int) $validated['student_id']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Billing statement updated successfully.']);

        return redirect()->route('cashier.billing');
    }

    public function destroyBilling(BillingStatement $billing)
    {
        $studentId = $billing->student_id;
        $billing->delete();
        $this->syncPaymentHistory($studentId);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Billing statement deleted successfully.']);

        return redirect()->route('cashier.billing');
    }

    public function payments()
    {
        return Inertia::render('Cashier/Payments/Index', [
            'payments' => Payment::with(['billingStatement.student', 'receivedBy'])
                ->latest()
                ->get()
                ->map(fn (Payment $p) => $this->formatPayment($p)),
            'stats' => [
                'total' => Payment::count(),
                'collected' => number_format((float) Payment::sum('amount_paid'), 2),
            ],
            'billingOptions' => BillingStatement::with('student')
                ->whereIn('status', ['unpaid', 'partial'])
                ->latest()
                ->get()
                ->map(fn (BillingStatement $b) => [
                    'value' => $b->id,
                    'label' => sprintf(
                        '%s — ₱%s due %s',
                        trim("{$b->student?->first_name} {$b->student?->last_name}"),
                        number_format((float) $b->total_amount, 2),
                        $b->due_date->format('M d, Y')
                    ),
                    'total_amount' => (float) $b->total_amount,
                ]),
        ]);
    }

    public function storePayment(Request $request)
    {
        $validated = $request->validate([
            'billing_id' => 'required|exists:billing_statements,id',
            'amount_paid' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $billing = BillingStatement::findOrFail($validated['billing_id']);

            $payment = Payment::create([
                'billing_id' => $billing->id,
                'amount_paid' => $validated['amount_paid'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'received_by' => $request->user()->id,
            ]);

            Receipt::create([
                'payment_id' => $payment->id,
                'receipt_number' => 'RCP-'.now()->format('Ymd').'-'.str_pad((string) $payment->id, 4, '0', STR_PAD_LEFT),
                'issued_date' => $validated['payment_date'],
            ]);

            $totalPaid = (float) $billing->payments()->sum('amount_paid');
            $totalAmount = (float) $billing->total_amount;

            if ($totalPaid >= $totalAmount) {
                $billing->update(['status' => BillingStatus::Paid]);
            } elseif ($totalPaid > 0) {
                $billing->update(['status' => BillingStatus::Partial]);
            }

            $this->syncPaymentHistory($billing->student_id);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment recorded and receipt issued.']);

        return redirect()->route('cashier.payments');
    }

    public function receipts()
    {
        return Inertia::render('Cashier/Receipts/Index', [
            'receipts' => Receipt::with('payment.billingStatement.student')
                ->latest()
                ->get()
                ->map(fn (Receipt $r) => [
                    'id' => $r->id,
                    'receipt_number' => $r->receipt_number,
                    'student_name' => trim("{$r->payment?->billingStatement?->student?->first_name} {$r->payment?->billingStatement?->student?->last_name}"),
                    'amount' => number_format((float) ($r->payment?->amount_paid ?? 0), 2),
                    'issued_at' => $r->issued_date?->format('M d, Y h:i A'),
                ]),
            'stats' => [
                'total' => Receipt::count(),
            ],
        ]);
    }

    public function paymentHistory()
    {
        return Inertia::render('Cashier/PaymentHistory/Index', [
            'histories' => PaymentHistory::with('student')
                ->latest()
                ->get()
                ->map(fn (PaymentHistory $h) => [
                    'id' => $h->id,
                    'student_name' => trim("{$h->student?->first_name} {$h->student?->last_name}"),
                    'student_number' => $h->student?->student_number,
                    'total_paid' => number_format((float) $h->total_paid, 2),
                    'last_payment_date' => $h->last_payment_date?->format('M d, Y'),
                ]),
            'stats' => [
                'total' => PaymentHistory::count(),
            ],
        ]);
    }

    private function syncPaymentHistory(int $studentId): void
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

        PaymentHistory::updateOrCreate(
            ['student_id' => $studentId],
            [
                'total_paid' => $totalPaid,
                'total_balance' => max(0, $totalBilled - $totalPaid),
                'last_payment_date' => $lastPayment?->payment_date,
            ]
        );
    }

    private function formatBilling(BillingStatement $b): array
    {
        return [
            'id' => $b->id,
            'student_id' => $b->student_id,
            'student_name' => trim("{$b->student?->first_name} {$b->student?->last_name}"),
            'student_number' => $b->student?->student_number,
            'total_amount' => number_format((float) $b->total_amount, 2),
            'total_amount_raw' => (float) $b->total_amount,
            'due_date' => $b->due_date->format('Y-m-d'),
            'due_date_display' => $b->due_date->format('M d, Y'),
            'status' => $b->status->value,
        ];
    }

    private function formatPayment(Payment $p): array
    {
        return [
            'id' => $p->id,
            'student_name' => trim("{$p->billingStatement?->student?->first_name} {$p->billingStatement?->student?->last_name}"),
            'amount_paid' => number_format((float) $p->amount_paid, 2),
            'payment_method' => $p->payment_method->value,
            'payment_date' => $p->payment_date->format('M d, Y'),
            'received_by' => $p->receivedBy?->name,
        ];
    }
}
