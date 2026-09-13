import { 
  V1_5_FEATURES, 
  SCALER_MEAN, 
  SCALER_SCALE, 
  LR_COEFFICIENTS, 
  LR_INTERCEPT 
} from './mlModelParameters';
import type { BdiRecord } from '../data/types';

/**
 * Predicts the next month's BDI based on the V1.5 Linear Regression model.
 * 
 * @param features An object containing the exactly required 9 features.
 * @returns The predicted BDI for T+1.
 */
export function predictBdi(features: Record<string, number>): number {
  let prediction = LR_INTERCEPT;
  
  for (let i = 0; i < V1_5_FEATURES.length; i++) {
    const featureName = V1_5_FEATURES[i];
    const rawValue = features[featureName];
    
    if (rawValue === undefined || isNaN(rawValue)) {
      throw new Error(`Missing or invalid feature: ${featureName}`);
    }
    
    const scaledFeature = (rawValue - SCALER_MEAN[i]) / SCALER_SCALE[i];
    prediction += LR_COEFFICIENTS[i] * scaledFeature;
  }
  
  return prediction;
}

/**
 * Deterministically constructs the V1.5 feature set from BDI history.
 * Mirrors the exact logic from the Python preprocessing script.
 */
export function constructV1_5Features(history: BdiRecord[]): Record<string, number> | null {
  if (history.length < 12) {
    return null; // Not enough history to calculate 12-month rolling windows
  }
  
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  
  // Date parsing
  // Date format is expected to be YYYY-MM
  const [, monthStr] = current.date.split('-');
  const month = parseInt(monthStr, 10);
  
  // bdi
  const bdi = current.value;
  
  // bdi_1m_change
  const bdi_1m_change = bdi - previous.value;
  
  // Rolling averages
  const calcAvg = (months: number) => {
    const slice = history.slice(-months);
    const sum = slice.reduce((acc, row) => acc + row.value, 0);
    // Python pandas rolling(N).mean() rounds or keeps float precision.
    return sum / months;
  };
  
  // bdi_3m_avg, bdi_6m_avg, bdi_12m_avg
  // Note: We round to 2 decimal places to match Python if it did, but actually pandas doesn't round internally,
  // but let's see. In the parity tests, the features json shows 2 decimal places?
  // Ah! "bdi_3m_avg": 1214.67 - wait, pandas to_dict() might have just kept float. 
  // Let's use exact float to be safe, but wait: the parity test JSON had exactly "1214.67".
  // Actually, I didn't round it in `generate_ml_dataset.js`! Ah!
  // The V1 and V1.5 models were trained on `data/processed/freight_training_dataset.csv`.
  // The `generate_ml_dataset.js` script DID round them to 2 decimal places!
  // Let me verify this by looking at `generate_ml_dataset.js` or `mlDatasetService.ts`.
  // Let me just not round and if parity fails, I'll add rounding. But let me add a parameter to control rounding if needed.
  // Actually, `generate_ml_dataset.js` used: `Number(val.toFixed(2))`. I will replicate that here!
  
  const round2 = (num: number) => Math.round(num * 100) / 100;
  
  const bdi_3m_avg = round2(calcAvg(3));
  const bdi_6m_avg = round2(calcAvg(6));
  const bdi_12m_avg = round2(calcAvg(12));
  
  // 12-month volatility (sample standard deviation, ddof=1 to match pandas)
  const slice12 = history.slice(-12);
  const avg12_exact = slice12.reduce((acc, r) => acc + r.value, 0) / 12;
  const variance_ddof1 = slice12.reduce((acc, r) => acc + Math.pow(r.value - avg12_exact, 2), 0) / 11;
  const bdi_12m_volatility = round2(Math.sqrt(variance_ddof1));
  
  // Seasonality
  const month_sin = round2(Math.sin(2 * Math.PI * month / 12));
  const month_cos = round2(Math.cos(2 * Math.PI * month / 12));
  
  return {
    bdi,
    bdi_1m_change,
    bdi_3m_avg,
    bdi_6m_avg,
    bdi_12m_avg,
    bdi_12m_volatility,
    month,
    month_sin,
    month_cos
  };
}
