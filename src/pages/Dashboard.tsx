import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Anchor, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useScenarioStore } from '@/store/scenarioStore';
import { cn } from '@/lib/utils';
import type { VoyageScenario } from '@/data/types';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatting';
import { BDI_FEATURES } from '@/services/bdiService';

export function Dashboard() {
  const { scenarios, setActiveScenario } = useScenarioStore();
  const navigate = useNavigate();

  const fullText = "Good evening. Here's what you've been planning.";
  const [greetingText, setGreetingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem('dashboard_greeting_animated');
    
    if (hasAnimated) {
      setGreetingText(fullText);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setGreetingText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        sessionStorage.setItem('dashboard_greeting_animated', 'true');
        setTimeout(() => setIsTyping(false), 1500); // Keep caret blinking briefly after completion
      }
    }, 45); // ~45ms per character typing speed

    return () => clearInterval(interval);
  }, []);

  const handleOpenAnalysis = (id: string) => {
    setActiveScenario(id);
    navigate(`/analysis`);
  };

  // Safe data extraction (Phase 0, Phase 5)
  const validScenarios = (scenarios || []).filter((s: VoyageScenario) => 
    s?.decisionResult?.forecast && 
    s?.decisionResult?.vessel?.recommendedVessel &&
    s?.decisionResult?.timing?.timing &&
    s?.decisionResult?.risk?.overallRisk &&
    s?.decisionResult?.port?.destination
  );
  const activeScenarios = validScenarios.slice(0, 3);
  const latestScenario = activeScenarios[0];
  
  const highRiskCount = validScenarios.filter((s: VoyageScenario) => s.decisionResult.port.destination.status !== 'COMPATIBLE' || s.decisionResult.risk.overallRisk === 'High').length;
  
  // Best Market Window derived from real model output (Phase 7)
  let bestMarketWindow = "—";
  if (latestScenario) {
    const timing = latestScenario.decisionResult.timing.timing;
    if (timing === 'ENTER NOW') bestMarketWindow = 'Enter now';
    else if (timing === 'WAIT') bestMarketWindow = 'Wait for forecast improvement';
    else bestMarketWindow = 'Monitor next forecast window';
  }

  // Actual Fleet Match Rate calculation (Phase 6)
  const fleetMatchRate = validScenarios.length > 0
    ? ((validScenarios.filter((s: VoyageScenario) => s.decisionResult.vessel.ranking[0]?.overallScore > 80).length / validScenarios.length) * 100).toFixed(0) + '%'
    : "—";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Dashboard</h1>
        <p className="text-xl text-muted-foreground min-h-[1.75rem] flex items-center">
          {greetingText}
          {isTyping && <span className="inline-block w-1.5 h-[1.1em] ml-1 bg-muted-foreground animate-pulse" />}
        </p>
      </header>

      {/* KPI Area */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 border border-border bg-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Active Scenarios</div>
          <div className="text-3xl font-bold">{validScenarios.length < 10 ? `0${validScenarios.length}` : validScenarios.length}</div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Baltic Dry Index</div>
          <div className="text-3xl font-bold">
            {BDI_FEATURES ? formatNumber(BDI_FEATURES.currentBdi) : "—"}
            {BDI_FEATURES && <span className="text-sm font-normal text-muted-foreground"> pts</span>}
          </div>
        </div>
        <div className="p-4 border border-border bg-card bg-secondary/50">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 text-positive" /> Best Market Window
          </div>
          <div className="text-xl font-bold text-positive leading-tight mt-1">{bestMarketWindow}</div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Fleet Match Rate</div>
          <div className="text-3xl font-bold">{fleetMatchRate}</div>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center">
             <AlertTriangle className={cn("w-3 h-3 mr-1", highRiskCount > 0 ? "text-accent" : "text-muted-foreground")} /> High-Risk Routes
          </div>
          <div className={cn("text-3xl font-bold", highRiskCount > 0 ? "text-accent" : "")}>
            {validScenarios.length === 0 ? "—" : (highRiskCount < 10 ? `0${highRiskCount}` : highRiskCount)}
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
              {activeScenarios.map((scenario: VoyageScenario) => {
                const { decisionResult } = scenario;
                return (
                  <div key={scenario.id} className="border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => handleOpenAnalysis(scenario.id)}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 text-lg font-medium flex-wrap gap-y-2">
                          <span>{scenario.originName}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span>{scenario.destinationName}</span>
                          {decisionResult.forecast.dataCoverage === 'exploratory' && (
                            <span className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] uppercase tracking-wider font-bold border border-warning/20">Exploratory</span>
                          )}
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
                          <div className="text-sm text-muted-foreground">{formatNumber(scenario.quantity)} MT</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Vessel</div>
                          <div className="font-medium flex items-center">
                            <Anchor className="w-3 h-3 mr-1" /> {decisionResult.vessel.recommendedVessel}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Timing</div>
                          <div className={cn(
                            "font-bold text-sm",
                            decisionResult.timing.timing === 'WAIT' ? 'text-accent' : 
                            decisionResult.timing.timing === 'ENTER NOW' ? 'text-positive' : 'text-intelligence'
                          )}>
                            {decisionResult.timing.timing}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Risk</div>
                          <div className="font-medium flex items-center text-sm">
                            {decisionResult.risk.overallRisk === 'Low' ? <ShieldCheck className="w-3 h-3 mr-1 text-positive" /> : <AlertTriangle className="w-3 h-3 mr-1 text-accent" />}
                            {decisionResult.risk.overallRisk}
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
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed bg-secondary/20">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No forecast scenarios yet.</h3>
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
          {latestScenario && (
            <div className="sticky top-8 space-y-6">
              <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border pb-2">Last Analysis</h2>
              
              <div className="border border-border bg-card">
                <div className="bg-primary text-primary-foreground p-6">
                  <div className="text-xs font-medium opacity-80 mb-1">Recommended Charter</div>
                  <div className="text-3xl font-bold tracking-tight uppercase mb-4">{latestScenario.decisionResult.vessel.recommendedVessel}</div>
                  
                  <div className="flex items-center space-x-2 text-sm opacity-90 mb-2">
                    <span>{latestScenario.originName}</span>
                    <span>→</span>
                    <span>{latestScenario.destinationName}</span>
                  </div>
                  <div className="text-sm opacity-90">
                    {formatNumber(latestScenario.quantity)} MT · {latestScenario.cargo}
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-end border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Market Action</div>
                    <div className={cn(
                      "font-bold text-lg",
                      latestScenario.decisionResult.timing.timing === 'WAIT' ? 'text-accent' : 
                      latestScenario.decisionResult.timing.timing === 'ENTER NOW' ? 'text-positive' : 'text-intelligence'
                    )}>
                      {latestScenario.decisionResult.timing.timing}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Forecast Freight</div>
                    <div className="font-bold text-lg">{formatCurrency(latestScenario.decisionResult.forecast.currentRate)} / MT</div>
                  </div>
                  
                  <div className="flex justify-between items-end border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Est. Voyage Cost</div>
                    <div className="font-bold text-lg">{formatCurrency(latestScenario.decisionResult.forecast.currentRate * latestScenario.quantity)}</div>
                  </div>
                  
                  <div className="flex justify-between items-end border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Confidence</div>
                    <div className="font-bold text-lg">{formatPercentage(latestScenario.decisionResult.forecast.confidence)}</div>
                  </div>
                  
                  <div className="pt-2">
                    <Button className="w-full" onClick={() => handleOpenAnalysis(latestScenario.id)}>
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
