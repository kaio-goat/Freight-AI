import coalCsvRaw from '../../data/raw/australian_coal_monthly.csv?raw';
import type { CoalRecord, CoalFeatures } from '../data/types';

export function parseCoalData(): CoalRecord[] {
  const lines = coalCsvRaw.trim().split('\n');
  const records: CoalRecord[] = [];
  
  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 2) {
      records.push({
        date: parts[0].trim(),
        price: parseFloat(parts[1])
      });
    }
  }
  
  return records;
}

export function generateCoalFeatures(records: CoalRecord[]): CoalFeatures | null {
  if (records.length === 0) return null;
  
  const current = records[records.length - 1];
  const previous = records.length > 1 ? records[records.length - 2] : null;
  const yearAgo = records.length > 12 ? records[records.length - 13] : null;
  
  const currentPrice = current.price;
  
  let monthlyChange = 0;
  let monthlyChangePercent = 0;
  if (previous) {
    monthlyChange = currentPrice - previous.price;
    monthlyChangePercent = (monthlyChange / previous.price) * 100;
  }
  
  let yoyChange = 0;
  let yoyChangePercent = 0;
  if (yearAgo) {
    yoyChange = currentPrice - yearAgo.price;
    yoyChangePercent = (yoyChange / yearAgo.price) * 100;
  }
  
  const getAvg = (months: number) => {
    if (records.length < months) return 0;
    const slice = records.slice(-months);
    const sum = slice.reduce((acc, r) => acc + r.price, 0);
    return sum / months;
  };
  
  const avg3m = getAvg(3);
  const avg6m = getAvg(6);
  const avg12m = getAvg(12);
  
  let volatility12m = 0;
  if (records.length >= 12) {
    const slice = records.slice(-12).map(r => r.price);
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - avg12m, 2), 0) / 12;
    volatility12m = Math.sqrt(variance);
  }
  
  let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (monthlyChangePercent > 3) trend = 'UP';
  else if (monthlyChangePercent < -3) trend = 'DOWN';
  
  return {
    currentPrice,
    monthlyChange,
    monthlyChangePercent,
    avg3m,
    avg6m,
    avg12m,
    volatility12m,
    trend,
    yoyChange,
    yoyChangePercent
  };
}

export const COAL_RECORDS = parseCoalData();
export const COAL_FEATURES = generateCoalFeatures(COAL_RECORDS);
