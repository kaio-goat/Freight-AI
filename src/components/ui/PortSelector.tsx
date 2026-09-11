import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortData } from '@/data/types';

interface PortSelectorProps {
  label: string;
  ports: PortData[];
  selectedPortId: string | null;
  onSelect: (portId: string) => void;
  placeholder?: string;
}

export function PortSelector({ label, ports, selectedPortId, onSelect, placeholder = "Search port..." }: PortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedPort = ports.find(p => p.id === selectedPortId);

  // Filter ports
  const filteredPorts = ports.filter(p => {
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || 
           p.country.toLowerCase().includes(s) || 
           p.region.toLowerCase().includes(s);
  });

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full text-left px-4 py-3 border border-border bg-background flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
          isOpen ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50",
          !selectedPort && "text-muted-foreground"
        )}
      >
        <span className="truncate flex-1">
          {selectedPort ? (
            <span className="flex flex-col">
              <span className="font-bold text-foreground">{selectedPort.name}</span>
              <span className="text-xs text-muted-foreground">{selectedPort.country}</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        <MapPin className="w-4 h-4 ml-2 opacity-50 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full border border-primary/30 bg-card shadow-xl max-h-80 flex flex-col">
          <div className="p-2 border-b border-border bg-background sticky top-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                placeholder="Search by name, country, region..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {filteredPorts.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No ports found.
              </div>
            ) : (
              filteredPorts.map(port => (
                <button
                  key={port.id}
                  onClick={() => {
                    onSelect(port.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex flex-col transition-colors border border-transparent",
                    port.id === selectedPortId 
                      ? "bg-primary/10 border-primary/20" 
                      : "hover:bg-secondary/50"
                  )}
                >
                  <span className={cn("font-bold", port.id === selectedPortId ? "text-primary" : "text-foreground")}>
                    {port.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center justify-between mt-0.5">
                    <span>{port.country} {port.region !== port.country && `(${port.region})`}</span>
                    {port.dataConfidence === 'low' && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 ml-2">Exploratory</span>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
