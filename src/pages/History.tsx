import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Trash2, Copy, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useScenarioStore } from '@/store/scenarioStore';
import { cn } from '@/lib/utils';
import type { VoyageScenario } from '@/data/mockData';

export function History() {
  const navigate = useNavigate();
  const { scenarios, setActiveScenario, deleteScenario, addScenario } = useScenarioStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScenarios = scenarios.filter((s: VoyageScenario) => 
    s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (id: string) => {
    setActiveScenario(id);
    navigate('/analysis');
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const scenario = scenarios.find((s: VoyageScenario) => s.id === id);
    if (scenario) {
      const duplicated: VoyageScenario = {
        ...scenario,
        id: `sc-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      addScenario(duplicated);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteScenario(id);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Forecast History</h1>
          <p className="text-muted-foreground mt-1">Review, compare, and manage your previous voyage scenarios.</p>
        </div>
        <div>
          <Button onClick={() => navigate('/forecast/new')}>Create New Forecast</Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by origin, destination, or cargo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="border border-border bg-card">
        {filteredScenarios.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredScenarios.map((scenario: VoyageScenario) => (
              <div 
                key={scenario.id} 
                onClick={() => handleOpen(scenario.id)}
                className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 text-lg font-bold">
                    <span>{scenario.origin}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span>{scenario.destination}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {scenario.quantity.toLocaleString()} MT · {scenario.cargo} · {scenario.contract}
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Vessel</div>
                    <div className="font-medium text-sm">{scenario.recommendedVessel}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Forecast Rate</div>
                    <div className="font-medium text-sm">${scenario.forecastRate.toFixed(2)} / MT</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Risk</div>
                    <div className={cn(
                      "font-medium text-sm",
                      scenario.congestionRisk === 'High' ? "text-accent" : 
                      scenario.congestionRisk === 'Low' ? "text-positive" : "text-foreground"
                    )}>
                      {scenario.congestionRisk}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-4 md:w-48">
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(scenario.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      title="Duplicate"
                      onClick={(e) => handleDuplicate(e, scenario.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                      onClick={(e) => handleDelete(e, scenario.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            No scenarios found.
          </div>
        )}
      </div>
    </div>
  );
}
