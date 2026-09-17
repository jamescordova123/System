<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\BillingLineItem;
use App\Models\BillingStatement;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Student;
use App\Models\UserNotification;
use App\Support\LearnerProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $student = $this->resolveStudent($request);

        $statements = $student
            ? $student->billingStatements()
                ->with(['lineItems.catalogItem', 'payments.receipt', 'payments.lineItem.catalogItem'])
                ->latest()
                ->get()
            : collect();

        $totalDue  = (float) $statements->sum(fn (BillingStatement $b) => (float) $b->total_amount);
        $totalPaid = (float) $statements->sum(fn (BillingStatement $b) => $this->statementPaid($b));

        $recentPayments = $student
            ? Payment::query()
                ->whereHas('billingStatement', fn ($q) => $q->where('student_id', $student->id))
                ->with(['receipt', 'lineItem.catalogItem', 'billingStatement'])
                ->latest('payment_date')
                ->latest('id')
                ->take(5)
                ->get()
            : collect();

        return Inertia::render('Student/Dashboard', [
            'student' => $student ? [
                'name' => trim("{$student->first_name} {$student->last_name}"),
                'student_number' => $student->student_number,
                'status' => $student->status->value,
            ] : null,
            'stats' => $student ? [
                'enrollments' => $student->enrollments()->count(),
                'unpaid_bills' => $student->billingStatements()->whereIn('status', ['unpaid', 'partial'])->count(),
                'notifications' => UserNotification::where('user_id', $request->user()->id)->where('is_read', false)->count(),
            ] : ['enrollments' => 0, 'unpaid_bills' => 0, 'notifications' => 0],
            'announcements' => Announcement::with('creator')
                ->latest()
                ->take(3)
                ->get()
                ->map(fn (Announcement $a) => [
                    'id' => $a->id,
                    'title' => $a->title,
                    'message' => $a->message,
                    'created_by' => $a->creator?->name,
                    'created_at' => $a->created_at?->format('M d, Y'),
                ]),
            'billing_summary' => [
                'assessed' => $totalDue,
                'paid'     => $totalPaid,
                'balance'  => max(0, $totalDue - $totalPaid),
            ],
            'recent_statements' => $statements->take(3)->map(function (BillingStatement $b) {
                $paid = $this->statementPaid($b);
                $due  = (float) $b->total_amount;
                return [
                    'id'            => $b->id,
                    'program_label' => $b->program?->label() ?? 'General Billing',
                    'school_year'   => $b->school_year,
                    'due_date'      => $b->due_date->format('M d, Y'),
                    'status'        => $b->status->value,
                    'total_due'     => $due,
                    'total_paid'    => $paid,
                    'balance'       => max(0, $due - $paid),
                    'items'         => $b->lineItems
                        ->sortBy(fn (BillingLineItem $i) => $i->catalogItem?->sort_order ?? 0)
                        ->values()
                        ->map(fn (BillingLineItem $i) => [
                            'id'         => $i->id,
                            'label'      => $i->catalogItem?->label ?? '—',
                            'amount_due' => (float) $i->amount_due,
                            'amount_paid'=> (float) $i->amount_paid,
                            'balance'    => $i->balance(),
                            'status'     => $this->lineItemStatus($i),
                        ]),
                ];
            }),
            'recent_payments' => $recentPayments->map(fn (Payment $p) => [
                'id'             => $p->id,
                'payment_date'   => $p->payment_date->format('M d, Y'),
                'receipt_number' => $p->receipt?->receipt_number,
                'item_label'     => $p->lineItem?->catalogItem?->label,
                'program_label'  => $p->billingStatement?->program?->label() ?? 'General Billing',
                'amount_paid'    => (float) $p->amount_paid,
            ]),
        ]);
    }

    public function enrollments(Request $request)
    {
        $student = $this->resolveStudent($request);

        return Inertia::render('Student/Enrollments/Index', [
            'enrollments' => $student
                ? $student->enrollments()->with('section')->latest()->get()->map(fn (Enrollment $e) => [
                    'id' => $e->id,
                    'section_name' => $e->section?->section_name,
                    'course_name' => $e->section?->course_name,
                    'schedule' => $e->section?->schedule,
                    'status' => $e->status->value,
                    'enrollment_date' => $e->enrollment_date->format('M d, Y'),
                ])
                : [],
        ]);
    }

    /**
     * Editable contact / address / family info. Academic enrollment fields
     * are shown read-only — only the Registrar can change those.
     */
    public function profile(Request $request)
    {
        $student = $this->resolveStudent($request);
        abort_unless($student, 404);

        return Inertia::render('Student/Profile/Index', [
            'readonly' => [
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'middle_name' => $student->middle_name,
                'birthdate' => $student->birthdate?->format('Y-m-d'),
                'birthdate_display' => $student->birthdate?->format('M d, Y'),
                'sex' => $this->normalizeSex($student->gender),
                'email' => $request->user()->email,
                'school_year' => $student->school_year,
                'grade_to_enroll' => $student->grade_to_enroll,
                'learner_status' => $student->learner_status,
                'shs_semester' => $student->shs_semester,
                'shs_track' => $student->shs_track,
                'shs_strand' => $student->shs_strand,
            ],
            'profile' => [
                'place_of_birth' => $student->place_of_birth ?? '',
                'mother_tongue' => $student->mother_tongue ?? '',
                'is_indigenous' => (bool) $student->is_indigenous,
                'indigenous_specify' => $student->indigenous_specify ?? '',
                'is_4ps_beneficiary' => (bool) $student->is_4ps_beneficiary,
                'household_id_number' => $student->household_id_number ?? '',
                'current_house_no' => $student->current_house_no ?? '',
                'current_street' => $student->current_street ?? '',
                'current_barangay' => $student->current_barangay ?? '',
                'current_municipality' => $student->current_municipality ?? '',
                'current_province' => $student->current_province ?? '',
                'current_country' => $student->current_country ?? 'Philippines',
                'current_zip_code' => $student->current_zip_code ?? '',
                'permanent_same_as_current' => (bool) ($student->permanent_same_as_current ?? true),
                'permanent_house_no' => $student->permanent_house_no ?? '',
                'permanent_street' => $student->permanent_street ?? '',
                'permanent_barangay' => $student->permanent_barangay ?? '',
                'permanent_municipality' => $student->permanent_municipality ?? '',
                'permanent_province' => $student->permanent_province ?? '',
                'permanent_country' => $student->permanent_country ?? 'Philippines',
                'permanent_zip_code' => $student->permanent_zip_code ?? '',
                'father_last_name' => $student->father_last_name ?? '',
                'father_first_name' => $student->father_first_name ?? '',
                'father_middle_name' => $student->father_middle_name ?? '',
                'father_contact' => $student->father_contact ?? '',
                'mother_last_name' => $student->mother_last_name ?? '',
                'mother_first_name' => $student->mother_first_name ?? '',
                'mother_middle_name' => $student->mother_middle_name ?? '',
                'mother_contact' => $student->mother_contact ?? '',
                'guardian_last_name' => $student->guardian_last_name ?? '',
                'guardian_first_name' => $student->guardian_first_name ?? '',
                'guardian_middle_name' => $student->guardian_middle_name ?? '',
                'guardian_contact' => $student->guardian_contact ?? '',
                'contact_number' => $student->contact_number ?? '',
                'fb_account' => $student->fb_account ?? '',
                'learning_modalities' => $student->learning_modalities ?? [],
            ],
            'formOptions' => [
                'modalities' => LearnerProfile::modalities(),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $student = $this->resolveStudent($request);
        abort_unless($student, 404);

        $validated = $request->validate(LearnerProfile::studentSelfUpdateRules());
        $validated = LearnerProfile::normalize($validated);

        $attributes = [];
        foreach (LearnerProfile::studentSelfUpdateKeys() as $key) {
            if ($key === 'learning_modalities' || array_key_exists($key, $validated)) {
                $attributes[$key] = $validated[$key] ?? ($key === 'learning_modalities' ? [] : null);
            }
        }
        if (array_key_exists('address', $validated)) {
            $attributes['address'] = $validated['address'];
        }

        $student->update($attributes);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Your information was updated.']);

        return redirect()->route('student.profile');
    }

    /**
     * Read-only financial ledger. Reads the same billing statements, line
     * items, and payments the Cashier manages, so every assessment or
     * payment recorded there is reflected here on the next page load.
     */
    public function billing(Request $request)
    {
        $student = $this->resolveStudent($request);

        $statements = $student
            ? $student->billingStatements()
                ->with(['lineItems.catalogItem', 'payments.receipt', 'payments.lineItem.catalogItem', 'payments.receivedBy'])
                ->latest()
                ->get()
            : collect();

        $totalDue = (float) $statements->sum(fn (BillingStatement $b) => (float) $b->total_amount);
        $totalPaid = (float) $statements->sum(fn (BillingStatement $b) => $this->statementPaid($b));

        return Inertia::render('Student/Billing/Index', [
            'summary' => [
                'assessed' => $totalDue,
                'paid' => $totalPaid,
                'balance' => max(0, $totalDue - $totalPaid),
            ],
            'filters' => [
                'search' => trim($request->string('search')->toString()),
            ],
            'statements' => $statements->map(function (BillingStatement $b) {
                $paid = $this->statementPaid($b);
                $due = (float) $b->total_amount;

                return [
                    'id' => $b->id,
                    'program' => $b->program?->value,
                    'program_label' => $b->program?->label() ?? 'General Billing',
                    'school_year' => $b->school_year,
                    'due_date' => $b->due_date->format('M d, Y'),
                    'status' => $b->status->value,
                    'remarks' => $b->remarks,
                    'total_due' => $due,
                    'total_paid' => $paid,
                    'balance' => max(0, $due - $paid),
                    'items' => $b->lineItems
                        ->sortBy(fn (BillingLineItem $i) => $i->catalogItem?->sort_order ?? 0)
                        ->values()
                        ->map(fn (BillingLineItem $i) => [
                            'id' => $i->id,
                            'label' => $i->catalogItem?->label ?? '—',
                            'ar_number' => $i->ar_number,
                            'amount_due' => (float) $i->amount_due,
                            'amount_paid' => (float) $i->amount_paid,
                            'balance' => $i->balance(),
                            'status' => $this->lineItemStatus($i),
                        ]),
                    'payments' => $b->payments
                        ->sortByDesc('payment_date')
                        ->values()
                        ->map(fn (Payment $p) => [
                            'id' => $p->id,
                            'payment_date' => $p->payment_date->format('M d, Y'),
                            'receipt_number' => $p->receipt?->receipt_number,
                            'item_label' => $p->lineItem?->catalogItem?->label,
                            'amount_paid' => (float) $p->amount_paid,
                        ]),
                ];
            }),
        ]);
    }

    /**
     * Flat payment ledger for the signed-in student — every cashier-recorded
     * payment across all fee assessments, searchable by receipt / fee item.
     */
    public function transactions(Request $request)
    {
        $student = $this->resolveStudent($request);

        $payments = $student
            ? Payment::query()
                ->whereHas('billingStatement', fn ($q) => $q->where('student_id', $student->id))
                ->with([
                    'receipt',
                    'lineItem.catalogItem',
                    'billingStatement',
                    'receivedBy',
                ])
                ->latest('payment_date')
                ->latest('id')
                ->get()
            : collect();

        $totalPaid = (float) $payments->sum('amount_paid');

        return Inertia::render('Student/Transactions/Index', [
            'summary' => [
                'count' => $payments->count(),
                'total_paid' => $totalPaid,
            ],
            'transactions' => $payments->map(fn (Payment $p) => [
                'id' => $p->id,
                'payment_date' => $p->payment_date->format('M d, Y'),
                'payment_date_raw' => $p->payment_date->toDateString(),
                'receipt_number' => $p->receipt?->receipt_number,
                'item_label' => $p->lineItem?->catalogItem?->label,
                'program_label' => $p->billingStatement?->program?->label() ?? 'General Billing',
                'school_year' => $p->billingStatement?->school_year,
                'payment_method' => $p->payment_method->value,
                'received_by' => $p->receivedBy?->name,
                'amount_paid' => (float) $p->amount_paid,
            ]),
        ]);
    }

    public function notifications(Request $request)
    {
        return Inertia::render('Student/Notifications/Index', [
            'notifications' => UserNotification::with('announcement')
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get()
                ->map(fn (UserNotification $n) => [
                    'id' => $n->id,
                    'title' => $n->announcement?->title ?? 'Notification',
                    'message' => $n->message ?: ($n->announcement?->message ?? ''),
                    'is_read' => (bool) $n->is_read,
                    'created_at' => $n->created_at?->format('M d, Y h:i A'),
                ]),
            'announcements' => Announcement::with('creator')
                ->latest()
                ->get()
                ->map(fn (Announcement $a) => [
                    'id' => $a->id,
                    'title' => $a->title,
                    'message' => $a->message,
                    'created_by' => $a->creator?->name,
                    'created_at' => $a->created_at?->format('M d, Y h:i A'),
                ]),
        ]);
    }

    public function markNotificationRead(Request $request, UserNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->update(['is_read' => true]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Notification marked as read.']);

        return redirect()->route('student.notifications');
    }

    public function markAllNotificationsRead(Request $request)
    {
        UserNotification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'All notifications marked as read.']);

        return redirect()->route('student.notifications');
    }

    /**
     * Itemized statements track paid amounts on line items (the cashier's
     * source of truth); legacy statements only have payment rows.
     */
    private function statementPaid(BillingStatement $b): float
    {
        return $b->lineItems->isNotEmpty()
            ? (float) $b->lineItems->sum('amount_paid')
            : (float) $b->payments->sum('amount_paid');
    }

    private function lineItemStatus(BillingLineItem $item): string
    {
        if ((float) $item->amount_due <= 0 || $item->balance() <= 0) {
            return 'paid';
        }

        return (float) $item->amount_paid > 0 ? 'partial' : 'unpaid';
    }

    private function resolveStudent(Request $request): ?Student
    {
        return Student::where('user_id', $request->user()->id)->first();
    }

    private function normalizeSex(?string $gender): string
    {
        $value = strtolower((string) $gender);

        return match ($value) {
            'male', 'm' => 'Male',
            'female', 'f' => 'Female',
            default => in_array($gender, ['Male', 'Female'], true) ? $gender : '',
        };
    }
}
