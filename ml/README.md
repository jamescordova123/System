# Section risk model (random forest)

Predicts the chance that a Grade 11/12 fee is paid late or not at all, then averages it per section.

## How it fits together

1. `php artisan risk:predict` (runs right after any payment, billing, enrollment or student change, with no queue worker needed, and every 15 minutes if the scheduler is running)
   (`app/Services/Risk/RiskFeatureBuilder.php`), sends them to `ml/predict.py`, and saves one row per section in
   `risk_predictions` (probability, risk level, fees scored, drivers).
2. The Cashier and Admin "Risk Analytics" pages read those rows.
3. `php artisan risk:export-training` writes past fees with their outcome so the model can be retrained on real data.

## Setup

```bash
php artisan migrate
python3 -m pip install -r ml/requirements.txt     # same Python as RISK_PYTHON (default python3)
php artisan risk:predict --dry-run                # shows the section table without saving
php artisan risk:predict
```

`scikit-learn` is pinned because the saved model (`ml/models/risk_rf.joblib`) must be loaded by the same version.
If your server has another version, retrain there with the command below instead of changing the pin.

## Retrain on real payments

```bash
php artisan risk:export-training                  # storage/app/risk/training_table.csv
python3 ml/train_model.py --data storage/app/risk/training_table.csv --version rf-real-v1 --source real
```

## Important

- The model in `ml/models` was trained on **simulated** payment dates (DSSC roster, 2023-2026). Its scores show that the
  pipeline works; they are not findings about real learners. Retrain on real receipts before using the numbers.
- Each fee's deadline is `billing_line_items.due_date` when set, otherwise the school-year start plus the months in
  `config/risk.php` (ID and uniform 2, test papers 4/8/12, consumables 7). Check the start dates there.
- `sections.course_name` is matched to a strand (ABM, HUMSS, GAS, HE, IA, Caregiving) in `config/risk.php`. A name that
  matches none is scored without strand information.
- Risk levels use `RISK_MEDIUM` / `RISK_HIGH` (default 0.25 / 0.35), chosen for the simulated data.
- Only Grade 11 and Grade 12 fees are scored (the model has no Japanese-language or graduation fees).
