"""Feature definition shared by training and prediction, so both always build the same matrix."""
import pandas as pd

NUMERIC = ['grade', 'fee_number', 'amount_due', 'days_to_deadline', 'prior_fees', 'prior_failed',
           'prior_unpaid', 'prior_fail_rate', 'prior_avg_days_late', 'prior_max_days_late', 'has_history']
CATEGORICAL = {
    'strand': ['ABM', 'CAREGIVING', 'GAS', 'HE', 'HUMSS', 'IA'],
    'gender': ['F', 'M'],
    'fee_group': ['CONSUMABLE', 'ID', 'TESTPAPER', 'UNIFORM'],
}
FEATURES = NUMERIC + [f'{c}_{v}' for c, vals in CATEGORICAL.items() for v in vals]
LABEL = 'failed_late_or_unpaid'


def build_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Numeric columns as-is, categoricals one-hot. An unknown category becomes all zeros."""
    X = pd.DataFrame(index=df.index)
    for c in NUMERIC:
        X[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)
    for c, vals in CATEGORICAL.items():
        col = df[c].astype(str).str.upper().str.strip()
        for v in vals:
            X[f'{c}_{v}'] = (col == v).astype(int)
    return X[FEATURES]
