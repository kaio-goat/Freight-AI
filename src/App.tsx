import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { NewForecast } from './pages/NewForecast';
import { Analysis } from './pages/Analysis';
import { History } from './pages/History';
import { Fleet } from './pages/Fleet';
import { RoutesPage } from './pages/Routes';
import { MarketPage } from './pages/Market';
import { DataSourcesPage } from './pages/DataSources';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route element={<ErrorBoundary><Layout /></ErrorBoundary>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forecast/new" element={<NewForecast />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
