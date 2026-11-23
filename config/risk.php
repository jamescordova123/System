<?php

return [
    /*
     | Python used to run ml/predict.py (the trained random forest). Install the packages with
     | `pip install -r ml/requirements.txt` for the same interpreter.
     */
    'python' => env('RISK_PYTHON', 'python3'),
    'script' => base_path('ml/predict.py'),
    'timeout' => 120,

    // Stored in risk_predictions.model_used so these rows can be told apart from manual entries.
    'model_label' => 'random_forest',

    /*
     | Section risk level from the predicted share of fees paid late or not at all.
     | The defaults were chosen for the simulated data (about 24% of fees fail); set them again
     | once the model is trained on real payments.
     */
    'thresholds' => [
        'medium' => (float) env('RISK_MEDIUM', 0.25),
        'high' => (float) env('RISK_HIGH', 0.35),
    ],

    /*
     | Fee deadlines are counted in months from the school-year start. A line item's own
     | due_date wins when it is set.
     */
    'school_year_starts' => [
        '2023-2024' => '2023-08-29',
        '2024-2025' => '2024-07-29',
        '2025-2026' => '2025-06-16',
    ],
    'school_year_start_default' => '06-16', // month-day used for any school year not listed above

    'deadline_months' => [
        'ID' => 2,
        'UNIFORM' => 2,
        'TESTPAPER' => [1 => 4, 2 => 8, 3 => 12],
        'CONSUMABLE' => 7,
    ],

    /*
     | The model knows these strands. sections.course_name is matched to one of them: first by a
     | whole word equal to the code (e.g. "TVL - HE"), then by the phrases below. Anything else is
     | scored with no strand information.
     */
    'strands' => ['ABM', 'CAREGIVING', 'GAS', 'HE', 'HUMSS', 'IA'],
    'strand_phrases' => [
        'ABM' => ['accountancy'],
        'CAREGIVING' => ['caregiving'],
        'GAS' => ['general academic'],
        'HE' => ['home economics'],
        'HUMSS' => ['humanities'],
        'IA' => ['industrial arts'],
    ],
];
