import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Anchor, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useScenarioStore } from '@/store/scenarioStore';
import { cn } from '@/lib/utils';
import type { VoyageScenario } from '@/data/mockData';

export function Dashboard() {
  const { scenarios, setActiveScenario } = useScenarioStore();
  const navigate = useNavigate();

  const handleOpenAnalysis = (id: string) => {
    setActiveScenario(id);
    navigate(`/analysis`);
  };

  const activeScenarios = scenarios.slice(0, 3);
  const avgForecast = scenarios.length > 0 
    ? (scenarios.reduce((acc: number, s: VoyageScenario) => acc + s.forecastRate, 0) / scenarios.length).toFixed(2)
    : "0.00";
    
  const highRiskCount = scenarios.filter((s: VoyageScenario) => s.congestionRisk === 'High').length;
  
  // Fake date calculation for "best market window"
  const getNextWeek = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const inTwoWeeks = new Date(today);
    inTwoWeeks.setDate(today.getDate() + 14);
    
    return `${nextWeek.getDate()}–${inTwoWeeks.getDate()} ${nextWeek.toLocaleString('default', { month: 'short' }).toUpperCase()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Dashboard</h1>
        <p className="text-xl text-muted-foreground">Good evening. Here's what you've been planning.</p>
      </header>

      {/* KPI Area */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 border border-border bg-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Active Scenarios</div>
          <div className="text-3xl font-bold">{scenarios.length < 10 ? `0${scenarios.length}` : scenarios.length}</div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Avg Forecast Freight</div>
          <div className="text-3xl font-bold">${avgForecast} <span className="text-sm font-normal text-muted-foreground">/ MT</span></div>
        </div>
        <div className="p-4 border border-border bg-card bg-secondary/50">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 text-positive" /> Best Market Window
          </div>
          <div className="text-2xl font-bold text-positive">{getNextWeek()}</div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Fleet Match Rate</div>
          <div className="text-3xl font-bold">94%</div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center">
             <AlertTriangle className={cn("w-3 h-3 mr-1", highRiskCount > 0 ? "text-accent" : "text-muted-foreground")} /> High-Risk Routes
          </div>
          <div className={cn("text-3xl font-bold", highRiskCount > 0 ? "text-accent" : "")}>
            {highRiskCount < 10 ? `0${highRiskCount}` : highRiskCount}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Forecasts</h2>
            <Link to="/history" className="text-sm font-medium hover:underline text-muted-foreground flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {activeScenarios.length > 0 ? (
            <div className="space-y-4">
              {activeScenarios.map((scenario: VoyageScenario) => (
                <div key={scenario.id} className="border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => handleOpenAnalysis(scenario.id)}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 text-lg font-medium">
                        <span>{scenario.origin}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span>{scenario.destination}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground flex items-center justify-end">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(scenario.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-border/50 my-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Cargo</div>
                        <div className="font-medium">{scenario.cargo}</div>
                        <div className="text-sm text-muted-foreground">{scenario.quantity.toLocaleString()} MT</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Vessel</div>
                        <div className="font-medium flex items-center">
                          <Anchor className="w-3 h-3 mr-1" /> {scenario.recommendedVessel}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Timing</div>
                        <div className={cn(
                          "font-bold text-sm",
                          scenario.marketTiming === 'WAIT' ? 'text-accent' : 
                          scenario.marketTiming === 'ENTER NOW' ? 'text-positive' : 'text-intelligence'
                        )}>
                          {scenario.marketTiming}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Risk</div>
                        <div className="font-medium flex items-center text-sm">
                          {scenario.congestionRisk === 'Low' ? <ShieldCheck className="w-3 h-3 mr-1 text-positive" /> : <AlertTriangle className="w-3 h-3 mr-1 text-accent" />}
                          {scenario.congestionRisk}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <span className="text-sm font-medium text-primary flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Open Analysis <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-secondary/20">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No voyage scenarios yet.</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Build your first freight scenario to start creating your planning history.
                </p>
                <Button onClick={() => navigate('/forecast/new')}>
                  Create Forecast
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {scenarios.length > 0 && (
            <div className="sticky top-8 space-y-6">
              <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border pb-2">Last Analysis</h2>
              
              <div className="border border-border bg-card">
                <div className="bg-primary text-primary-foreground p-6">
                  <div className="text-xs font-medium opacity-80 mb-1">Recommended Charter</div>
                  <div className="text-3xl font-bold tracking-tight uppercase mb-4">{scenarios[0].recommendedVessel}</div>
                  
                  <div className="flex items-center space-x-2 text-sm opacity-90 mb-2">
                    <span>{scenarios[0].origin}</span>
                    <span>→</span>
                    <span>{scenarios[0].destination}</span>
                  </div>
                  <div className="text-sm opacity-90">
                    {scenarios[0].quantity.toLocaleString()} MT · {scenarios[0].cargo}
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-end border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Market Action</div>
                    <div className={cn(
                      "font-bold text-lg",
                      scenarios[0].marketTiming === 'WAIT' ? 'text-accent' : 
                      scenarios[0].marketTiming === 'ENTER NOW' ? 'text-positive' : 'text-intelligence'
                    )}>
                      {scenarios[0].marketTiming}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Forecast Freight</div>
                    <div className="font-bold text-lg">${scenarios[0].forecastRate.toFixed(2)} / MT</div>
                  </div>
                  
                  <div className="flex justify-between items-end border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Est. Voyage Cost</div>
                    <div className="font-bold text-lg">${scenarios[0].estimatedVoyageCost.toFixed(3)}M</div>
                  </div>
                  
                  <div className="flex justify-between items-end border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Confidence</div>
                    <div className="font-bold text-lg">{scenarios[0].confidence}%</div>
                  </div>
                  
                  <div className="pt-2">
                    <Button className="w-full" onClick={() => handleOpenAnalysis(scenarios[0].id)}>
                      Open Full Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
