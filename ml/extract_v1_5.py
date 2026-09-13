import pandas as pd
import numpy as np
import json
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

def main():
    df = pd.read_csv('data/processed/freight_training_dataset.csv')
    
    bdi_features = [
        'bdi', 'bdi_1m_change', 'bdi_3m_avg', 'bdi_6m_avg', 'bdi_12m_avg', 'bdi_12m_volatility',
        'month', 'month_sin', 'month_cos'
    ]
    target = 'target_bdi'
    
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()
    
    X_train = train_df[bdi_features]
    y_train = train_df[target]
    X_test = test_df[bdi_features]
    y_test = test_df[target]
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    lr = LinearRegression()
    lr.fit(X_train_scaled, y_train)
    preds = lr.predict(X_test_scaled)
    
    # We want to output the parameters nicely
    params = {
        'features': bdi_features,
        'scaler': {
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist()
        },
        'model': {
            'coefficients': lr.coef_.tolist(),
            'intercept': lr.intercept_
        }
    }
    
    with open('ml/models/v1_5_params.json', 'w') as f:
        json.dump(params, f, indent=2)
        
    # Pick a few test rows for parity check
    test_rows = []
    for i in range(min(5, len(test_df))):
        idx = test_df.index[i]
        row_dict = test_df.loc[idx, bdi_features].to_dict()
        test_rows.append({
            'date': test_df.loc[idx, 'date'],
            'features': row_dict,
            'prediction': preds[i]
        })
        
    with open('ml/models/v1_5_parity_tests.json', 'w') as f:
        json.dump(test_rows, f, indent=2)
        
    print("V1.5 parameters extracted successfully.")

if __name__ == '__main__':
    main()
