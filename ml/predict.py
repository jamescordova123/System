"""
Score fee rows with the trained random forest.

  echo '{"rows":[{...}]}' | python3 ml/predict.py
Prints {"model_version": "...", "probabilities": [...]} (probability that each fee is paid late or not at all).
"""
import json, os, sys
import joblib
from pandas import DataFrame
from features import build_matrix

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.environ.get('RISK_MODEL_DIR', os.path.join(HERE, 'models'))

try:
    rows = json.load(sys.stdin)['rows']
    meta = json.load(open(os.path.join(MODEL_DIR, 'risk_rf.json')))
    rf = joblib.load(os.path.join(MODEL_DIR, 'risk_rf.joblib'))
    probs = rf.predict_proba(build_matrix(DataFrame(rows)))[:, 1].round(6).tolist() if rows else []
    print(json.dumps({'model_version': meta['model_version'], 'probabilities': probs}))
except Exception as e:  # Laravel reads stderr and the exit code
    print(f'predict.py failed: {e}', file=sys.stderr)
    sys.exit(1)
