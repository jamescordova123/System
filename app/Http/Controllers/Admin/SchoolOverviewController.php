<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RiskLevel;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\BillingStatement;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\RiskPrediction;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use App\Services\AnnouncementDispatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SchoolOverviewController extends Controller
{
    public function overview()
    {
        return Inertia::render('Admin/Overview/Index', [
            'stats' => [
                'users' => User::count(),
                'students' => Student::count(),
                'sections' => Section::count(),
                'enrollments' => Enrollment::count(),
                'billing' => BillingStatement::count(),
                'payments' => Payment::count(),
                'revenue' => number_format((float) Payment::sum('amount_paid'), 2),
            ],
            'modules' => [
                ['label' => 'Registrar', 'href' => '/registrar', 'description' => 'Students, sections & enrollments', 'count' => Student::count()],
                ['label' => 'Cashier', 'href' => '/cashier', 'description' => 'Billing, payments & receipts', 'count' => Payment::count()],
                ['label' => 'Student Portal', 'href' => '/student', 'description' => 'Student self-service views', 'count' => Student::where('status', 'active')->count()],
            ],
        ]);
    }

    public function analytics()
    {
        $studentStatus = DB::table('students')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($item) => ['status' => ucfirst($item->status), 'count' => (int)$item->count]);

        $studentsBySection = Section::withCount('enrollments')
            ->orderBy('enrollments_count', 'desc')
            ->get()
            ->map(fn(Section $s) => [
                'section_name' => $s->section_name,
                'course_name' => $s->course_name,
                'count' => $s->enrollments_count,
            ]);

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
                'section_name' => $section->section_name,
                'course_name' => $section->course_name,
                'billed' => (float)$totalBilled,
                'collected' => (float)$totalCollected,
                'outstanding' => (float)max(0, $totalBilled - $totalCollected),
            ];
        });

        return Inertia::render('Admin/Analytics', [
            'studentStatus' => $studentStatus,
            'studentsBySection' => $studentsBySection,
            'monthlyRevenue' => $monthlyRevenue,
            'sectionPerformance' => $sectionPerformance,
        ]);
    }

    public function announcements()
    {
        $announcements = Announcement::with('creator')
            ->latest()
            ->paginate(10)
            ->through(fn (Announcement $a) => $this->formatAnnouncement($a));

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'stats' => [
                'total' => Announcement::count(),
            ],
        ]);
    }

    public function storeAnnouncement(Request $request, AnnouncementDispatchService $dispatchService)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'notify_students' => 'boolean',
            'recipient_emails' => ['nullable', 'string', 'max:5000', function (string $attribute, mixed $value, \Closure $fail) {
                foreach (AnnouncementDispatchService::parseEmailList(is_string($value) ? $value : null) as $email) {
                    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $fail("Invalid email address: {$email}");
                    }
                }
            }],
        ]);

        $specificEmails = AnnouncementDispatchService::parseEmailList($validated['recipient_emails'] ?? null);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'created_by' => $request->user()->id,
        ]);

        $notifyAllStudents = $request->boolean('notify_students');
        $shouldNotify = $notifyAllStudents || ! empty($specificEmails);

        if ($shouldNotify) {
            $result = $dispatchService->dispatch(
                $announcement,
                notifyAllStudents: $notifyAllStudents,
                specificEmails: $specificEmails,
            );

            $message = $result['emails_queued'] > 0
                ? "Announcement published. {$result['emails_queued']} email notification(s) queued."
                : 'Announcement published successfully.';
        } else {
            $message = 'Announcement published successfully.';
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return redirect()->route('admin.school.announcements');
    }

    public function updateAnnouncement(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $announcement->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Announcement updated successfully.']);

        return redirect()->route('admin.school.announcements');
    }

    public function destroyAnnouncement(Announcement $announcement)
    {
        $announcement->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Announcement deleted successfully.']);

        return redirect()->route('admin.school.announcements');
    }

    public function riskAnalytics()
    {
        return Inertia::render('Admin/RiskAnalytics/Index', [
            'predictions' => RiskPrediction::with('section')
                ->latest()
                ->get()
                ->map(fn (RiskPrediction $r) => $this->formatPrediction($r)),
            'stats' => [
                'total' => RiskPrediction::count(),
                'high' => RiskPrediction::where('risk_level', 'high')->count(),
                'medium' => RiskPrediction::where('risk_level', 'medium')->count(),
                'low' => RiskPrediction::where('risk_level', 'low')->count(),
            ],
            'sectionOptions' => Section::orderBy('section_name')
                ->get()
                ->map(fn (Section $s) => [
                    'value' => $s->id,
                    'label' => "{$s->section_name} ({$s->course_name})",
                ]),
        ]);
    }

    public function storeRiskPrediction(Request $request)
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'risk_level' => ['required', Rule::enum(RiskLevel::class)],
            'model_used' => 'required|string|max:255',
            'prediction_date' => 'required|date',
        ]);

        RiskPrediction::create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Risk prediction recorded successfully.']);

        return redirect()->route('admin.school.risk-analytics');
    }

    public function updateRiskPrediction(Request $request, RiskPrediction $riskPrediction)
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'risk_level' => ['required', Rule::enum(RiskLevel::class)],
            'model_used' => 'required|string|max:255',
            'prediction_date' => 'required|date',
        ]);

        $riskPrediction->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Risk prediction updated successfully.']);

        return redirect()->route('admin.school.risk-analytics');
    }

    public function destroyRiskPrediction(RiskPrediction $riskPrediction)
    {
        $riskPrediction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Risk prediction deleted successfully.']);

        return redirect()->route('admin.school.risk-analytics');
    }

    private function formatAnnouncement(Announcement $a): array
    {
        return [
            'id' => $a->id,
            'title' => $a->title,
            'message' => $a->message,
            'created_by' => $a->creator?->name,
            'created_at' => $a->created_at?->format('M d, Y h:i A'),
        ];
    }

    private function formatPrediction(RiskPrediction $r): array
    {
        return [
            'id' => $r->id,
            'section_id' => $r->section_id,
            'section_name' => $r->section?->section_name,
            'course_name' => $r->section?->course_name,
            'risk_level' => $r->risk_level->value,
            'prediction_date' => $r->prediction_date->format('Y-m-d'),
            'prediction_date_display' => $r->prediction_date->format('M d, Y'),
            'model_used' => $r->model_used,
        ];
    }
}
