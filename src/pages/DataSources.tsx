import { Globe, Database, History, ShieldAlert, Cpu } from 'lucide-react';

export function DataSourcesPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <header className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <Database className="w-8 h-8 mr-3 text-muted-foreground opacity-50" />
          Data Transparency & Methodology
        </h1>
        <p className="text-muted-foreground mt-2">
          Understanding the data lineage, models, and assumptions powering FREIGHT//IQ.
        </p>
      </header>

      <div className="bg-secondary/10 border border-border p-6 text-sm text-muted-foreground leading-relaxed">
        <strong>SIH26006 Note:</strong> FREIGHT//IQ is designed as an intelligent prototype for Maritime Procurement. 
        Because live commercial charter rates and live vessel AIS positions are proprietary and highly expensive, 
        this application relies on robust deterministic modeling, historical references, and synthetically derived baseline 
        data to demonstrate the AI reasoning pipeline. We clearly label our data sources to maintain absolute transparency.
      </div>

      <div className="space-y-6">
        
        {/* Route & Port Data */}
        <div className="border border-border bg-card p-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <Globe className="w-5 h-5 mr-2 text-primary" />
            Route & Port Infrastructure
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="block mb-1 text-foreground">Source Type:</strong>
              <span className="text-positive font-medium">Reference Data</span>
            </div>
            <div>
              <strong className="block mb-1 text-foreground">Description:</strong>
              <span className="text-muted-foreground">
                Port coordinates, maximum drafts, and LOA (Length Overall) limits are sourced from public maritime infrastructure references. 
                Distances between ports (in Nautical Miles) are calculated using standardized shipping lane approximations.
              </span>
            </div>
          </div>
        </div>

        {/* Vessel Specifications */}
        <div className="border border-border bg-card p-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <ShieldAlert className="w-5 h-5 mr-2 text-primary" />
            Vessel Specifications
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="block mb-1 text-foreground">Source Type:</strong>
              <span className="text-positive font-medium">Reference Data</span>
            </div>
            <div>
              <strong className="block mb-1 text-foreground">Description:</strong>
              <span className="text-muted-foreground">
                Standard vessel class dimensions (Handysize, Supramax, Panamax, Capesize) utilize average global fleet physical constraints (Draft, LOA, DWT) to evaluate port compatibility deterministically.
              </span>
            </div>
          </div>
        </div>

        {/* Freight Rates */}
        <div className="border border-border bg-card p-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <History className="w-5 h-5 mr-2 text-primary" />
            Freight Forecasts & Pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="block mb-1 text-foreground">Source Type:</strong>
              <span className="text-warning font-medium">Model-Derived / Synthetic</span>
            </div>
            <div>
              <strong className="block mb-1 text-foreground">Description:</strong>
              <span className="text-muted-foreground">
                Freight rates are generated deterministically based on route distance, bunker cost baselines, vessel economies of scale, and fixed geographic multipliers. 
                The predictive trends utilize a modeled trajectory based on these fixed seeds rather than a live pricing API.
              </span>
            </div>
          </div>
        </div>

        {/* Intelligence Engine */}
        <div className="border border-border bg-card p-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <Cpu className="w-5 h-5 mr-2 text-primary" />
            Decision Intelligence & Market Timing
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="block mb-1 text-foreground">Source Type:</strong>
              <span className="text-accent font-medium">Deterministic Algorithms</span>
            </div>
            <div>
              <strong className="block mb-1 text-foreground">Description:</strong>
              <span className="text-muted-foreground">
                Market entry recommendations (ENTER/WAIT) and risk scores are calculated using deterministic rule-based algorithms evaluating the interplay between the modeled forecast trajectory, port constraints, and simulated vessel supply.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
