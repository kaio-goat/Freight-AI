import type { BdiRecord, CoalRecord, TrainingFeatureRow } from '../data/types';

function getAvg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function getVolatility(arr: number[], avg: number): number {
  if (arr.length === 0) return 0;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Align BDI and Coal records and build a perfectly sequential, 
 * lookahead-free training dataset for ML forecasting.
 */
export function buildTrainingDataset(bdiRecords: BdiRecord[], coalRecords: CoalRecord[]): TrainingFeatureRow[] {
  const bdiMap = new Map(bdiRecords.map(r => [r.date, r.value]));
  const coalMap = new Map(coalRecords.map(r => [r.date, r.price]));
  
  const intersection = Array.from(bdiMap.keys())
    .filter(date => coalMap.has(date))
    .sort((a, b) => a.localeCompare(b));
    
  const dataset: TrainingFeatureRow[] = [];

  for (let i = 0; i < intersection.length - 1; i++) {
    const date = intersection[i];
    const targetDate = intersection[i + 1];
    
    // Check strict sequentiality
    const currentY = parseInt(date.substring(0, 4), 10);
    const currentM = parseInt(date.substring(5, 7), 10);
    const nextY = parseInt(targetDate.substring(0, 4), 10);
    const nextM = parseInt(targetDate.substring(5, 7), 10);
    
    const expectedNextM = currentM === 12 ? 1 : currentM + 1;
    const expectedNextY = currentM === 12 ? currentY + 1 : currentY;
    
    if (nextY !== expectedNextY || nextM !== expectedNextM) {
      continue; // Skip if there's a gap
    }

    if (i < 12) continue; // Require at least 12 months for trailing features
    
    // Construct trailing window
    const currentBdi = bdiMap.get(date)!;
    const bdiHistory12 = [];
    for (let j = i - 11; j <= i; j++) bdiHistory12.push(bdiMap.get(intersection[j])!);
    
    const bdi_1m_change = currentBdi - bdiHistory12[10];
    const bdi_3m_avg = getAvg(bdiHistory12.slice(-3));
    const bdi_6m_avg = getAvg(bdiHistory12.slice(-6));
    const bdi_12m_avg = getAvg(bdiHistory12);
    const bdi_12m_volatility = getVolatility(bdiHistory12, bdi_12m_avg);
    
    const currentCoal = coalMap.get(date)!;
    const coalHistory12 = [];
    for (let j = i - 11; j <= i; j++) coalHistory12.push(coalMap.get(intersection[j])!);
    
    const coal_1m_change = currentCoal - coalHistory12[10];
    const coal_3m_avg = getAvg(coalHistory12.slice(-3));
    const coal_6m_avg = getAvg(coalHistory12.slice(-6));
    const coal_12m_avg = getAvg(coalHistory12);
    const coal_12m_volatility = getVolatility(coalHistory12, coal_12m_avg);
    
    // Seasonality
    const month_sin = Math.sin(2 * Math.PI * currentM / 12);
    const month_cos = Math.cos(2 * Math.PI * currentM / 12);
    
    // Target (Next Month's BDI strictly)
    const target_bdi = bdiMap.get(targetDate)!;
    
    dataset.push({
      date,
      bdi: currentBdi,
      bdi_1m_change: Number(bdi_1m_change.toFixed(2)),
      bdi_3m_avg: Number(bdi_3m_avg.toFixed(2)),
      bdi_6m_avg: Number(bdi_6m_avg.toFixed(2)),
      bdi_12m_avg: Number(bdi_12m_avg.toFixed(2)),
      bdi_12m_volatility: Number(bdi_12m_volatility.toFixed(2)),
      coal_price: currentCoal,
      coal_1m_change: Number(coal_1m_change.toFixed(2)),
      coal_3m_avg: Number(coal_3m_avg.toFixed(2)),
      coal_6m_avg: Number(coal_6m_avg.toFixed(2)),
      coal_12m_avg: Number(coal_12m_avg.toFixed(2)),
      coal_12m_volatility: Number(coal_12m_volatility.toFixed(2)),
      month: currentM,
      month_sin: Number(month_sin.toFixed(4)),
      month_cos: Number(month_cos.toFixed(4)),
      target_date: targetDate,
      target_bdi
    });
  }
  
  return dataset;
}
