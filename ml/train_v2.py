import os
import json
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit

def directional_accuracy(y_true, y_pred, current_bdi):
    actual_dir = np.sign(y_true - current_bdi)
    pred_dir = np.sign(y_pred - current_bdi)
    correct = (actual_dir == pred_dir) & (actual_dir != 0)
    # Also consider correct if both predict no change (though rare)
    correct = correct | ((actual_dir == 0) & (pred_dir == 0))
    return np.mean(correct)

def build_v2_dataset(raw_path):
    # Read raw
    df = pd.read_csv(raw_path, sep=';', dtype=str)
    
    # Clean date
    df.columns = ['Kuukausi', 'Sea freight prices']
    df['date'] = df['Kuukausi'].str.replace('"', '').str.replace('.', '-')
    df['bdi'] = df['Sea freight prices'].astype(float)
    df = df[['date', 'bdi']].dropna().sort_values('date').reset_index(drop=True)
    
    # Date parts
    df['year'] = df['date'].str[:4].astype(int)
    df['month'] = df['date'].str[5:7].astype(int)
    
    # 1. Base / V1.5 Features
    df['bdi_1m_change'] = df['bdi'] - df['bdi'].shift(1)
    df['bdi_3m_avg'] = df['bdi'].rolling(3).mean()
    df['bdi_6m_avg'] = df['bdi'].rolling(6).mean()
    df['bdi_12m_avg'] = df['bdi'].rolling(12).mean()
    df['bdi_12m_volatility'] = df['bdi'].rolling(12).std()
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
    
    # 2. Lag Features
    df['bdi_lag_1'] = df['bdi'].shift(1)
    df['bdi_lag_2'] = df['bdi'].shift(2)
    df['bdi_lag_3'] = df['bdi'].shift(3)
    df['bdi_lag_6'] = df['bdi'].shift(6)
    df['bdi_lag_12'] = df['bdi'].shift(12)
    
    # 3. Return Features (pct change)
    for k in [2, 3, 6, 12]:
        df[f'bdi_{k}m_change'] = (df['bdi'] / df[f'bdi_lag_{k}'].replace(0, np.nan)) - 1
        
    # 4. Momentum Features (velocity of BDI)
    # Defined deterministically as the raw change over the period
    df['bdi_momentum_3m'] = df['bdi'] - df['bdi_lag_3']
    df['bdi_momentum_6m'] = df['bdi'] - df['bdi_lag_6']
    df['bdi_momentum_12m'] = df['bdi'] - df['bdi_lag_12']
    
    # 5. Range Features
    df['bdi_3m_min'] = df['bdi'].rolling(3).min()
    df['bdi_3m_max'] = df['bdi'].rolling(3).max()
    df['bdi_6m_min'] = df['bdi'].rolling(6).min()
    df['bdi_6m_max'] = df['bdi'].rolling(6).max()
    df['bdi_12m_min'] = df['bdi'].rolling(12).min()
    df['bdi_12m_max'] = df['bdi'].rolling(12).max()
    
    # 6. Additional Volatility
    df['bdi_3m_volatility'] = df['bdi'].rolling(3).std()
    df['bdi_6m_volatility'] = df['bdi'].rolling(6).std()
    
    # Target
    df['target_date'] = df['date'].shift(-1)
    df['target_bdi'] = df['bdi'].shift(-1)
    
    # Drop NAs
    df_clean = df.dropna().reset_index(drop=True)
    return df_clean

def evaluate_model(y_true, y_pred, current_bdi):
    return {
        'MAE': mean_absolute_error(y_true, y_pred),
        'RMSE': np.sqrt(mean_squared_error(y_true, y_pred)),
        'R2': r2_score(y_true, y_pred),
        'Directional_Accuracy': directional_accuracy(y_true, y_pred, current_bdi)
    }

def main():
    os.makedirs('ml/models', exist_ok=True)
    
    # 1. Build dataset
    df = build_v2_dataset('data/raw/bdi_monthly_2010_2026.csv')
    df.to_csv('ml/models/v2_feature_dataset.csv', index=False)
    
    # Define feature groups
    features_v1_5 = [
        'bdi', 'bdi_1m_change', 'bdi_3m_avg', 'bdi_6m_avg', 
        'bdi_12m_avg', 'bdi_12m_volatility', 'month', 'month_sin', 'month_cos'
    ]
    
    features_lags = [
        'bdi_lag_1', 'bdi_lag_2', 'bdi_lag_3', 'bdi_lag_6', 'bdi_lag_12'
    ]
    
    features_returns = [
        'bdi_2m_change', 'bdi_3m_change', 'bdi_6m_change', 'bdi_12m_change'
    ]
    
    features_momentum_range_vol = [
        'bdi_momentum_3m', 'bdi_momentum_6m', 'bdi_momentum_12m',
        'bdi_3m_min', 'bdi_3m_max', 'bdi_6m_min', 'bdi_6m_max',
        'bdi_12m_min', 'bdi_12m_max',
        'bdi_3m_volatility', 'bdi_6m_volatility'
    ]
    
    feature_groups = {
        'A_V1_5': features_v1_5,
        'B_V1_5_Lags': features_v1_5 + features_lags,
        'C_V1_5_Returns': features_v1_5 + features_returns,
        'D_V1_5_Mom_Range_Vol': features_v1_5 + features_momentum_range_vol,
        'E_Full_V2': features_v1_5 + features_lags + features_returns + features_momentum_range_vol
    }
    
    target = 'target_bdi'
    
    # The final untouched test period is 2023-06 to 2026-07
    train_mask = df['target_date'] < '2023-06'
    train_df = df[train_mask].copy()
    test_df = df[~train_mask].copy()
    
    # 2. TimeSeries CV on the Train Set
    tscv = TimeSeriesSplit(n_splits=5)
    cv_results = []
    
    fold_ranges = []
    for fold, (train_idx, val_idx) in enumerate(tscv.split(train_df)):
        fold_train = train_df.iloc[train_idx]
        fold_val = train_df.iloc[val_idx]
        
        fold_ranges.append({
            'fold': fold,
            'train_range': f"{fold_train['date'].iloc[0]} to {fold_train['date'].iloc[-1]}",
            'val_range': f"{fold_val['date'].iloc[0]} to {fold_val['date'].iloc[-1]}"
        })
        
        # Naive Baseline for fold
        current_bdi_val = fold_val['bdi'].values
        naive_preds = current_bdi_val
        y_val_true = fold_val[target].values
        
        metrics_naive = evaluate_model(y_val_true, naive_preds, current_bdi_val)
        cv_results.append({'Fold': fold, 'Model': 'Naive Persistence', **metrics_naive})
        
        # Ablation Models
        for grp_name, f_list in feature_groups.items():
            X_tr = fold_train[f_list]
            y_tr = fold_train[target]
            X_va = fold_val[f_list]
            
            scaler = StandardScaler()
            X_tr_s = scaler.fit_transform(X_tr)
            X_va_s = scaler.transform(X_va)
            
            lr = LinearRegression()
            lr.fit(X_tr_s, y_tr)
            preds = lr.predict(X_va_s)
            
            metrics = evaluate_model(y_val_true, preds, current_bdi_val)
            cv_results.append({'Fold': fold, 'Model': f'LR_{grp_name}', **metrics})
            
    cv_results_df = pd.DataFrame(cv_results)
    cv_results_df.to_csv('ml/models/v2_cv_results.csv', index=False)
    
    # Aggregate CV results across folds
    ablation_agg = cv_results_df.groupby('Model').mean().drop(columns=['Fold']).reset_index()
    ablation_agg.to_csv('ml/models/v2_ablation_results.csv', index=False)
    
    # 3. Final Evaluation on Untouched Test Set
    final_results = []
    final_predictions_df = test_df[['date', 'target_date', 'bdi', target]].copy()
    final_predictions_df.rename(columns={'bdi': 'current_bdi', target: 'actual_target_bdi'}, inplace=True)
    
    y_test_true = test_df[target].values
    current_bdi_test = test_df['bdi'].values
    
    # Naive Final
    final_metrics_naive = evaluate_model(y_test_true, current_bdi_test, current_bdi_test)
    final_results.append({'Model': 'Naive Persistence', **final_metrics_naive})
    
    # Final models
    for grp_name, f_list in feature_groups.items():
        X_train_full = train_df[f_list]
        y_train_full = train_df[target]
        X_test_full = test_df[f_list]
        
        scaler = StandardScaler()
        X_tr_s = scaler.fit_transform(X_train_full)
        X_te_s = scaler.transform(X_test_full)
        
        lr = LinearRegression()
        lr.fit(X_tr_s, y_train_full)
        preds = lr.predict(X_te_s)
        
        final_metrics = evaluate_model(y_test_true, preds, current_bdi_test)
        final_results.append({'Model': f'LR_{grp_name}', **final_metrics})
        
        final_predictions_df[f'{grp_name}_pred'] = preds

    final_predictions_df.to_csv('ml/models/v2_final_test_predictions.csv', index=False)
    
    # 4. Metadata
    metadata = {
        'dataset': {
            'source': 'data/raw/bdi_monthly_2010_2026.csv',
            'row_count': len(df),
            'date_range': f"{df['date'].iloc[0]} to {df['date'].iloc[-1]}",
            'target_date_range': f"{df['target_date'].iloc[0]} to {df['target_date'].iloc[-1]}",
            'target_definition': 'BDI(T+1)',
            'missing_values': int(df.isna().sum().sum()),
            'duplicate_dates': int(df.duplicated(subset=['date']).sum()),
            'earliest_usable_date': df['date'].iloc[0]
        },
        'feature_engineering': {
            'formulas': {
                'pct_change': '(BDI_t / BDI_t-k) - 1',
                'momentum': 'BDI_t - BDI_t-k'
            },
            'feature_count': len(feature_groups['E_Full_V2']),
            'groups': {k: len(v) for k, v in feature_groups.items()}
        },
        'validation': {
            'strategy': 'TimeSeriesSplit',
            'folds': 5,
            'fold_ranges': fold_ranges,
            'scaler_strategy': 'StandardScaler fit independently on each fold training set',
            'leakage_check': 'Strictly chronological. No target info used for features. Rolling stats purely historical.',
            'test_period': f"{test_df['target_date'].iloc[0]} to {test_df['target_date'].iloc[-1]}"
        }
    }
    with open('ml/models/v2_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    # 5. Output Report Text
    print("--- DATASET STATS ---")
    print(f"Total Rows: {len(df)}")
    print(f"Date Range: {df['date'].iloc[0]} to {df['date'].iloc[-1]}")
    print(f"Target Date Range: {df['target_date'].iloc[0]} to {df['target_date'].iloc[-1]}")
    print(f"Total Features: {len(feature_groups['E_Full_V2'])}")
    
    print("\n--- ABLATION RESULTS (CV Aggregated) ---")
    print(ablation_agg.sort_values('Directional_Accuracy', ascending=False).to_string(index=False))
    
    print("\n--- FINAL UNTOUCHED TEST SET EVALUATION (2023-06 to 2026-07) ---")
    final_df = pd.DataFrame(final_results)
    print(final_df.to_string(index=False))
    
    v1_5 = final_df[final_df['Model'] == 'LR_A_V1_5'].iloc[0]
    full_v2 = final_df[final_df['Model'] == 'LR_E_Full_V2'].iloc[0]
    
    print("\n--- FINAL REPORT ANSWERS ---")
    print(f"1. Does V2 beat V1.5 during expanding TimeSeries CV?")
    # Check if Full V2 beats V1_5 in CV DA
    cv_v1_5 = ablation_agg[ablation_agg['Model'] == 'LR_A_V1_5']['Directional_Accuracy'].values[0]
    cv_v2 = ablation_agg[ablation_agg['Model'] == 'LR_E_Full_V2']['Directional_Accuracy'].values[0]
    print(f"   CV DA -> V1.5: {cv_v1_5*100:.2f}%, Full V2: {cv_v2*100:.2f}%")
    
    print(f"3. Does V2 beat V1.5 on the untouched 2023-06 to 2026-07 test period?")
    print(f"   Test DA -> V1.5: {v1_5['Directional_Accuracy']*100:.2f}%, Full V2: {full_v2['Directional_Accuracy']*100:.2f}%")
    print(f"   Test RMSE -> V1.5: {v1_5['RMSE']:.2f}, Full V2: {full_v2['RMSE']:.2f}")

if __name__ == "__main__":
    main()
