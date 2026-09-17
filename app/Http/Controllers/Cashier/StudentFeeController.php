<?php

namespace App\Http\Controllers\Cashier;

use App\Enums\BillingStatus;
use App\Enums\FeeProgram;
use App\Http\Controllers\Controller;
use App\Models\BillingLineItem;
use App\Models\BillingStatement;
use App\Models\FeeCatalogItem;
use App\Models\Payment;
use App\Models\PaymentHistory;
use App\Models\Receipt;
use App\Models\Student;
use Database\Seeders\FeeCatalogSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Itemized student fee assessments for the Cashier module.
 *
 * A fee assessment is a BillingStatement with a program/school year plus
 * one BillingLineItem per fee from the catalog — the normalized version
 * of the legacy Grade 11 / Grade 12 / Graduation fee sheets.
 */
class StudentFeeController extends Controller
{
    public function index()
    {
        $this->ensureFeeSchema();

        $assessments = BillingStatement::whereNotNull('program')
            ->with(['student', 'lineItems'])
            ->latest()
            ->get();

        $totalAssessed = (float) $assessments->sum(fn ($a) => (float) $a->total_amount);
        $totalCollected = (float) $assessments->sum(fn ($a) => (float) $a->lineItems->sum('amount_paid'));

        return Inertia::render('Cashier/StudentFees/Index', [
            'assessments' => $assessments->map(fn (BillingStatement $a) => $this->formatAssessment($a)),
            'stats' => [
                'assessed' => number_format($totalAssessed, 2),
                'collected' => number_format($totalCollected, 2),
                'outstanding' => number_format(max(0, $totalAssessed - $totalCollected), 2),
                'fully_paid' => $assessments->where('status', BillingStatus::Paid)->count(),
            ],
            'studentOptions' => Student::orderBy('last_name')
                ->get()
                ->map(fn (Student $s) => [
                    'value' => $s->id,
                    'label' => trim("{$s->student_number} — {$s->first_name} {$s->last_name}"),
                ]),
            'programs' => $this->programOptions(),
            'schoolYears' => $this->schoolYearOptions($assessments->pluck('school_year')),
            'catalog' => FeeCatalogItem::orderBy('program')
                ->orderBy('sort_order')
                ->get()
                ->map(fn (FeeCatalogItem $i) => $this->formatCatalogItem($i)),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'program' => ['required', Rule::enum(FeeProgram::class)],
            'school_year' => 'required|string|max:20',
            'due_date' => 'required|date',
            'remarks' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.fee_catalog_item_id' => 'required|distinct|exists:fee_catalog_items,id',
            'items.*.amount_due' => 'required|numeric|min:0',
        ]);

        $exists = BillingStatement::where('student_id', $validated['student_id'])
            ->where('program', $validated['program'])
            ->where('school_year', $validated['school_year'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'program' => 'This student already has an assessment for this program and school year.',
            ]);
        }

        DB::transaction(function () use ($validated) {
            $statement = BillingStatement::create([
                'student_id' => $validated['student_id'],
                'program' => $validated['program'],
                'school_year' => $validated['school_year'],
                'total_amount' => collect($validated['items'])->sum('amount_due'),
                'due_date' => $validated['due_date'],
                'status' => BillingStatus::Unpaid,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                BillingLineItem::create([
                    'billing_id' => $statement->id,
                    'fee_catalog_item_id' => $item['fee_catalog_item_id'],
                    'amount_due' => $item['amount_due'],
                ]);
            }

            PaymentHistory::syncFor($statement->student_id);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Fee assessment created.']);

        return redirect()->route('cashier.student-fees');
    }

    public function show(BillingStatement $billing)
    {
        abort_unless($billing->program !== null, 404);

        $billing->load([
            'student.enrollments.section',
            'lineItems.catalogItem',
            'payments.receipt',
            'payments.receivedBy',
            'payments.lineItem.catalogItem',
        ]);

        $section = $billing->student?->enrollments
            ->sortByDesc('enrollment_date')
            ->first()?->section;

        return Inertia::render('Cashier/StudentFees/Show', [
            'assessment' => $this->formatAssessment($billing) + [
                'remarks' => $billing->remarks,
                'section' => $section?->section_name,
                'course' => $section?->course_name,
            ],
            'items' => $billing->lineItems
                ->sortBy(fn (BillingLineItem $i) => $i->catalogItem?->sort_order ?? 0)
                ->values()
                ->map(fn (BillingLineItem $i) => [
                    'id' => $i->id,
                    'label' => $i->catalogItem?->label ?? '—',
                    'category' => $i->catalogItem?->category ?? 'fee',
                    'ar_number' => $i->ar_number,
                    'amount_due' => (float) $i->amount_due,
                    'amount_paid' => (float) $i->amount_paid,
                    'balance' => $i->balance(),
                    'status' => $this->itemStatus($i),
                ]),
            'payments' => $billing->payments
                ->sortByDesc('payment_date')
                ->values()
                ->map(fn (Payment $p) => [
                    'id' => $p->id,
                    'item_label' => $p->lineItem?->catalogItem?->label,
                    'receipt_number' => $p->receipt?->receipt_number,
                    'amount_paid' => (float) $p->amount_paid,
                    'payment_date' => $p->payment_date->format('M d, Y'),
                    'received_by' => $p->receivedBy?->name,
                ]),
        ]);
    }

    public function update(Request $request, BillingStatement $billing)
    {
        $validated = $request->validate([
            'due_date' => 'required|date',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $billing->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Assessment updated.']);

        return redirect()->back();
    }

    public function destroy(BillingStatement $billing)
    {
        $studentId = $billing->student_id;
        $billing->delete();
        PaymentHistory::syncFor($studentId);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Fee assessment deleted.']);

        return redirect()->route('cashier.student-fees');
    }

    public function payItem(Request $request, BillingStatement $billing, BillingLineItem $item)
    {
        abort_unless($item->billing_id === $billing->id, 404);

        $remaining = $item->balance();

        $validated = $request->validate([
            'amount' => "required|numeric|min:0.01|max:{$remaining}",
            'ar_number' => 'nullable|string|max:50',
            'payment_date' => 'required|date',
        ]);

        DB::transaction(function () use ($validated, $billing, $item, $request) {
            $payment = Payment::create([
                'billing_id' => $billing->id,
                'billing_line_item_id' => $item->id,
                'amount_paid' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => 'cash',
                'received_by' => $request->user()->id,
            ]);

            Receipt::create([
                'payment_id' => $payment->id,
                'receipt_number' => 'RCP-'.now()->format('Ymd').'-'.str_pad((string) $payment->id, 4, '0', STR_PAD_LEFT),
                'issued_date' => $validated['payment_date'],
            ]);

            $item->update([
                'amount_paid' => (float) $item->amount_paid + (float) $validated['amount'],
                'ar_number' => $validated['ar_number'] ?: $item->ar_number,
            ]);

            $billing->recalculateFromLineItems();
            PaymentHistory::syncFor($billing->student_id);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Payment recorded and receipt issued.']);

        return redirect()->back();
    }

    public function updateItem(Request $request, BillingStatement $billing, BillingLineItem $item)
    {
        abort_unless($item->billing_id === $billing->id, 404);

        $validated = $request->validate([
            'amount_due' => 'required|numeric|min:0',
            'ar_number' => 'nullable|string|max:50',
        ]);

        $item->update($validated);
        $billing->recalculateFromLineItems();
        PaymentHistory::syncFor($billing->student_id);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Fee item updated.']);

        return redirect()->back();
    }

    public function storeCatalogItem(Request $request)
    {
        $validated = $request->validate([
            'program' => ['required', Rule::enum(FeeProgram::class)],
            'label' => 'required|string|max:120',
            'category' => ['required', Rule::in(['fee', 'test_paper', 'consumable'])],
            'default_amount' => 'required|numeric|min:0',
        ]);

        $code = Str::slug($validated['label'], '_');

        if (FeeCatalogItem::withTrashed()->where('program', $validated['program'])->where('code', $code)->exists()) {
            throw ValidationException::withMessages([
                'label' => 'A fee item with this name already exists for this program.',
            ]);
        }

        $maxSort = (int) FeeCatalogItem::where('program', $validated['program'])->max('sort_order');

        FeeCatalogItem::create([
            ...$validated,
            'code' => $code,
            'sort_order' => $maxSort + 10,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Fee item added to the catalog.']);

        return redirect()->back();
    }

    public function updateCatalogItem(Request $request, FeeCatalogItem $item)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:120',
            'default_amount' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
        ]);

        $item->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Fee item updated.']);

        return redirect()->back();
    }

    /**
     * Apply the Student Fees schema when it is missing. Uses direct DDL so
     * it still works if a stuck `php artisan migrate` is holding the
     * migrations table. Local-only.
     */
    private function ensureFeeSchema(): void
    {
        if (Schema::hasColumn('billing_statements', 'program')) {
            return;
        }

        if (! app()->environment('local')) {
            abort(503, 'Student fee schema is not installed. Run: php artisan migrate && php artisan db:seed --class=FeeCatalogSeeder');
        }

        if (! Schema::hasTable('fee_catalog_items')) {
            Schema::create('fee_catalog_items', function ($table) {
                $table->id();
                $table->string('program');
                $table->string('code');
                $table->string('label');
                $table->string('category')->default('fee');
                $table->decimal('default_amount', 12, 2)->default(0);
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->softDeletes();
                $table->unique(['program', 'code']);
                $table->index('program');
            });
        }

        if (! Schema::hasTable('billing_line_items')) {
            Schema::create('billing_line_items', function ($table) {
                $table->id();
                $table->foreignId('billing_id')->constrained('billing_statements')->cascadeOnDelete();
                $table->foreignId('fee_catalog_item_id')->constrained('fee_catalog_items')->restrictOnDelete();
                $table->string('ar_number')->nullable();
                $table->decimal('amount_due', 12, 2);
                $table->decimal('amount_paid', 12, 2)->default(0);
                $table->timestamps();
                $table->softDeletes();
                $table->unique(['billing_id', 'fee_catalog_item_id']);
            });
        }

        if (! Schema::hasColumn('billing_statements', 'program')) {
            Schema::table('billing_statements', function ($table) {
                $table->string('program')->nullable()->after('student_id');
                $table->string('school_year')->nullable()->after('program');
                $table->text('remarks')->nullable()->after('status');
                $table->index(['program', 'school_year']);
            });
        }

        if (! Schema::hasColumn('payments', 'billing_line_item_id')) {
            Schema::table('payments', function ($table) {
                $table->foreignId('billing_line_item_id')
                    ->nullable()
                    ->after('billing_id')
                    ->constrained('billing_line_items')
                    ->nullOnDelete();
            });
        }

        // Record migrations so a later `php artisan migrate` does not re-run them.
        $batch = ((int) DB::table('migrations')->max('batch')) + 1;
        foreach ([
            '2026_07_28_150000_create_fee_catalog_items_table',
            '2026_07_28_150100_create_billing_line_items_table',
            '2026_07_28_150200_add_fee_fields_to_billing_statements_and_payments_tables',
        ] as $migration) {
            if (! DB::table('migrations')->where('migration', $migration)->exists()) {
                DB::table('migrations')->insert([
                    'migration' => $migration,
                    'batch' => $batch,
                ]);
            }
        }

        Artisan::call('db:seed', ['--class' => FeeCatalogSeeder::class, '--force' => true]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatAssessment(BillingStatement $a): array
    {
        $totalDue = (float) $a->total_amount;
        $totalPaid = (float) $a->lineItems->sum('amount_paid');

        return [
            'id' => $a->id,
            'student_id' => $a->student_id,
            'student_name' => trim("{$a->student?->first_name} {$a->student?->last_name}"),
            'student_number' => $a->student?->student_number,
            'program' => $a->program?->value,
            'program_label' => $a->program?->label(),
            'school_year' => $a->school_year,
            'total_due' => $totalDue,
            'total_paid' => $totalPaid,
            'balance' => max(0, $totalDue - $totalPaid),
            'items_count' => $a->lineItems->count(),
            'items_paid' => $a->lineItems->filter(fn (BillingLineItem $i) => $this->itemStatus($i) === 'paid')->count(),
            'due_date' => $a->due_date->format('Y-m-d'),
            'due_date_display' => $a->due_date->format('M d, Y'),
            'status' => $a->status->value,
        ];
    }

    private function itemStatus(BillingLineItem $item): string
    {
        $due = (float) $item->amount_due;
        $paid = (float) $item->amount_paid;

        if ($due > 0 && $paid >= $due) {
            return 'paid';
        }

        return $paid > 0 ? 'partial' : 'unpaid';
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function programOptions(): array
    {
        return array_map(
            fn (FeeProgram $p) => ['value' => $p->value, 'label' => $p->label()],
            FeeProgram::cases()
        );
    }

    /**
     * @param \Illuminate\Support\Collection<int, string|null> $used
     * @return array<int, string>
     */
    private function schoolYearOptions($used): array
    {
        $year = (int) now()->year;
        $defaults = [
            sprintf('%d-%d', $year - 1, $year),
            sprintf('%d-%d', $year, $year + 1),
            sprintf('%d-%d', $year + 1, $year + 2),
        ];

        return $used->filter()->merge($defaults)->unique()->sort()->values()->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function formatCatalogItem(FeeCatalogItem $i): array
    {
        return [
            'id' => $i->id,
            'program' => $i->program->value,
            'label' => $i->label,
            'category' => $i->category,
            'default_amount' => (float) $i->default_amount,
            'is_active' => $i->is_active,
        ];
    }
}
