import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, AlertTriangle, TrendingDown, TrendingUp, Info, Save, Anchor, LineChart as LineChartIcon, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/Button';
import { useScenarioStore } from '@/store/scenarioStore';
import { cn } from '@/lib/utils';
import { VESSELS } from '@/data/mockData';

export function Analysis() {
  const navigate = useNavigate();
  const { scenarios, activeScenarioId } = useScenarioStore();
  
  const scenario = scenarios.find((s) => s.id === activeScenarioId);
  
  if (!scenario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold mb-4">No Active Scenario</h2>
        <p className="text-muted-foreground mb-6">Please create a new forecast to view analysis.</p>
        <Button onClick={() => navigate('/forecast/new')}>Create Forecast</Button>
      </div>
    );
  }

  // Generate some fake chart data around the forecast rate
  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const isForecast = i >= 20;
    const baseRate = scenario.forecastRate;
    const historicalVol = Math.random() * 2 - 1;
    const forecastVol = Math.random() * 1.5 - 0.75;
    
    return {
      day: i - 20,
      historical: isForecast ? null : baseRate + historicalVol - (20 - i) * 0.1,
      forecast: !isForecast ? null : i === 20 ? baseRate + historicalVol : baseRate + forecastVol,
      forecastLow: !isForecast ? null : baseRate - 1.5,
      forecastHigh: !isForecast ? null : baseRate + 1.5
    };
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      
      {/* Header Context */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground mb-2">
            <span>{scenario.origin}</span>
            <span className="w-4 h-[1px] bg-border"></span>
            <span>{scenario.destination}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Freight Intelligence Analysis</h1>
          <p className="text-muted-foreground mt-1">
            {scenario.quantity.toLocaleString()} MT of {scenario.cargo} · {scenario.contract} Contract
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button className="flex items-center">
            <Save className="w-4 h-4 mr-2" />
            Save Analysis
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
                    domain={['dataMin - 2', 'dataMax + 2']}
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
                <div className="text-xl font-bold">${(scenario.forecastRate + 0.3).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">7-Day Outlook</div>
                <div className={cn(
                  "text-xl font-bold flex items-center",
                  scenario.marketTiming === 'WAIT' ? "text-positive" : "text-accent"
                )}>
                  {scenario.marketTiming === 'WAIT' ? <TrendingDown className="w-5 h-5 mr-1" /> : <TrendingUp className="w-5 h-5 mr-1" />}
                  ${scenario.forecastRate.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Model Confidence</div>
                <div className="text-xl font-bold">{scenario.confidence}%</div>
              </div>
            </div>
          </section>

          {/* Vessel Matching */}
          <section className="border border-border bg-card p-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-6 flex items-center">
              <Anchor className="w-4 h-4 mr-2" /> Fleet Match Evaluation
            </h2>
            
            <div className="space-y-4">
              {VESSELS.map((vessel) => {
                const isRecommended = vessel.class === scenario.recommendedVessel;
                // Generate a score based on the recommendation (fake for demo)
                const score = isRecommended ? scenario.recommendationScore : vessel.score - Math.floor(Math.random() * 15);
                
                return (
                  <div 
                    key={vessel.class} 
                    className={cn(
                      "p-4 border transition-colors flex items-center justify-between",
                      isRecommended ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-bold text-lg mr-2">{vessel.class}</span>
                        {isRecommended && <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 uppercase tracking-widest font-bold">Recommended</span>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Typical Capacity: {vessel.capacity}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn("text-2xl font-bold", isRecommended ? "text-primary" : "text-muted-foreground")}>
                        {score}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Match Score</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 bg-secondary/50 p-4 border border-border text-sm">
              <h3 className="font-bold flex items-center mb-2">
                <Info className="w-4 h-4 mr-2 text-primary" /> Why {scenario.recommendedVessel}?
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 text-positive shrink-0 mt-0.5" /> Cargo volume closely matches representative capacity range.</li>
                <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 text-positive shrink-0 mt-0.5" /> Better estimated cost-per-tonne than alternatives.</li>
                <li className="flex items-start"><CheckCircle2 className="w-4 h-4 mr-2 text-positive shrink-0 mt-0.5" /> Destination port infrastructure supports the draft profile.</li>
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
                <h3 className="font-bold mb-4">{scenario.origin} (Origin)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Draft limit</span>
                      <span className="text-positive font-medium">Compatible</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-positive w-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cargo handling</span>
                      <span className="text-positive font-medium">Compatible</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-positive w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">{scenario.destination} (Destination)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Draft limit</span>
                      <span className={scenario.portCompatibility > 80 ? "text-positive font-medium" : "text-accent font-medium"}>
                        {scenario.portCompatibility > 80 ? 'Compatible' : 'Warning'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={cn("h-full", scenario.portCompatibility > 80 ? "bg-positive" : "bg-accent")} style={{ width: `${scenario.portCompatibility}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Berth capability</span>
                      <span className="text-positive font-medium">Compatible</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-positive w-[90%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                <div className="text-3xl font-bold">{scenario.recommendedVessel}</div>
              </div>

              <div className="pt-4 border-t border-primary-foreground/10">
                <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Market Action</div>
                <div className={cn(
                  "text-2xl font-bold inline-flex items-center px-3 py-1 bg-background",
                  scenario.marketTiming === 'WAIT' ? "text-accent" : 
                  scenario.marketTiming === 'ENTER NOW' ? "text-positive" : "text-intelligence"
                )}>
                  {scenario.marketTiming}
                </div>
                {scenario.marketTiming === 'WAIT' && (
                  <p className="text-sm mt-2 text-primary-foreground/90">
                    Freight rates are expected to soften over the next 5–7 days.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-primary-foreground/10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Est. Freight</div>
                  <div className="font-bold text-xl">${scenario.forecastRate.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Total Cost</div>
                  <div className="font-bold text-xl">${scenario.estimatedVoyageCost.toFixed(2)}M</div>
                </div>
              </div>

              <div className="pt-4 border-t border-primary-foreground/10 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Risk</div>
                  <div className="font-bold flex items-center">
                    {scenario.congestionRisk === 'Low' ? <ShieldCheck className="w-4 h-4 mr-1 text-positive" /> : <AlertTriangle className="w-4 h-4 mr-1 text-accent" />}
                    {scenario.congestionRisk}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/70 mb-1">Confidence</div>
                  <div className="font-bold">{scenario.confidence}%</div>
                </div>
              </div>

            </div>
            
            <div className="bg-primary-foreground/5 p-6 border-t border-primary-foreground/10 text-sm leading-relaxed">
              <strong>Summary:</strong> For {scenario.quantity.toLocaleString()} MT of {scenario.cargo.toLowerCase()} from {scenario.origin} to {scenario.destination}, the model currently favors <strong>{scenario.recommendedVessel}</strong>. 
              Port compatibility is strong ({scenario.portCompatibility}%), and congestion risk is {scenario.congestionRisk.toLowerCase()}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
