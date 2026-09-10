import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteMap } from '@/components/routes/RouteMap';
import { useScenarioStore } from '@/store/scenarioStore';
import { ROUTES } from '@/data/routes';
import { PORTS } from '@/data/ports';
import { Button } from '@/components/ui/Button';
import { 
  Anchor, Navigation, AlertTriangle, ShieldCheck, Map, Info, 
  TrendingUp, Clock, Package, CheckCircle2, XCircle, TrendingDown, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils/formatting';

export function RoutesPage() {
  const navigate = useNavigate();
  const { scenarios, activeScenarioId } = useScenarioStore();
  const activeScenario = scenarios.find(s => s.id === activeScenarioId);
  
  // Try to default to the active scenario's route, if available.
  const activeRoute = activeScenario 
    ? ROUTES.find(r => r.id === activeScenario.routeId)
    : null;

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(activeRoute?.id || ROUTES[0]?.id || null);

  // Sync if active scenario changes, but only initially
  useEffect(() => {
    if (activeRoute && !selectedRouteId) {
      setSelectedRouteId(activeRoute.id);
    }
  }, [activeRoute, selectedRouteId]);

  const selectedRoute = ROUTES.find(r => r.id === selectedRouteId) || ROUTES[0];
  const destination = PORTS.find(p => p.id === selectedRoute?.destinationId);

  // Does the selected route match the active scenario?
  const isActiveScenarioRoute = activeScenario?.routeId === selectedRoute?.id;
  
  // Use intelligence engine data IF this route is the active scenario and valid
  const decisionResult = isActiveScenarioRoute && activeScenario?.decisionResult ? activeScenario.decisionResult : null;

  // Pre-calculate some values to avoid inline clutter
  const forecastChangePercent = useMemo(() => {
    if (!decisionResult) return 0;
    const { currentRate, forecast7d } = decisionResult.forecast;
    if (currentRate === 0) return 0;
    return ((forecast7d - currentRate) / currentRate) * 100;
  }, [decisionResult]);

  const compatibilityScore = decisionResult?.vessel.ranking[0]?.overallScore || 0;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
            <Map className="w-8 h-8 mr-3 text-muted-foreground opacity-50" />
            Global Route Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive maritime command visualization of strategic trade lanes and operational constraints.
          </p>
        </div>
        
        {/* Route Selector */}
        <div className="flex flex-col min-w-[300px]">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Select Route Network</label>
          <select 
            value={selectedRouteId || ''} 
            onChange={(e) => setSelectedRouteId(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            {ROUTES.map(r => (
              <option key={r.id} value={r.id}>
                {r.originName} → {r.destinationName} {isActiveScenarioRoute && r.id === activeRoute?.id ? '(Active Scenario)' : ''}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive World Map */}
        <div className="lg:col-span-7 space-y-6">
          <RouteMap 
            selectedRouteId={selectedRouteId} 
            onRouteSelect={setSelectedRouteId} 
          />
          <div className="flex gap-4">
            <div className="bg-secondary/50 p-4 border border-border text-sm flex items-start text-muted-foreground w-full">
              <Info className="w-4 h-4 mr-3 shrink-0 mt-0.5 text-primary" />
              <div>
                <strong className="text-foreground">Command Center Map:</strong> Select a route to view its specific constraints and intelligence. The map visualizes indicative maritime paths. Global origin markers are rendered in blue, East Coast destinations in orange. Use mouse to pan and scroll to zoom.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Route Intelligence Panel */}
        <div className="lg:col-span-5">
          <div className="border border-border bg-card sticky top-8 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="p-6 border-b border-border bg-secondary/20 sticky top-0 z-10 backdrop-blur-md">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Route Intelligence</div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
                {selectedRoute?.originName} <Navigation className="w-4 h-4 rotate-90 text-muted-foreground" /> {selectedRoute?.destinationName}
              </h2>
            </div>
            
            <div className="p-6 space-y-8">
              
              {/* 1. ROUTE LEVEL INFO */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 border border-border rounded-sm">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Distance</div>
                  <div className="font-bold text-xl">{selectedRoute ? formatNumber(selectedRoute.distanceNM) : '—'} <span className="text-sm font-normal text-muted-foreground">NM</span></div>
                </div>
                <div className="p-4 bg-secondary/30 border border-border rounded-sm">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Est. Voyage</div>
                  <div className="font-bold text-xl">{selectedRoute ? selectedRoute.typicalDays : '—'} <span className="text-sm font-normal text-muted-foreground">Days</span></div>
                </div>
              </div>

              {/* ACTIVE SCENARIO TOGGLE / FALLBACK */}
              {!isActiveScenarioRoute || !decisionResult ? (
                <div className="p-6 border border-dashed border-border bg-secondary/10 flex flex-col items-center text-center">
                  <AlertTriangle className="w-8 h-8 text-muted-foreground mb-3" />
                  <h3 className="font-bold text-foreground mb-2">No active scenario for this route</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a forecast to unlock cargo-specific freight, vessel, timing, and risk intelligence for {selectedRoute?.originName} to {selectedRoute?.destinationName}.
                  </p>
                  <Button onClick={() => navigate('/forecast/new')} variant="default" className="w-full">
                    Create Forecast
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  
                  {/* CARGO */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></div> Active Scenario
                    </h3>
                    <div className="border border-border p-4 bg-secondary/20 flex justify-between items-center">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-muted-foreground mr-3" />
                        <div>
                          <div className="font-bold text-sm uppercase">{activeScenario.cargo}</div>
                          <div className="text-xs text-muted-foreground">{activeScenario.contract} Contract</div>
                        </div>
                      </div>
                      <div className="font-bold">{formatNumber(activeScenario.quantity)} <span className="text-xs text-muted-foreground font-normal">MT</span></div>
                    </div>
                  </div>

                  {/* FREIGHT INTELLIGENCE */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Freight Intelligence</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-border p-4 bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Current Freight</div>
                        <div className="font-bold text-lg">{formatCurrency(decisionResult.forecast.currentRate)}<span className="text-xs text-muted-foreground font-normal">/MT</span></div>
                      </div>
                      <div className="border border-border p-4 bg-card">
                        <div className="text-xs text-muted-foreground mb-1">7-Day Outlook</div>
                        <div className="flex items-center gap-2">
                          {decisionResult.forecast.trend === 'UP' ? <TrendingUp className="w-5 h-5 text-destructive" /> : (decisionResult.forecast.trend === 'DOWN' ? <TrendingDown className="w-5 h-5 text-positive" /> : <Minus className="w-5 h-5 text-muted-foreground" />)}
                          <span className={cn("font-bold", decisionResult.forecast.trend === 'UP' ? "text-destructive" : (decisionResult.forecast.trend === 'DOWN' ? "text-positive" : "text-muted-foreground"))}>
                            {decisionResult.forecast.trend === 'UP' ? '+' : ''}{forecastChangePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VESSEL INTELLIGENCE */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Vessel Intelligence</h3>
                    <div className="border border-border p-4 bg-card space-y-4">
                      <div className="flex justify-between items-center border-b border-border/50 pb-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Recommended Class</div>
                          <div className="font-bold text-primary flex items-center">
                            <Anchor className="w-4 h-4 mr-2" /> {decisionResult.vessel.recommendedVessel}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Match Score</div>
                          <div className="font-bold">{compatibilityScore}%</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {decisionResult.vessel.explanation?.[0] || 'Optimized for current market dynamics.'}
                      </div>
                    </div>
                  </div>

                  {/* MARKET TIMING & IDLE REPOSITIONING */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-border p-4 bg-card">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Market Timing</div>
                      <div className={cn("font-bold text-sm mb-1 uppercase", decisionResult.timing.timing === 'ENTER NOW' ? 'text-positive' : (decisionResult.timing.timing === 'WAIT' ? 'text-warning' : 'text-accent'))}>
                        {decisionResult.timing.timing}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {decisionResult.timing.expectedReason}
                      </div>
                    </div>
                    {decisionResult.idle && (
                      <div className="border border-border p-4 bg-card">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Repositioning</div>
                        <div className="font-bold text-sm text-warning mb-1 flex items-center">
                          <Clock className="w-4 h-4 mr-1" /> ~{decisionResult.idle.estimatedIdleDays} Days
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {decisionResult.idle.idleCostIndex > 60 ? 'High' : 'Moderate'} cost impact
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ROUTE RISK */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Risk Analysis</h3>
                    <div className="border border-border p-4 bg-card">
                      <div className="flex justify-between items-center mb-3 border-b border-border/50 pb-3">
                        <div className="flex items-center text-sm font-medium">
                          <ShieldCheck className={cn("w-4 h-4 mr-2", decisionResult.risk.overallRisk === 'Low' ? 'text-positive' : (decisionResult.risk.overallRisk === 'Moderate' ? 'text-warning' : 'text-accent'))} />
                          Overall Risk
                        </div>
                        <div className={cn("font-bold uppercase", decisionResult.risk.overallRisk === 'Low' ? 'text-positive' : (decisionResult.risk.overallRisk === 'Moderate' ? 'text-warning' : 'text-accent'))}>
                          {decisionResult.risk.overallRisk}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Freight Volatility:</span>
                          <span className={cn(decisionResult.risk.freightVolatilityRisk === 'Low' ? 'text-positive' : (decisionResult.risk.freightVolatilityRisk === 'Moderate' ? 'text-warning' : 'text-accent'))}>{decisionResult.risk.freightVolatilityRisk}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Port Congestion:</span>
                          <span className={cn(decisionResult.risk.portCongestionRisk === 'Low' ? 'text-positive' : (decisionResult.risk.portCongestionRisk === 'Moderate' ? 'text-warning' : 'text-accent'))}>{decisionResult.risk.portCongestionRisk}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Idle Repositioning:</span>
                          <span className={cn(decisionResult.risk.idleTimeRisk === 'Low' ? 'text-positive' : (decisionResult.risk.idleTimeRisk === 'Moderate' ? 'text-warning' : 'text-accent'))}>{decisionResult.risk.idleTimeRisk}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vessel Compatibility:</span>
                          <span className={cn(decisionResult.risk.compatibilityRisk === 'Low' ? 'text-positive' : (decisionResult.risk.compatibilityRisk === 'Moderate' ? 'text-warning' : 'text-accent'))}>{decisionResult.risk.compatibilityRisk}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* PORT INTELLIGENCE (ALWAYS VISIBLE) */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Port Intelligence ({selectedRoute?.destinationName})</h3>
                
                <div className="space-y-3 text-sm border border-border p-4 bg-secondary/10">
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Max Draft</span>
                    <span className="font-medium">{destination?.maxDraft ? `${destination.maxDraft}m` : 'Unrestricted'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Max LOA</span>
                    <span className="font-medium">{destination?.maxLOA ? `${destination.maxLOA}m` : 'Unrestricted'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground flex items-center">
                      Congestion <span className="ml-2 text-[9px] uppercase bg-secondary px-1 py-0.5 rounded text-muted-foreground">Prototype Signal</span>
                    </span>
                    <span className={cn("font-medium", (destination?.congestionIndex || 0) > 60 ? "text-warning" : "text-positive")}>
                      {destination?.congestionIndex || '—'}/100 
                      <span className="text-xs text-muted-foreground ml-1">({(destination?.congestionIndex || 0) > 60 ? 'Moderate' : 'Low'})</span>
                    </span>
                  </div>
                  {destination?.requiresLighterage && (
                    <div className="flex items-center text-accent font-medium mt-2 bg-accent/10 p-2 rounded-sm border border-accent/20">
                      <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                      Requires Anchorage/Lighterage Operations
                    </div>
                  )}
                  {isActiveScenarioRoute && decisionResult && (
                    <div className="mt-4 pt-2">
                      {decisionResult.vessel.ranking[0]?.portCompatibility === 0 ? (
                        <div className="flex items-start text-destructive text-xs bg-destructive/10 p-3 rounded-sm border border-destructive/20">
                          <XCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block mb-1">INCOMPATIBLE</strong>
                            Recommended vessel physical constraints exceed port limits.
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-positive text-xs bg-positive/10 p-3 rounded-sm border border-positive/20">
                          <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                          Port constraints are compatible with recommended vessel class.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
