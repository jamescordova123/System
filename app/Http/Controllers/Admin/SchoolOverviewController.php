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
use App\Models\UserNotification;
use Illuminate\Http\Request;
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

    public function announcements()
    {
        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => Announcement::with('creator')
                ->latest()
                ->get()
                ->map(fn (Announcement $a) => $this->formatAnnouncement($a)),
            'stats' => [
                'total' => Announcement::count(),
            ],
        ]);
    }

    public function storeAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'notify_students' => 'boolean',
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'message' => $validated['message'],
            'created_by' => $request->user()->id,
        ]);

        if ($request->boolean('notify_students')) {
            User::role('Student')->each(function (User $user) use ($announcement) {
                UserNotification::create([
                    'user_id' => $user->id,
                    'announcement_id' => $announcement->id,
                    'message' => $announcement->message,
                    'is_read' => false,
                ]);
            });
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Announcement published successfully.']);

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
