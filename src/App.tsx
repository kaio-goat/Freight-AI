
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { NewForecast } from './pages/NewForecast';
import { Analysis } from './pages/Analysis';
import { History } from './pages/History';

// Placeholder pages for routes not yet implemented
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-border bg-card p-12">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-muted-foreground">This feature is part of the extended prototype and will be available soon.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forecast/new" element={<NewForecast />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/fleet" element={<Placeholder title="Fleet Matching Intelligence" />} />
          <Route path="/routes" element={<Placeholder title="Global Route Intelligence" />} />
          <Route path="/market" element={<Placeholder title="Macro Market Intelligence" />} />
          <Route path="/data-sources" element={<Placeholder title="Data Source Transparency" />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
