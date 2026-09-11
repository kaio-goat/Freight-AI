import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenarioStore } from '@/store/scenarioStore';
import { ROUTES } from '@/data/routes';
import { PORTS } from '@/data/ports';
import { Button } from '@/components/ui/Button';
import { 
  Activity, TrendingUp, TrendingDown, Minus, 
  BarChart3, AlertTriangle, Globe, Ship, Anchor, Clock, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/formatting';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip
} from 'recharts';
import { runDecisionEngine } from '@/services/decisionEngine';
import { BDI_RECORDS, BDI_FEATURES } from '@/services/bdiService';
import { PORT_TRAFFIC_RECORDS, PORT_TRAFFIC_FEATURES } from '@/services/portTrafficService';

export function MarketPage() {
  const navigate = useNavigate();
  const { scenarios, activeScenarioId } = useScenarioStore();
  const activeScenario = scenarios.find(s => s.id === activeScenarioId);
  
  // Default to active scenario route or the first route
  const activeRoute = activeScenario 
    ? ROUTES.find(r => r.id === activeScenario.routeId)
    : ROUTES[0];

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(activeRoute?.id || ROUTES[0].id);

  const selectedRoute = ROUTES.find(r => r.id === selectedRouteId) || ROUTES[0];
  const destination = PORTS.find(p => p.id === selectedRoute.destinationId);

  // If there's an active scenario AND it matches the selected route, use its data
  const isActiveScenarioRoute = activeScenario?.routeId === selectedRoute.id;
  const decisionResult = isActiveScenarioRoute && activeScenario?.decisionResult 
    ? activeScenario.decisionResult 
    : runDecisionEngine(selectedRoute.originId, selectedRoute.destinationId, 'Coking Coal', 70000); // Baseline deterministic reference

  const timing = decisionResult.timing;
  const risk = decisionResult.risk;
  const vessel = decisionResult.vessel;

  // Combine historical BDI for the chart
  const bdiChartData = useMemo(() => {
    return BDI_RECORDS.map(r => ({
      date: r.date,
      value: r.value
    }));
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
            <Globe className="w-8 h-8 mr-3 text-muted-foreground opacity-50" />
            Macro Market Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Global freight market overview, Baltic Dry Index (BDI) tracking, and macro insights.
          </p>
        </div>
        
        {/* Context Selector */}
        <div className="flex flex-col min-w-[300px]">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Market Context Route</label>
          <select 
            value={selectedRouteId || ''} 
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            {ROUTES.map(r => (
              <option key={r.id} value={r.id}>
                {r.originName} → {r.destinationName} {isActiveScenarioRoute && r.id === activeScenario?.routeId ? '(Active Scenario)' : ''}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* ACTIVE SCENARIO STRIP */}
      {isActiveScenarioRoute ? (
        <div className="bg-primary/10 border border-primary/20 p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Active Forecast Context</div>
              <div className="text-sm font-medium">
                {activeScenario.cargo} ({formatNumber(activeScenario.quantity)} MT) | {activeScenario.contract}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-secondary/20 border border-border p-4 flex items-center justify-between text-muted-foreground">
          <div className="flex items-center space-x-4">
            <Info className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm">
              Displaying baseline market data for {selectedRoute.originName} to {selectedRoute.destinationName}. 
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/forecast/new')}>
            Create Scenario
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* MAIN MARKET CHART & OVERVIEW */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-border p-5 bg-card">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Baltic Dry Index (BDI)</div>
              <div className="text-3xl font-bold text-foreground">
                {formatNumber(BDI_FEATURES?.currentBdi || 0)}<span className="text-sm font-normal text-muted-foreground"> pts</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Latest monthly close</div>
            </div>
            <div className="border border-border p-5 bg-card">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Monthly Momentum</div>
              <div className="flex items-center gap-2 mt-1">
                {BDI_FEATURES?.trend === 'UP' ? <TrendingUp className="w-6 h-6 text-destructive" /> : (BDI_FEATURES?.trend === 'DOWN' ? <TrendingDown className="w-6 h-6 text-positive" /> : <Minus className="w-6 h-6 text-muted-foreground" />)}
                <span className={cn("font-bold text-2xl", BDI_FEATURES?.trend === 'UP' ? "text-destructive" : (BDI_FEATURES?.trend === 'DOWN' ? "text-positive" : "text-muted-foreground"))}>
                  {BDI_FEATURES?.trend === 'UP' ? '+' : ''}{(BDI_FEATURES?.monthlyChangePercent || 0).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">YoY: {(BDI_FEATURES?.yoyChangePercent || 0) > 0 ? '+' : ''}{(BDI_FEATURES?.yoyChangePercent || 0).toFixed(1)}%</div>
            </div>
            <div className="border border-border p-5 bg-card">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">12M Volatility</div>
              <div className="text-2xl font-bold mt-1 text-foreground">
                {formatNumber(BDI_FEATURES?.volatility12m || 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Standard deviation (12 mo)</div>
            </div>
          </div>

          {/* Market Chart */}
          <div className="border border-border bg-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Baltic Dry Index (2010 - Present)
              </h3>
              <div className="text-xs text-positive border border-positive/30 px-2 py-1 rounded bg-positive/10 font-medium">
                Real Historical Data
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bdiChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBdi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    tick={{fill: '#94a3b8', fontSize: 11}}
                    tickMargin={10}
                    minTickGap={50}
                  />
                  <YAxis 
                    stroke="#475569" 
                    tick={{fill: '#94a3b8', fontSize: 11}}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '4px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    formatter={(value: any) => [formatNumber(Number(value)), 'BDI']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#94a3b8" 
                    fillOpacity={1} 
                    fill="url(#colorBdi)" 
                    activeDot={{ r: 4, fill: '#f8fafc' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Market Drivers */}
          <div className="border border-border bg-card p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4">Primary Market Drivers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start">
                <Ship className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-foreground">Vessel Availability</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {decisionResult.idle ? `Estimated idle wait of ~${decisionResult.idle.estimatedIdleDays} days indicates ${decisionResult.idle.idleCostIndex > 60 ? 'tight' : 'stable'} supply.` : 'Balanced tonnage supply in region.'}
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <Anchor className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-foreground">Port Congestion</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {destination?.name} congestion index at {destination?.congestionIndex || 0}/100.
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <Activity className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-foreground">Commodity Demand</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Consistent baseload demand for {isActiveScenarioRoute ? activeScenario.cargo : 'Bulk Cargo'} supporting current rate floors.
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-foreground">Route Volatility</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {risk.freightVolatilityRisk === 'Low' ? 'Stable pricing environment.' : 'Fluctuations expected based on historical variance.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SIDEBAR INTELLIGENCE */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Market Timing Recommendation */}
          <div className="border border-border bg-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Clock className={cn("w-16 h-16 opacity-10", timing.timing === 'ENTER NOW' ? 'text-positive' : 'text-warning')} />
            </div>
            
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4">Strategic Timing</h3>
            
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-1">Recommendation</div>
              <div className={cn("text-3xl font-bold uppercase", timing.timing === 'ENTER NOW' ? 'text-positive' : (timing.timing === 'WAIT' ? 'text-warning' : 'text-accent'))}>
                {timing.timing}
              </div>
            </div>
            
            <div className="text-sm leading-relaxed text-muted-foreground border-l-2 border-border pl-3 mt-4">
              {timing.expectedReason}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Confidence Score</span>
                <span className="font-bold">{timing.confidence}/100</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full", timing.confidence > 75 ? "bg-positive" : "bg-warning")}
                  style={{ width: `${timing.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Vessel Class Markets */}
          <div className="border border-border bg-card p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4">Vessel Class Markets</h3>
            <div className="space-y-4">
              {vessel.ranking.map((rank) => (
                <div key={rank.vesselId} className="flex flex-col border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-foreground">{rank.vesselId}</span>
                    <span className="text-xs font-medium text-primary">Score: {rank.overallScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{rank.portCompatibility === 0 ? 'Incompatible with port' : 'Physically compatible'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Data Lineage Notice */}
          <div className="bg-secondary/20 border border-border p-4 flex items-start text-xs text-muted-foreground">
            <Info className="w-4 h-4 mr-2 shrink-0 text-primary mt-0.5" />
            <div>
              <strong>Data Transparency:</strong> Intelligence derived from deterministic models and static reference sets. Freight rates are indicative prototypes. 
              <br /><br />
              <Button variant="ghost" className="p-0 h-auto text-xs text-primary" onClick={() => navigate('/data-sources')}>
                View Data Methodology
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Kolkata/Haldia Port Activity Section */}
      <div className="mt-8 border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-primary flex items-center">
              <Anchor className="w-5 h-5 mr-2" /> Kolkata/Haldia Port Activity
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Annual financial-year traffic acting as a regional demand signal.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-secondary/50 border border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Latest Year</div>
            <div className="text-2xl font-bold">{PORT_TRAFFIC_FEATURES?.latestYear}</div>
          </div>
          <div className="p-4 bg-secondary/50 border border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center">
              <BarChart3 className="w-3 h-3 mr-1" /> Total Traffic
            </div>
            <div className="text-2xl font-bold">{formatNumber(PORT_TRAFFIC_FEATURES?.totalTraffic || 0)}</div>
            <div className={cn("text-sm mt-1 flex items-center", (PORT_TRAFFIC_FEATURES?.yoyGrowthPercent || 0) > 0 ? "text-accent" : "text-positive")}>
              {(PORT_TRAFFIC_FEATURES?.yoyGrowthPercent || 0) > 0 ? '+' : ''}{(PORT_TRAFFIC_FEATURES?.yoyGrowthPercent || 0).toFixed(1)}% YoY Growth
            </div>
          </div>
          <div className="p-4 bg-secondary/50 border border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Overseas Share</div>
            <div className="text-2xl font-bold">{(PORT_TRAFFIC_FEATURES?.overseasSharePercent || 0).toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground mt-1">of total traffic</div>
          </div>
          <div className="p-4 bg-secondary/50 border border-border">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Import/Export Ratio</div>
            <div className="text-2xl font-bold">{(PORT_TRAFFIC_FEATURES?.importExportRatio || 0).toFixed(2)}x</div>
            <div className="text-sm text-muted-foreground mt-1">Unloaded vs Loaded</div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PORT_TRAFFIC_RECORDS.filter(r => r.totalTraffic !== null).slice(-30)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="financialYear" 
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                minTickGap={30}
              />
              <YAxis 
                tickFormatter={(val: number) => formatNumber(val)}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '4px' }}
                formatter={(value: any) => [formatNumber(value as number), 'Total Traffic']}
              />
              
              <Area 
                type="monotone" 
                dataKey="totalTraffic" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.2} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
