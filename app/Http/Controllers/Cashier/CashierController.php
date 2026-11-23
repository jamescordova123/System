<?php

namespace App\Http\Controllers\Cashier;

use App\Enums\BillingStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Models\BillingStatement;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\PaymentHistory;
use App\Models\Receipt;
use App\Models\RiskPrediction;
use App\Models\Section;
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

    public function analytics()
    {
        $monthlyRevenue = DB::table('payments')
            ->select(DB::raw('DATE_FORMAT(payment_date, "%Y-%m") as month'), DB::raw('sum(amount_paid) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->take(12)
            ->get()
            ->map(fn($item) => ['month' => $item->month, 'total' => (float)$item->total]);

        $sections = Section::all();
        $sectionPerformance = $sections->map(function (Section $section) {
            $studentIds = Enrollment::where('section_id', $section->id)->pluck('student_id');
            $billingStatements = BillingStatement::whereIn('student_id', $studentIds)->get();
            $totalBilled = $billingStatements->sum('total_amount');
            
            $billingIds = $billingStatements->pluck('id');
            $totalCollected = Payment::whereIn('billing_id', $billingIds)->sum('amount_paid');
            
            return [
                'id' => $section->id,
                'section_name' => $section->section_name,
                'course_name' => $section->course_name,
                'billed' => (float)$totalBilled,
                'collected' => (float)$totalCollected,
                'outstanding' => (float)max(0, $totalBilled - $totalCollected),
            ];
        });

        return Inertia::render('Cashier/Analytics', [
            'monthlyRevenue' => $monthlyRevenue,
            'sectionPerformance' => $sectionPerformance,
        ]);
    }

    public function payments()
    {
        return Inertia::render('Cashier/Payments/Index', [
            'payments' => Payment::with(['billingStatement.student', 'receivedBy'])
                ->latest()
                ->get()
                ->map(fn (Payment $p) => $this->formatPayment($p)),
            'histories' => PaymentHistory::with('student')
                ->latest()
                ->get()
                ->map(fn (PaymentHistory $h) => $this->formatPaymentHistory($h)),
            'stats' => [
                'total' => Payment::count(),
                'collected' => number_format((float) Payment::sum('amount_paid'), 2),
                'students_tracked' => PaymentHistory::count(),
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
            'receipts' => Receipt::with('payment.billingStatement.student', 'payment.receivedBy')
                ->latest()
                ->get()
                ->map(fn (Receipt $r) => [
                    'id' => $r->id,
                    'receipt_number' => $r->receipt_number,
                    'student_name' => trim("{$r->payment?->billingStatement?->student?->first_name} {$r->payment?->billingStatement?->student?->last_name}"),
                    'student_number' => $r->payment?->billingStatement?->student?->student_number,
                    'amount' => number_format((float) ($r->payment?->amount_paid ?? 0), 2),
                    'payment_method' => $r->payment?->payment_method?->value,
                    'received_by' => $r->payment?->receivedBy?->name,
                    'billing_total' => number_format((float) ($r->payment?->billingStatement?->total_amount ?? 0), 2),
                    'issued_at' => $r->issued_date?->format('M d, Y h:i A'),
                ]),
            'stats' => [
                'total' => Receipt::count(),
            ],
        ]);
    }

    public function riskAnalytics()
    {
        // Probability, risk level and drivers come from the random forest (php artisan risk:predict).
        // Every section with students is listed; one the model could not score shows why instead.
        $predictiveAnalytics = Section::all()->map(function (Section $section) {
            $enrollments = Enrollment::where('section_id', $section->id)->whereHas('student');
            $studentIds = (clone $enrollments)->pluck('student_id');

            // a section whose students were all deleted should not keep showing up
            if ($studentIds->isEmpty()) {
                return null;
            }

            $prediction = RiskPrediction::query()
                ->where('section_id', $section->id)
                ->where('model_used', config('risk.model_label'))
                ->whereNotNull('probability')
                ->orderByDesc('prediction_date')
                ->orderByDesc('id')
                ->first();

            $billingStatements = BillingStatement::whereIn('student_id', $studentIds)->get();
            $totalBilled = $billingStatements->sum('total_amount');
            $totalCollected = Payment::whereIn('billing_id', $billingStatements->pluck('id'))->sum('amount_paid');
            $totalStatements = $billingStatements->count();
            $unpaidStatements = $billingStatements->where('status', 'unpaid')->count();

            $reason = null;
            if (! $prediction) {
                $gradeBilling = $billingStatements
                    ->filter(fn ($b) => in_array($b->program?->value, ['grade_11', 'grade_12'], true))
                    ->count();

                $reason = match (true) {
                    (clone $enrollments)->where('status', 'enrolled')->doesntExist() => 'Not scored: no student here is enrolled yet (enrollment pending or dropped)',
                    $gradeBilling === 0 => 'Not scored: no Grade 11/12 billing for these students yet',
                    default => 'Not scored: no upcoming unpaid fees (all paid or past due), or waiting for the next refresh',
                };
            }

            return [
                'section_name' => $section->section_name,
                'course_name' => $section->course_name,
                'unpaid_ratio' => round($totalStatements > 0 ? ($unpaidStatements / $totalStatements) * 100 : 0, 1),
                'collection_rate' => round($totalBilled > 0 ? ($totalCollected / $totalBilled) * 100 : 100, 1),
                'probability' => $prediction ? round($prediction->probability * 100, 1) : null,
                'risk_level' => $prediction?->risk_level->value,
                'fees_scored' => $prediction?->fees_scored,
                'model_version' => $prediction?->model_version,
                'factors' => $prediction ? ($prediction->drivers ?: ['Steady payment history']) : [$reason],
            ];
        })->filter()->sortByDesc(fn (array $r) => $r['probability'] ?? -1)->values();

        return Inertia::render('Cashier/RiskAnalytics/Index', [
            'predictiveAnalytics' => $predictiveAnalytics,
        ]);
    }

    private function syncPaymentHistory(int $studentId): void
    {
        PaymentHistory::syncFor($studentId);
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

    private function formatPaymentHistory(PaymentHistory $h): array
    {
        return [
            'id' => $h->id,
            'student_name' => trim("{$h->student?->first_name} {$h->student?->last_name}"),
            'student_number' => $h->student?->student_number,
            'total_paid' => number_format((float) $h->total_paid, 2),
            'total_balance' => number_format((float) $h->total_balance, 2),
            'last_payment_date' => $h->last_payment_date?->format('M d, Y'),
        ];
    }
}
