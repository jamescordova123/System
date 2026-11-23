"""
Train the section-risk random forest and save it for ml/predict.py.

  python3 ml/train_model.py --data ml/data/training_table.csv --version rf-simulated-v1 --source simulated

The CSV needs the columns in ml/features.py plus failed_late_or_unpaid (1 = paid late or never paid).
It can come from the DSSC workbook script (training_table.csv) or from `php artisan risk:export-training`.
"""
import argparse, datetime as dt, json, os
import numpy as np, pandas as pd, joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from features import build_matrix, FEATURES, LABEL

ap = argparse.ArgumentParser()
ap.add_argument('--data', required=True)
ap.add_argument('--out', default=os.path.join(os.path.dirname(__file__), 'models'))
ap.add_argument('--version', required=True)
ap.add_argument('--source', choices=['simulated', 'real'], required=True)
a = ap.parse_args()

df = pd.read_csv(a.data)
X, y = build_matrix(df), df[LABEL].values
rf = RandomForestClassifier(n_estimators=500, min_samples_leaf=10, max_features='sqrt', oob_score=True,
                            n_jobs=-1, random_state=2026).fit(X, y)
oob_auc = roc_auc_score(y, np.nan_to_num(rf.oob_decision_function_[:, 1], nan=y.mean()))
os.makedirs(a.out, exist_ok=True)
joblib.dump(rf, os.path.join(a.out, 'risk_rf.joblib'), compress=3)
meta = {'model_version': a.version, 'data_source': a.source, 'trained_at': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds'),
        'rows': int(len(df)), 'failure_rate': float(y.mean()), 'oob_roc_auc': round(float(oob_auc), 4),
        'features': FEATURES, 'label': LABEL}
json.dump(meta, open(os.path.join(a.out, 'risk_rf.json'), 'w'), indent=2)
print(json.dumps(meta, indent=2))
