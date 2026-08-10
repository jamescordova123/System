<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics) {}

    public function registrar(Request $request): Response
    {
        $months = $this->months($request);

        return Inertia::render('Registrar/Analytics/Index', [
            'months' => $months,
            'enrollmentSummary' => $this->analytics->enrollmentSummary(),
            'enrollmentTrend' => $this->analytics->enrollmentTrend($months),
            'studentsBySection' => $this->analytics->studentsBySection(),
            'populationStatus' => $this->analytics->populationStatus(),
        ]);
    }

    public function cashier(Request $request): Response
    {
        $months = $this->months($request);

        return Inertia::render('Cashier/Analytics/Index', [
            'months' => $months,
            'revenueSummary' => $this->analytics->revenueSummary(),
            'revenueTrend' => $this->analytics->revenueTrend($months),
            'revenueByMethod' => $this->analytics->revenueByPaymentMethod(),
            'sectionPerformance' => $this->analytics->financialPerformanceBySection(),
        ]);
    }

    public function admin(Request $request): Response
    {
        $months = $this->months($request);

        return Inertia::render('Admin/Analytics/Index', [
            'months' => $months,
            'studentsBySection' => $this->analytics->studentsBySection(),
            'populationStatus' => $this->analytics->populationStatus(),
            'revenueSummary' => $this->analytics->revenueSummary(),
            'revenueTrend' => $this->analytics->revenueTrend($months),
            'sectionPerformance' => $this->analytics->financialPerformanceBySection(),
        ]);
    }

    private function months(Request $request): int
    {
        $months = (int) $request->integer('months', AnalyticsService::DEFAULT_MONTHS);

        return in_array($months, [3, 6, 12, 24], true) ? $months : AnalyticsService::DEFAULT_MONTHS;
    }
}
