import bdiCsvRaw from '../../data/raw/bdi_monthly_2010_2026.csv?raw';
import type { BdiRecord } from '../data/types';

export function parseBdiData(): BdiRecord[] {
  const lines = bdiCsvRaw.trim().split('\n');
  const records: BdiRecord[] = [];
  
  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Line format: "2010.01";2848
    const parts = line.split(';');
    if (parts.length >= 2) {
      const dateStr = parts[0].replace(/"/g, '');
      const value = parseInt(parts[1], 10);
      
      if (!isNaN(value)) {
        // convert "2010.01" to "2010-01"
        const [year, month] = dateStr.split('.');
        records.push({
          date: `${year}-${month.padStart(2, '0')}`,
          value
        });
      }
    }
  }
  
  return records;
}

export function generateBdiFeatures(records: BdiRecord[]) {
  if (records.length === 0) return null;
  
  const latest = records[records.length - 1];
  const previous = records.length > 1 ? records[records.length - 2] : null;
  const yearAgo = records.length > 12 ? records[records.length - 13] : null;
  
  const currentBdi = latest.value;
  
  const monthlyChange = previous ? currentBdi - previous.value : 0;
  const monthlyChangePercent = previous ? (monthlyChange / previous.value) * 100 : 0;
  
  const yoyChange = yearAgo ? currentBdi - yearAgo.value : 0;
  const yoyChangePercent = yearAgo ? (yoyChange / yearAgo.value) * 100 : 0;
  
  // Rolling averages
  const calculateAverage = (months: number) => {
    if (records.length < months) return 0;
    const slice = records.slice(-months);
    const sum = slice.reduce((acc, r) => acc + r.value, 0);
    return sum / months;
  };
  
  const avg3m = calculateAverage(3);
  const avg6m = calculateAverage(6);
  const avg12m = calculateAverage(12);
  
  // Volatility (standard dev of last 12 months)
  let volatility12m = 0;
  if (records.length >= 12) {
    const slice = records.slice(-12);
    const variance = slice.reduce((acc, r) => acc + Math.pow(r.value - avg12m, 2), 0) / 12;
    volatility12m = Math.sqrt(variance);
  }
  
  // Trend
  let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (monthlyChangePercent > 5) trend = 'UP';
  else if (monthlyChangePercent < -5) trend = 'DOWN';

  return {
    currentBdi,
    monthlyChange,
    monthlyChangePercent,
    yoyChange,
    yoyChangePercent,
    avg3m,
    avg6m,
    avg12m,
    volatility12m,
    trend
  };
}

// Pre-compute globally so it's only parsed once
export const BDI_RECORDS = parseBdiData();
export const BDI_FEATURES = generateBdiFeatures(BDI_RECORDS);
