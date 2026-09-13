import os
import pandas as pd
import numpy as np
import json
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

def directional_accuracy(y_true, y_pred, current_bdi):
    actual_dir = np.sign(y_true - current_bdi)
    pred_dir = np.sign(y_pred - current_bdi)
    correct = (actual_dir == pred_dir)
    return np.mean(correct)

def main():
    os.makedirs('ml/models', exist_ok=True)
    df = pd.read_csv('data/processed/freight_training_dataset.csv')
    
    bdi_features = [
        'bdi', 'bdi_1m_change', 'bdi_3m_avg', 'bdi_6m_avg', 'bdi_12m_avg', 'bdi_12m_volatility',
        'month', 'month_sin', 'month_cos'
    ]
    coal_features = [
        'coal_price', 'coal_1m_change', 'coal_3m_avg', 'coal_6m_avg', 'coal_12m_avg', 'coal_12m_volatility'
    ]
    all_features = bdi_features + coal_features
    target = 'target_bdi'
    
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()
    
    y_train = train_df[target]
    y_test = test_df[target]
    current_bdi_test = test_df['bdi']
    
    results = []

    # 1. Naive Persistence Baseline
    naive_preds = current_bdi_test.values
    
    # Wait, Directional Accuracy for Naive:
    # predicted_target = current_bdi => predicted_direction = sign(current_bdi - current_bdi) = 0
    # actual_direction = sign(y_test - current_bdi)
    # If actual_direction is 0, then naive is correct. 
    # Usually naive persistence is just 0 directional change.
    results.append({
        'Model': 'Naive Persistence',
        'MAE': mean_absolute_error(y_test, naive_preds),
        'RMSE': np.sqrt(mean_squared_error(y_test, naive_preds)),
        'R2': r2_score(y_test, naive_preds),
        'Directional_Accuracy': directional_accuracy(y_test.values, naive_preds, current_bdi_test.values)
    })
    
    # 2. Linear Regression without Coal
    X_train_bdi = train_df[bdi_features]
    X_test_bdi = test_df[bdi_features]
    
    scaler_bdi = StandardScaler()
    X_train_bdi_scaled = scaler_bdi.fit_transform(X_train_bdi)
    X_test_bdi_scaled = scaler_bdi.transform(X_test_bdi)
    
    lr_bdi = LinearRegression()
    lr_bdi.fit(X_train_bdi_scaled, y_train)
    preds_bdi = lr_bdi.predict(X_test_bdi_scaled)
    
    results.append({
        'Model': 'Linear Regression (BDI Only)',
        'MAE': mean_absolute_error(y_test, preds_bdi),
        'RMSE': np.sqrt(mean_squared_error(y_test, preds_bdi)),
        'R2': r2_score(y_test, preds_bdi),
        'Directional_Accuracy': directional_accuracy(y_test.values, preds_bdi, current_bdi_test.values)
    })
    
    # 3. Linear Regression with BDI + Coal
    X_train_all = train_df[all_features]
    X_test_all = test_df[all_features]
    
    scaler_all = StandardScaler()
    X_train_all_scaled = scaler_all.fit_transform(X_train_all)
    X_test_all_scaled = scaler_all.transform(X_test_all)
    
    lr_all = LinearRegression()
    lr_all.fit(X_train_all_scaled, y_train)
    preds_all = lr_all.predict(X_test_all_scaled)
    
    results.append({
        'Model': 'Linear Regression (BDI + Coal)',
        'MAE': mean_absolute_error(y_test, preds_all),
        'RMSE': np.sqrt(mean_squared_error(y_test, preds_all)),
        'R2': r2_score(y_test, preds_all),
        'Directional_Accuracy': directional_accuracy(y_test.values, preds_all, current_bdi_test.values)
    })
    
    results_df = pd.DataFrame(results)
    results_df.to_csv('ml/models/v1_5_baseline_comparison.csv', index=False)
    
    # Calculate improvements
    naive_res = results_df[results_df['Model'] == 'Naive Persistence'].iloc[0]
    bdi_res = results_df[results_df['Model'] == 'Linear Regression (BDI Only)'].iloc[0]
    all_res = results_df[results_df['Model'] == 'Linear Regression (BDI + Coal)'].iloc[0]
    
    # Da improvements
    da_imp_naive_to_all = all_res['Directional_Accuracy'] - naive_res['Directional_Accuracy']
    da_imp_bdi_to_all = all_res['Directional_Accuracy'] - bdi_res['Directional_Accuracy']
    
    # RMSE improvements (negative is better for RMSE, but we represent it as positive reduction)
    rmse_imp_naive_to_all = naive_res['RMSE'] - all_res['RMSE']
    rmse_imp_bdi_to_all = bdi_res['RMSE'] - all_res['RMSE']
    
    metadata = {
        'train_period': f"{train_df['date'].iloc[0]} to {train_df['date'].iloc[-1]}",
        'test_period': f"{test_df['date'].iloc[0]} to {test_df['date'].iloc[-1]}",
        'ablation': {
            'RMSE_improvement_from_Coal': rmse_imp_bdi_to_all,
            'DA_improvement_from_Coal': da_imp_bdi_to_all,
            'RMSE_improvement_vs_Naive': rmse_imp_naive_to_all,
            'DA_improvement_vs_Naive': da_imp_naive_to_all
        }
    }
    
    with open('ml/models/v1_5_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print("--- ABLATION RESULTS ---")
    print(results_df.to_string(index=False))
    print("\n--- COMPARISONS ---")
    print(f"Directional Accuracy improvement from BDI-only -> BDI+Coal: {da_imp_bdi_to_all*100:.2f}%")
    print(f"RMSE improvement from BDI-only -> BDI+Coal: {rmse_imp_bdi_to_all:.2f}")
    print(f"Directional Accuracy improvement vs Naive: {da_imp_naive_to_all*100:.2f}%")
    print(f"RMSE improvement vs Naive: {rmse_imp_naive_to_all:.2f}")

if __name__ == '__main__':
    main()
