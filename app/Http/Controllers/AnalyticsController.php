<?php

namespace App\Http\Controllers;

use App\Models\RiskPrediction;
use App\Services\DelinquencyRiskService;
use App\Services\DescriptiveAnalyticsService;
use Inertia\Inertia;

/**
 * Serves the role-scoped descriptive analytics dashboards and the cashier's
 * predictive delinquency view. Each endpoint composes a payload from the
 * {@see DescriptiveAnalyticsService} so the frontend charts render server-side
 * aggregated data without any duplicate query logic.
 */
class AnalyticsController extends Controller
{
    public function __construct(private DescriptiveAnalyticsService $analytics)
    {
        $this->middleware('permission:manage students')->only('registrar');
        $this->middleware('permission:manage billing')->only(['cashier', 'cashierRisk']);
        $this->middleware('permission:view school overview')->only('admin');
    }

    /**
     * Registrar descriptive analytics: enrollment summaries, students by
     * section, and student population status.
     */
    public function registrar()
    {
        return Inertia::render('Registrar/Analytics/Index', [
            'analytics' => $this->analytics->registrarAnalytics(),
        ]);
    }

    /**
     * Cashier descriptive analytics: total cash revenue collected over time
     * and financial performance per section.
     */
    public function cashier()
    {
        return Inertia::render('Cashier/Analytics/Index', [
            'analytics' => $this->analytics->cashierAnalytics(),
        ]);
    }

    /**
     * Admin descriptive analytics: the union of registrar and cashier summaries.
     */
    public function admin()
    {
        return Inertia::render('Admin/Analytics/Index', [
            'analytics' => $this->analytics->adminAnalytics(),
        ]);
    }

    /**
     * Cashier predictive analytics: sections at risk of payment delinquency,
     * scored by the Random Forest model. Predictions are produced by the
     * `analytics:predict-delinquency` artisan command and persisted to the
     * risk_predictions table; this view renders the latest run.
     */
    public function cashierRisk()
    {
        $latest = RiskPrediction::where('model_used', DelinquencyRiskService::MODEL_USED)
            ->latest('prediction_date')
            ->first();

        $latestDate = $latest?->prediction_date;

        $rows = $latestDate
            ? RiskPrediction::with('section')
                ->where('model_used', DelinquencyRiskService::MODEL_USED)
                ->whereDate('prediction_date', $latestDate)
                ->get()
                ->map(fn (RiskPrediction $r) => [
                    'id' => $r->id,
                    'section_id' => $r->section_id,
                    'section_name' => $r->section?->section_name,
                    'course_name' => $r->section?->course_name,
                    'risk_level' => $r->risk_level->value,
                    'model_used' => $r->model_used,
                    'prediction_date' => $r->prediction_date->format('Y-m-d'),
                    'prediction_date_display' => $r->prediction_date->format('M d, Y'),
                ])
                ->sortBy(fn (array $r) => ['high' => 0, 'medium' => 1, 'low' => 2][$r['risk_level']] ?? 3)
                ->values()
                ->all()
            : [];

        $stats = [
            'total' => count($rows),
            'high' => count(array_filter($rows, fn ($r) => $r['risk_level'] === 'high')),
            'medium' => count(array_filter($rows, fn ($r) => $r['risk_level'] === 'medium')),
            'low' => count(array_filter($rows, fn ($r) => $r['risk_level'] === 'low')),
            'last_run' => $latestDate?->format('M d, Y'),
            'model_used' => DelinquencyRiskService::MODEL_USED,
        ];

        return Inertia::render('Cashier/RiskAnalytics/Index', [
            'predictions' => $rows,
            'stats' => $stats,
            'model' => [
                'name' => 'Random Forest',
                'algorithm' => 'CART ensemble (bagging + feature bagging)',
                'trees' => 40,
                'features' => [
                    'Billing total amount',
                    'Outstanding balance',
                    'Overdue days (past due date)',
                    'Payment delay days',
                    'Prior payment ratio',
                    'Billing age (days)',
                ],
            ],
        ]);
    }
}
