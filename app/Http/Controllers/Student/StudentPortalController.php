<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\BillingStatement;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $student = $this->resolveStudent($request);

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

    public function billing(Request $request)
    {
        $student = $this->resolveStudent($request);

        return Inertia::render('Student/Billing/Index', [
            'statements' => $student
                ? $student->billingStatements()->latest()->get()->map(fn (BillingStatement $b) => [
                    'id' => $b->id,
                    'total_amount' => number_format((float) $b->total_amount, 2),
                    'due_date' => $b->due_date->format('M d, Y'),
                    'status' => $b->status->value,
                ])
                : [],
        ]);
    }

    public function announcements()
    {
        return Inertia::render('Student/Announcements/Index', [
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

    private function resolveStudent(Request $request): ?Student
    {
        return Student::where('user_id', $request->user()->id)->first();
    }
}
