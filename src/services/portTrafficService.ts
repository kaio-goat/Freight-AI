import trafficCsvRaw from '../../data/raw/TableNo12_TRAFFIC_HANDLED_AT_KOLKATA_and_HALDIA_PORTS.csv?raw';
import type { PortTrafficRecord, PortTrafficFeatures } from '../data/types';

export function parsePortTrafficData(): PortTrafficRecord[] {
  const lines = trafficCsvRaw.trim().split('\n');
  const records: PortTrafficRecord[] = [];
  
  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 10) {
      const parseVal = (val: string) => val === 'NA' ? null : parseInt(val, 10);
      
      records.push({
        financialYear: parts[0].trim(),
        overseasUnloaded: parseVal(parts[1]),
        overseasLoaded: parseVal(parts[2]),
        overseasTotal: parseVal(parts[3]),
        coastalUnloaded: parseVal(parts[4]),
        coastalLoaded: parseVal(parts[5]),
        coastalTotal: parseVal(parts[6]),
        totalUnloaded: parseVal(parts[7]),
        totalLoaded: parseVal(parts[8]),
        totalTraffic: parseVal(parts[9])
      });
    }
  }
  
  return records;
}

export function generatePortTrafficFeatures(records: PortTrafficRecord[]): PortTrafficFeatures | null {
  // Filter records that have totalTraffic to ensure valid latest year
  const validRecords = records.filter(r => r.totalTraffic !== null);
  if (validRecords.length === 0) return null;
  
  const latest = validRecords[validRecords.length - 1];
  const previous = validRecords.length > 1 ? validRecords[validRecords.length - 2] : null;
  
  const totalTraffic = latest.totalTraffic || 0;
  
  let yoyGrowthPercent = 0;
  if (previous && previous.totalTraffic) {
    yoyGrowthPercent = ((totalTraffic - previous.totalTraffic) / previous.totalTraffic) * 100;
  }
  
  const overseasSharePercent = totalTraffic ? ((latest.overseasTotal || 0) / totalTraffic) * 100 : 0;
  const coastalSharePercent = totalTraffic ? ((latest.coastalTotal || 0) / totalTraffic) * 100 : 0;
  
  const totalUnloaded = latest.totalUnloaded || 0;
  const totalLoaded = latest.totalLoaded || 1; // avoid div by 0
  const importExportRatio = totalUnloaded / totalLoaded;

  return {
    latestYear: latest.financialYear,
    totalTraffic,
    yoyGrowthPercent,
    overseasSharePercent,
    coastalSharePercent,
    importExportRatio
  };
}

export const PORT_TRAFFIC_RECORDS = parsePortTrafficData();
export const PORT_TRAFFIC_FEATURES = generatePortTrafficFeatures(PORT_TRAFFIC_RECORDS);
