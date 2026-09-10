import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertTriangle, TrendingDown, TrendingUp, Info, Anchor, LineChart as LineChartIcon, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/Button';
import { useScenarioStore } from '@/store/scenarioStore';
import { cn } from '@/lib/utils';
import { VESSEL_CLASSES } from '@/data/vessels';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatting';

export function Analysis() {
  const navigate = useNavigate();
  const { scenarios, activeScenarioId } = useScenarioStore();
  
  const scenario = scenarios.find((s) => s.id === activeScenarioId);
  
  if (
    !scenario || 
    !scenario.decisionResult ||
    !scenario.decisionResult.forecast ||
    !scenario.decisionResult.vessel ||
    !scenario.decisionResult.port ||
    !scenario.decisionResult.timing ||
    !scenario.decisionResult.risk
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold mb-4">No Active Scenario</h2>
        <p className="text-muted-foreground mb-6">Please create a new forecast to view analysis.</p>
        <Button onClick={() => navigate('/forecast/new')}>Create Forecast</Button>
      </div>
    );
  }

  const { decisionResult } = scenario;
  const { forecast, vessel, port, timing, risk } = decisionResult;

  // Generate chart data matching exactly what the component needs without synthetic math
  const chartData = [
    ...forecast.historicalData.map((h: any, i) => ({
      day: h.day ?? (i - forecast.historicalData.length + 1),
      historical: h.rate ?? h.ratePerTonne,
      forecast: null,
      forecastLow: null,
      forecastHigh: null
    })),
    ...forecast.forecastData.map(f => ({
      day: f.day,
      historical: null,
      forecast: f.base,
      forecastLow: f.low,
      forecastHigh: f.high
    }))
  ];
  
  // Make the transition continuous by copying the last historical point to day 0 of forecast
  const lastHist = chartData.find(d => d.day === 0);
  if (lastHist) {
    lastHist.forecast = lastHist.historical;
    lastHist.forecastLow = lastHist.historical;
    lastHist.forecastHigh = lastHist.historical;
  }
  
  // Domain callbacks for Y-Axis
  const yDomainMin = (dataMin: number) => Math.max(0, Math.floor(dataMin * 0.8));
  const yDomainMax = (dataMax: number) => Math.ceil(dataMax * 1.2);

  const getTrendingIcon = () => {
    if (forecast.trend === 'DOWN') return <TrendingDown className="w-5 h-5 mr-1" />;
    if (forecast.trend === 'UP') return <TrendingUp className="w-5 h-5 mr-1" />;
    return <span className="w-5 h-5 mr-1 text-center">-</span>;
  };

  const getTimingColor = () => {
    if (timing.timing === 'WAIT') return "text-accent";
    if (timing.timing === 'ENTER NOW') return "text-positive";
    return "text-intelligence";
  };

  const estimatedTotalCost = forecast.currentRate * scenario.quantity;

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      
      {/* Header Context */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground mb-2">
            <span>{scenario.originName}</span>
            <span className="w-4 h-[1px] bg-border"></span>
            <span>{scenario.destinationName}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Freight Intelligence Analysis</h1>
          <p className="text-muted-foreground mt-1">
            {formatNumber(scenario.quantity)} MT of {scenario.cargo} · {scenario.contract} Contract
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Chart Section */}
          <section className="border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold flex items-center">
                <LineChartIcon className="w-4 h-4 mr-2" /> 30-Day Freight Outlook
              </h2>
              <div className="flex items-center space-x-4 text-xs font-medium">
                <div className="flex items-center"><span className="w-3 h-3 bg-muted mr-2"></span> Historical</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-intelligence mr-2"></span> Forecast</div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={(val: number) => val === 0 ? 'Today' : val > 0 ? `+${val}d` : `${val}d`}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tickFormatter={(val: number) => `$${val}`}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    domain={[yDomainMin, yDomainMax]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    labelFormatter={(val: any) => val === 0 ? 'Today' : val > 0 ? `Day +${val}` : `Day ${val}`}
                  />
                  <ReferenceLine x={0} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                  
                  <Area 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="hsl(var(--muted-foreground))" 
                    fill="hsl(var(--muted))" 
                    strokeWidth={2}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="forecastHigh" 
                    stroke="none" 
                    fill="hsl(var(--intelligence))" 
                    fillOpacity={0.1} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="forecastLow" 
                    stroke="none" 
                    fill="hsl(var(--background))" 
                    fillOpacity={1} 
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="hsl(var(--intelligence))" 
                    fill="none" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Current Est.</div>
                <div className="text-xl font-bold">{formatCurrency(forecast.currentRate)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">7-Day Outlook</div>
                <div className={cn(
                  "text-xl font-bold flex items-center",
                  forecast.trend === 'DOWN' ? "text-positive" : 
                  forecast.trend === 'UP' ? "text-accent" : "text-primary"
                )}>
                  {getTrendingIcon()}
                  {formatCurrency(forecast.forecast7d)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Model Confidence</div>
                <div className="text-xl font-bold">{formatPercentage(forecast.confidence)}</div>
              </div>
            </div>
          </section>

          {/* Vessel Matching */}
          <section className="border border-border bg-card p-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-6 flex items-center">
              <Anchor className="w-4 h-4 mr-2" /> Fleet Match Evaluation
            </h2>
            
            <div className="space-y-4">
              {vessel.ranking.map((match) => {
                const vesselData = VESSEL_CLASSES.find(v => v.id === match.vesselId);
                const isRecommended = match.vesselId === vessel.recommendedVessel;
                
                return (
                  <div 
                    key={match.vesselId} 
                    className={cn(
                      "p-4 border transition-colors flex items-center justify-between",
                      isRecommended ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-bold text-lg mr-2">{vesselData?.name || match.vesselId}</span>
                        {isRecommended && <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 uppercase tracking-widest font-bold">Recommended</span>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Typical Capacity: {formatNumber(vesselData?.maxCapacity || 0)} MT
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn("text-2xl font-bold", isRecommended ? "text-primary" : "text-muted-foreground")}>
                        {match.overallScore}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Match Score</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 bg-secondary/50 p-4 border border-border text-sm">
              <h3 className="font-bold flex items-center mb-2">
                <Info className="w-4 h-4 mr-2 text-primary" /> Why {vessel.recommendedVessel}?
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                {vessel.explanation.map((reason, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-positive shrink-0 mt-0.5" /> 
                    {reason}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs italic opacity-70">
                * Representative vessel profiles are used for matching. Actual vessel specifications vary.
              </div>
            </div>
          </section>

          {/* Port Compatibility */}
          <section className="border border-border bg-card p-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-6 flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> Port Compatibility
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4">{scenario.originName} (Origin)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compatibility</span>
                      <span className={port.origin.status === 'COMPATIBLE' ? 'text-positive' : 'text-accent'}>
                        {port.origin.status}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={cn("h-full", port.origin.status === 'COMPATIBLE' ? 'bg-positive w-full' : 'bg-accent w-1/2')}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">{scenario.destinationName} (Destination)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compatibility</span>
                      <span className={port.destination.status === 'COMPATIBLE' ? 'text-positive' : 'text-accent'}>
                        {port.destination.status}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={cn("h-full", port.destination.status === 'COMPATIBLE' ? 'bg-positive w-full' : 'bg-accent w-1/2')}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {port.destination.status !== 'COMPATIBLE' && (
              <div className="mt-6 p-4 bg-accent/10 border border-accent/20 flex items-start">
                <AlertTriangle className="w-5 h-5 text-accent mr-3 shrink-0" />
                <div className="text-sm">
                  <span className="font-bold text-accent">Warning: Port Issues. </span>
                  {port.destination.warnings.join(' ')}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Decision Panel (The "Wow Moment") */}
        <div className="space-y-6">
          <div className="border border-primary bg-primary text-primary-foreground shadow-xl sticky top-8">
            <div className="p-6 border-b border-primary-foreground/10">
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/70 font-bold mb-1">Decision Intelligence</div>
              <h2 className="text-2xl font-bold tracking-tight leading-tight">Recommended Charter</h2>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div>
                <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Vessel</div>
                <div className="text-3xl font-bold">{vessel.recommendedVessel}</div>
              </div>

              <div className="pt-4 border-t border-primary-foreground/10">
                <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Market Action</div>
                <div className={cn(
                  "text-2xl font-bold inline-flex items-center px-3 py-1 bg-background",
                  getTimingColor()
                )}>
                  {timing.timing.toUpperCase()}
                </div>
                {timing.timing === 'WAIT' && (
                  <p className="text-sm mt-2 text-primary-foreground/90">
                    {timing.expectedReason}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-primary-foreground/10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Est. Freight</div>
                  <div className="font-bold text-xl">{formatCurrency(forecast.currentRate)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Total Cost</div>
                  <div className="font-bold text-xl">{formatCurrency(estimatedTotalCost)}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-primary-foreground/10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Risk</div>
                  <div className="font-bold flex items-center">
                    {risk.overallRisk === 'Low' ? <ShieldCheck className="w-4 h-4 mr-1 text-positive" /> : <AlertTriangle className="w-4 h-4 mr-1 text-accent" />}
                    {risk.overallRisk}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Confidence</div>
                  <div className="font-bold">{formatPercentage(forecast.confidence)}</div>
                </div>
              </div>

            </div>
            
            <div className="bg-primary-foreground/5 p-6 border-t border-primary-foreground/10 text-sm leading-relaxed">
              <strong>Summary:</strong> For {formatNumber(scenario.quantity)} MT of {scenario.cargo.toLowerCase()} from {scenario.originName} to {scenario.destinationName}, the model currently favors <strong>{vessel.recommendedVessel}</strong>. 
              {decisionResult.summaryReasoning[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
