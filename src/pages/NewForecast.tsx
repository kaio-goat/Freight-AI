import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, MapPin, Database, Anchor, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useScenarioStore } from '@/store/scenarioStore';
import type { CargoType, ContractDuration, VoyageScenario } from '@/data/types';
import { PORTS } from '@/data/ports';
import { runDecisionEngine } from '@/services/decisionEngine';
import { cn } from '@/lib/utils';

export function NewForecast() {
  const navigate = useNavigate();
  const { addScenario, setActiveScenario } = useScenarioStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [cargo, setCargo] = useState<CargoType>('Coking Coal');
  const [quantity, setQuantity] = useState<string>('70000');
  
  // Use IDs for operational selection
  const [originId, setOriginId] = useState<string>('port-australia-newcastle');
  const [destinationId, setDestinationId] = useState<string>('port-india-paradip');
  const [contract, setContract] = useState<ContractDuration>('Spot');

  const origins = PORTS.filter(p => p.region !== 'East Coast');
  const destinations = PORTS.filter(p => p.region === 'East Coast');
  const cargos: CargoType[] = ['Coking Coal', 'Thermal Coal', 'Iron Ore', 'Limestone', 'Other Bulk Cargo'];
  const contracts: ContractDuration[] = ['Spot', '1 month', '3 months', '6 months', '12 months'];

  const analysisSteps = [
    { label: "Reading cargo profile", icon: Database },
    { label: "Evaluating route", icon: MapPin },
    { label: "Checking vessel compatibility", icon: Ship },
    { label: "Analyzing freight market", icon: Activity },
    { label: "Evaluating congestion", icon: Anchor },
    { label: "Calculating vessel score", icon: CheckCircle2 },
    { label: "Generating recommendation", icon: CheckCircle2 }
  ];

  const handleRunAnalysis = () => {
    setError(null);
    const qty = parseInt(quantity.replace(/,/g, ''), 10);
    
    if (!qty || isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    
    if (!originId || !destinationId) {
      setError("Please select both origin and destination ports.");
      return;
    }

    setIsAnalyzing(true);
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < analysisSteps.length) {
        setAnalysisStep(currentStep);
      } else {
        clearInterval(interval);
        generateScenario(qty);
      }
    }, 800);
  };

  const generateScenario = (qty: number) => {
    try {
      // Run deterministic engine using IDs
      const decisionResult = runDecisionEngine(originId, destinationId, cargo, qty);
      
      const originPort = PORTS.find(p => p.id === originId);
      const destPort = PORTS.find(p => p.id === destinationId);
      
      const cleanOrigin = (originPort?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanDest = (destPort?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      const newScenario: VoyageScenario = {
        id: `sc-${Date.now()}`,
        createdAt: new Date().toISOString(),
        cargo,
        quantity: qty,
        originId,
        originName: originPort?.name || 'Unknown',
        destinationId,
        destinationName: destPort?.name || 'Unknown',
        routeId: `${cleanOrigin}-${cleanDest}`,
        contract,
        decisionResult
      };

      addScenario(newScenario);
      setActiveScenario(newScenario.id);
      navigate('/analysis');
    } catch (err: any) {
      console.error("Decision engine failed:", err);
      setError(err.message || "Failed to generate forecast. Please check inputs and try again.");
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="w-full space-y-6">
          <div className="flex items-center justify-center mb-12">
            <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center shadow-lg relative">
              <span className="font-bold text-2xl tracking-tighter">F//</span>
              <div className="absolute inset-0 border-2 border-primary animate-ping"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {analysisSteps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = index === analysisStep;
              const isCompleted = index < analysisStep;
              
              return (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-center space-x-4 p-4 border transition-all duration-500",
                    isActive ? "border-primary bg-primary/5 shadow-sm" : 
                    isCompleted ? "border-border bg-secondary/20" : "border-transparent opacity-30"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center",
                    isActive ? "text-primary" : 
                    isCompleted ? "text-positive" : "text-muted-foreground"
                  )}>
                    {isActive ? <Activity className="w-5 h-5 animate-pulse" /> : 
                     isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                     <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Step 0{index + 1}</div>
                    <div className={cn(
                      "font-medium",
                      isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}>{stepItem.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">Build a Voyage Scenario</h1>
        <p className="text-xl text-muted-foreground">Configure cargo and route to generate a freight forecast.</p>
      </header>
      
      {error && (
        <div className="mb-6 p-4 border border-accent bg-accent/10 text-accent font-medium flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          
          {/* Section 1: Cargo */}
          <div className="border border-border bg-card p-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-6 flex items-center">
              <Database className="w-4 h-4 mr-2" /> 01. Cargo Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Cargo Type</label>
                <div className="flex flex-wrap gap-2">
                  {cargos.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCargo(c)}
                      className={cn(
                        "px-4 py-2 border text-sm font-medium transition-colors",
                        cargo === c 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity (MT)</label>
                  <input 
                    type="text" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                    placeholder="e.g. 70,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contract Duration</label>
                  <select 
                    value={contract}
                    onChange={(e) => setContract(e.target.value as ContractDuration)}
                    className="w-full px-4 py-2 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {contracts.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Route */}
          <div className="border border-border bg-card p-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-6 flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> 02. Route
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium mb-4">Origin</label>
                <div className="space-y-2">
                  {origins.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setOriginId(o.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 border text-sm font-medium transition-colors flex items-center justify-between",
                        originId === o.id 
                          ? "bg-secondary text-secondary-foreground border-primary" 
                          : "bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {o.name}
                      {originId === o.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-4">Destination (East Coast)</label>
                <div className="space-y-2">
                  {destinations.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDestinationId(d.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 border text-sm font-medium transition-colors flex items-center justify-between",
                        destinationId === d.id 
                          ? "bg-secondary text-secondary-foreground border-primary" 
                          : "bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {d.name}
                      {destinationId === d.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button size="lg" className="w-full md:w-auto px-12" onClick={handleRunAnalysis}>
              Run Freight Analysis
            </Button>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="border border-border bg-card p-6 sticky top-8">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-4 border-b border-border pb-2">
              Scenario Summary
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Route</div>
                <div className="font-medium text-sm flex items-center space-x-2">
                  <span>{origins.find(o => o.id === originId)?.name}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{destinations.find(d => d.id === destinationId)?.name}</span>
                </div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Cargo</div>
                <div className="font-medium text-sm">{cargo}</div>
                <div className="text-xs text-muted-foreground mt-1">{parseInt(quantity.replace(/,/g, '') || '0').toLocaleString()} MT</div>
              </div>
              
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Contract</div>
                <div className="font-medium text-sm">{contract}</div>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground italic flex items-start">
                <Activity className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                <span>The AI will analyze market conditions, evaluate fleet compatibility, and calculate estimated freight for this route.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
