import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, AlertTriangle, ShieldCheck, CheckCircle2, MapPin, Navigation, Info, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useScenarioStore } from '@/store/scenarioStore';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils/formatting';
import { VESSEL_CLASSES } from '@/data/vessels';
import { getRoute } from '@/data/routes';
import type { VoyageScenario } from '@/data/types';

export function Fleet() {
  const navigate = useNavigate();
  const { scenarios, activeScenarioId } = useScenarioStore();
  
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  
  const scenario = scenarios.find((s: VoyageScenario) => s.id === activeScenarioId);
  
  // Strict check for valid decision data
  const isValid = scenario && 
    scenario.decisionResult && 
    scenario.decisionResult.forecast &&
    scenario.decisionResult.vessel &&
    scenario.decisionResult.vessel.ranking &&
    scenario.decisionResult.port &&
    scenario.decisionResult.timing &&
    scenario.decisionResult.risk;

  useEffect(() => {
    if (isValid && !selectedVesselId) {
      setSelectedVesselId(scenario.decisionResult.vessel.recommendedVessel);
    }
  }, [isValid, scenario, selectedVesselId]);

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-border bg-card p-12 max-w-2xl mx-auto mt-12">
        <Anchor className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-4">No active forecast</h2>
        <p className="text-muted-foreground mb-6">Create a forecast to generate fleet matching intelligence.</p>
        <Button onClick={() => navigate('/forecast/new')}>Create Forecast</Button>
      </div>
    );
  }

  const { decisionResult } = scenario;
  const { vessel, forecast, port, risk } = decisionResult;
  
  const route = getRoute(scenario.originName, scenario.destinationName);
  
  // Find currently selected vessel's score details
  const selectedScore = vessel.ranking.find(r => r.vesselId === selectedVesselId) || vessel.ranking[0];
  const selectedVesselDef = VESSEL_CLASSES.find(v => v.name === selectedScore.vesselId);

  // Score Bar Component
  const ScoreBar = ({ label, score, colorClass }: { label: string, score: number, colorClass?: string }) => {
    return (
      <div className="mb-4">
        <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground mb-1">
          <span>{label}</span>
          <span className="font-bold text-foreground">{score}</span>
        </div>
        <div className="h-1.5 w-full bg-secondary overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500", colorClass || "bg-primary")} 
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Fleet Matching Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            {formatNumber(scenario.quantity)} MT of {scenario.cargo} · {scenario.contract} Contract
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/analysis')}>
            View Market Analysis
          </Button>
        </div>
      </header>

      {/* Primary Recommendation Banner */}
      <div className="border border-primary bg-primary text-primary-foreground p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-primary-foreground/70 font-bold mb-1">Recommended Charter</div>
          <div className="text-4xl font-bold tracking-tight uppercase flex items-center">
            <Anchor className="w-8 h-8 mr-3 opacity-90" />
            {vessel.recommendedVessel}
          </div>
        </div>
        <div className="md:w-1/2 bg-background/10 p-4 border border-primary-foreground/10 text-sm leading-relaxed">
          <strong>Why this vessel?</strong> {decisionResult.summaryReasoning[0]}
        </div>
        <div className="text-right shrink-0">
          <div className="text-4xl font-bold">{vessel.ranking[0].overallScore}</div>
          <div className="text-[10px] uppercase tracking-widest text-primary-foreground/70">Match Score</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Vessel Comparison */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold flex items-center border-b border-border pb-2">
            <Navigation className="w-4 h-4 mr-2" /> Fleet Comparison
          </h2>
          
          <div className="space-y-4">
            {vessel.ranking.map((match) => {
              const isSelected = match.vesselId === selectedVesselId;
              const isRecommended = match.vesselId === vessel.recommendedVessel;
              const isIncompatible = match.overallScore === 0 || match.portCompatibility === 0;
              const vDef = VESSEL_CLASSES.find(v => v.name === match.vesselId);
              
              return (
                <div 
                  key={match.vesselId} 
                  onClick={() => setSelectedVesselId(match.vesselId)}
                  className={cn(
                    "border transition-all cursor-pointer grid grid-cols-1 md:grid-cols-6 items-center p-4 gap-4",
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/40",
                    isIncompatible ? "opacity-60 grayscale" : ""
                  )}
                >
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <span className="font-bold text-lg mr-2">{match.vesselId}</span>
                      {isRecommended && <span className="bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 uppercase tracking-widest font-bold">Best</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatNumber(vDef?.minCapacity || 0)} - {formatNumber(vDef?.maxCapacity || 0)} MT
                    </div>
                  </div>
                  
                  {isIncompatible ? (
                    <div className="md:col-span-3 flex items-center text-accent font-bold text-sm tracking-wide">
                      <AlertTriangle className="w-4 h-4 mr-2" /> INCOMPATIBLE
                    </div>
                  ) : (
                    <div className="md:col-span-3 grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <div className="text-muted-foreground mb-1">Cargo</div>
                        <div className="font-bold text-foreground">{match.cargoFit}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Port</div>
                        <div className={cn("font-bold", match.portCompatibility < 50 ? "text-accent" : "text-foreground")}>
                          {match.portCompatibility}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Cost</div>
                        <div className="font-bold text-foreground">{match.costEfficiency}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Risk</div>
                        <div className="font-bold text-foreground">{match.risk}</div>
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <div className={cn(
                      "text-2xl font-bold",
                      isIncompatible ? "text-accent" : (isSelected ? "text-primary" : "text-foreground")
                    )}>
                      {match.overallScore}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-secondary/50 p-4 border border-border text-sm flex items-start text-muted-foreground">
            <Info className="w-4 h-4 mr-3 shrink-0 mt-0.5 text-primary" />
            <div>
              <strong className="text-foreground">Scoring Methodology:</strong> The intelligence engine weights matching based on Cargo Fit (30%), Port Compatibility (25%), Cost Efficiency (20%), Risk Suitability (15%), and Flexibility (10%). Hard physical constraints result in an automatic score of 0.
            </div>
          </div>
        </div>

        {/* Right Column: Deep Dive */}
        <div className="space-y-6">
          <div className="border border-border bg-card sticky top-8">
            <div className="p-6 border-b border-border bg-secondary/20">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Detailed Intelligence</div>
              <h2 className="text-2xl font-bold tracking-tight">{selectedVesselId}</h2>
              {selectedScore.overallScore === 0 && (
                 <div className="inline-flex items-center mt-2 px-2 py-1 bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                   Incompatible
                 </div>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Score Breakdowns */}
              <div>
                <ScoreBar 
                  label="Cargo Fit" 
                  score={selectedScore.cargoFit} 
                  colorClass={selectedScore.cargoFit < 50 ? "bg-warning" : "bg-primary"} 
                />
                <ScoreBar 
                  label="Port Compatibility" 
                  score={selectedScore.portCompatibility} 
                  colorClass={selectedScore.portCompatibility === 0 ? "bg-accent" : (selectedScore.portCompatibility < 80 ? "bg-warning" : "bg-primary")} 
                />
                <ScoreBar 
                  label="Cost Efficiency" 
                  score={selectedScore.costEfficiency} 
                />
                <ScoreBar 
                  label="Risk Suitability" 
                  score={selectedScore.risk} 
                  colorClass={selectedScore.risk < 70 ? "bg-warning" : "bg-primary"}
                />
                <ScoreBar 
                  label="Flexibility" 
                  score={selectedScore.flexibility} 
                  colorClass="bg-muted-foreground"
                />
              </div>

              {/* Engine Explanations (Targeted at selected vessel) */}
              {selectedVesselId === vessel.recommendedVessel && (
                <div className="bg-positive/10 border border-positive/20 p-4 text-sm">
                  <ul className="space-y-2 text-foreground">
                    {vessel.explanation.map((reason, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-positive shrink-0 mt-0.5" /> 
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedScore.portCompatibility === 0 && (
                <div className="bg-accent/10 border border-accent/20 p-4 text-sm flex items-start text-accent">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> 
                  <div>
                    <strong>Rejected:</strong> This vessel class exceeds the physical or operational constraints of the requested ports.
                  </div>
                </div>
              )}

              {/* Route & Constraints Context */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4">Voyage Context</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-muted-foreground mb-1">Route</div>
                    <div className="font-bold flex items-center">
                      {route ? (
                        <>{formatNumber(route.distanceNM)} <span className="text-xs text-muted-foreground ml-1">NM</span></>
                      ) : "Data unavailable"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Duration</div>
                    <div className="font-bold flex items-center">
                      {route ? (
                        <>~{route.typicalDays} <span className="text-xs text-muted-foreground ml-1">Days</span></>
                      ) : "Data unavailable"}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground flex items-center"><MapPin className="w-3 h-3 mr-1" /> Dest. Port Draft</span>
                    <span className="font-medium">{port.destination.status === 'INCOMPATIBLE' && selectedScore.portCompatibility === 0 ? <span className="text-accent">{port.destination.warnings[0] || 'Exceeded'}</span> : 'Compatible'}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground flex items-center"><DollarSign className="w-3 h-3 mr-1" /> Est. Voyage Cost</span>
                    <span className="font-medium">
                      {/* Show theoretical cost scaled by cost index if not the primary, else actual */}
                      {selectedVesselId === vessel.recommendedVessel 
                        ? formatCurrency(forecast.currentRate * scenario.quantity)
                        : formatCurrency((forecast.currentRate * (selectedVesselDef?.costIndex || 1)) * scenario.quantity)}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Route Risk</span>
                    <span className={cn(
                      "font-medium",
                      risk.overallRisk === 'High' ? "text-accent" : (risk.overallRisk === 'Moderate' ? "text-warning" : "text-positive")
                    )}>
                      {risk.overallRisk}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 text-xs text-muted-foreground italic text-center">
                  * Estimated cost uses synthetic reference coefficients based on {formatCurrency(forecast.currentRate)} / MT baseline.
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
