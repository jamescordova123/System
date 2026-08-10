<?php

use App\Enums\BillingStatus;
use App\Enums\EnrollmentStatus;
use App\Enums\PaymentMethod;
use App\Enums\StudentStatus;
use App\Models\BillingStatement;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use App\Services\AnalyticsService;
use Database\Seeders\RolesAndPermissionsSeeder;

function makeStudent(string $number, StudentStatus $status = StudentStatus::Active): Student
{
    $user = User::factory()->create();

    return Student::create([
        'user_id' => $user->id,
        'student_number' => $number,
        'first_name' => 'Test',
        'last_name' => "Student {$number}",
        'birthdate' => now()->subYears(18),
        'gender' => 'female',
        'status' => $status,
    ]);
}

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->sectionA = Section::create(['section_name' => 'BSIT-1A', 'course_name' => 'BS Information Technology']);
    $this->sectionB = Section::create(['section_name' => 'BSIT-1B', 'course_name' => 'BS Information Technology']);

    $this->alice = makeStudent('2024-0001');
    $this->bob = makeStudent('2024-0002');
    $this->carol = makeStudent('2024-0003', StudentStatus::Graduated);

    Enrollment::create([
        'student_id' => $this->alice->id,
        'section_id' => $this->sectionA->id,
        'enrollment_date' => now()->startOfMonth(),
        'status' => EnrollmentStatus::Enrolled,
    ]);
    Enrollment::create([
        'student_id' => $this->bob->id,
        'section_id' => $this->sectionA->id,
        'enrollment_date' => now()->startOfMonth(),
        'status' => EnrollmentStatus::Dropped,
    ]);
    Enrollment::create([
        'student_id' => $this->carol->id,
        'section_id' => $this->sectionB->id,
        'enrollment_date' => now()->subMonthNoOverflow()->startOfMonth(),
        'status' => EnrollmentStatus::Completed,
    ]);

    $aliceBilling = BillingStatement::create([
        'student_id' => $this->alice->id,
        'total_amount' => 1000,
        'due_date' => now()->addMonth(),
        'status' => BillingStatus::Partial,
    ]);
    $carolBilling = BillingStatement::create([
        'student_id' => $this->carol->id,
        'total_amount' => 500,
        'due_date' => now()->addMonth(),
        'status' => BillingStatus::Paid,
    ]);

    $cashier = User::factory()->create();

    Payment::create([
        'billing_id' => $aliceBilling->id,
        'amount_paid' => 400,
        'payment_date' => now()->startOfMonth(),
        'payment_method' => PaymentMethod::Cash,
        'received_by' => $cashier->id,
    ]);
    Payment::create([
        'billing_id' => $carolBilling->id,
        'amount_paid' => 500,
        'payment_date' => now()->subMonthNoOverflow()->startOfMonth(),
        'payment_method' => PaymentMethod::Cash,
        'received_by' => $cashier->id,
    ]);
});

test('enrollment summary reports status totals and retention', function () {
    $summary = app(AnalyticsService::class)->enrollmentSummary();

    expect($summary['total'])->toBe(3)
        ->and($summary['enrolled'])->toBe(1)
        ->and($summary['dropped'])->toBe(1)
        ->and($summary['completed'])->toBe(1)
        ->and($summary['this_month'])->toBe(2)
        ->and($summary['last_month'])->toBe(1)
        ->and($summary['retention_rate'])->toBe(66.7);
});

test('enrollment trend buckets registrations per month', function () {
    $trend = app(AnalyticsService::class)->enrollmentTrend(3);

    expect($trend)->toHaveCount(3);

    $current = collect($trend)->firstWhere('period', now()->format('Y-m'));
    $previous = collect($trend)->firstWhere('period', now()->subMonthNoOverflow()->format('Y-m'));

    expect($current['enrolled'])->toBe(1)
        ->and($current['dropped'])->toBe(1)
        ->and($current['total'])->toBe(2)
        ->and($previous['completed'])->toBe(1);
});

test('students by section counts distinct students', function () {
    $rows = collect(app(AnalyticsService::class)->studentsBySection());

    expect($rows->firstWhere('section', 'BSIT-1A')['students'])->toBe(2)
        ->and($rows->firstWhere('section', 'BSIT-1B')['students'])->toBe(1)
        ->and($rows->first()['section'])->toBe('BSIT-1A');
});

test('population status breaks down student lifecycle', function () {
    $population = app(AnalyticsService::class)->populationStatus();

    expect($population['total'])->toBe(3)
        ->and($population['active'])->toBe(2)
        ->and($population['graduated'])->toBe(1)
        ->and($population['unassigned'])->toBe(2)
        ->and($population['breakdown'])->toHaveCount(3);
});

test('revenue summary aggregates collections against billings', function () {
    $summary = app(AnalyticsService::class)->revenueSummary();

    expect($summary['collected'])->toBe(900.0)
        ->and($summary['billed'])->toBe(1500.0)
        ->and($summary['outstanding'])->toBe(600.0)
        ->and($summary['collection_rate'])->toBe(60.0)
        ->and($summary['transactions'])->toBe(2)
        ->and($summary['this_month'])->toBe(400.0)
        ->and($summary['last_month'])->toBe(500.0);
});

test('revenue trend buckets cash collected per month', function () {
    $trend = collect(app(AnalyticsService::class)->revenueTrend(2));

    expect($trend->firstWhere('period', now()->format('Y-m'))['revenue'])->toBe(400.0)
        ->and($trend->firstWhere('period', now()->subMonthNoOverflow()->format('Y-m'))['revenue'])->toBe(500.0);
});

test('section financials attribute billing to the latest section', function () {
    $rows = collect(app(AnalyticsService::class)->financialPerformanceBySection());

    $sectionA = $rows->firstWhere('section', 'BSIT-1A');
    $sectionB = $rows->firstWhere('section', 'BSIT-1B');

    expect($sectionA['billed'])->toBe(1000.0)
        ->and($sectionA['collected'])->toBe(400.0)
        ->and($sectionA['outstanding'])->toBe(600.0)
        ->and($sectionA['collection_rate'])->toBe(40.0)
        ->and($sectionB['collected'])->toBe(500.0)
        ->and($sectionB['collection_rate'])->toBe(100.0);
});

test('registrar can view enrollment analytics', function () {
    $user = User::factory()->create();
    $user->assignRole('Registrar');

    $this->actingAs($user)
        ->get('/registrar/analytics')
        ->assertOk();
});

test('cashier can view financial analytics but not registrar analytics', function () {
    $user = User::factory()->create();
    $user->assignRole('Cashier');

    $this->actingAs($user)->get('/cashier/analytics')->assertOk();
    $this->actingAs($user)->get('/registrar/analytics')->assertForbidden();
});

test('super admin can view school analytics', function () {
    $user = User::factory()->create();
    $user->assignRole('Super-Admin');

    $this->actingAs($user)
        ->get('/admin/analytics')
        ->assertOk();
});

test('students cannot reach analytics pages', function () {
    $user = User::factory()->create();
    $user->assignRole('Student');

    $this->actingAs($user)->get('/admin/analytics')->assertForbidden();
    $this->actingAs($user)->get('/cashier/analytics')->assertForbidden();
});
