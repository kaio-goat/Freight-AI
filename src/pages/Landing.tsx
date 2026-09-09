
import { Link } from 'react-router-dom';
import { Anchor, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background illustrative elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Abstract map/route animation (simplified for prototype) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none hidden md:block">
        <svg viewBox="0 0 800 400" className="w-full h-full">
          <path d="M100,300 Q400,100 700,200" fill="none" stroke="hsl(var(--maritime))" strokeWidth="2" strokeDasharray="10 5" className="animate-[dash_20s_linear_infinite]" />
          <circle cx="100" cy="300" r="6" fill="hsl(var(--primary))" />
          <circle cx="700" cy="200" r="6" fill="hsl(var(--accent))" />
          
          <path d="M150,350 Q500,300 750,250" fill="none" stroke="hsl(var(--intelligence))" strokeWidth="1" strokeDasharray="5 5" opacity="0.5" />
          <circle cx="150" cy="350" r="4" fill="currentColor" />
          <circle cx="750" cy="250" r="4" fill="currentColor" />
        </svg>
      </div>

      <div className="z-10 text-center max-w-3xl px-6">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <span className="font-bold text-2xl tracking-tighter">F//</span>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-6 leading-tight">
          Turn freight uncertainty into a charter decision.
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          AI-assisted freight forecasting and vessel intelligence for bulk cargo procurement across global origins and India's East Coast.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/forecast/new">
            <Button size="lg" className="text-lg px-8 py-6 h-auto">
              Start a Forecast
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
              Explore Demo
            </Button>
          </Link>
        </div>
        
        <div className="mt-24 pt-8 border-t border-border flex flex-wrap justify-center gap-8 text-sm text-muted-foreground uppercase tracking-widest font-medium">
          <span className="flex items-center"><Anchor className="w-4 h-4 mr-2" /> Australia</span>
          <span className="flex items-center"><Anchor className="w-4 h-4 mr-2" /> Mozambique</span>
          <span className="flex items-center"><Anchor className="w-4 h-4 mr-2" /> Indonesia</span>
          <span className="flex items-center"><Anchor className="w-4 h-4 mr-2" /> USA</span>
          <span className="flex items-center"><Anchor className="w-4 h-4 mr-2" /> Russia</span>
        </div>
      </div>
      
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>
    </div>
  );
}
