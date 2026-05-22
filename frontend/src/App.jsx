import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Simulation from './pages/Simulation';
import Junctions from './pages/Junctions';
import Alerts from './pages/Alerts';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Routes>
      {/* Landing page — standalone, no sidebar */}
      <Route path="/" element={<LandingPage />} />

      {/* Dashboard routes — each wrapped in Layout with children */}
      <Route path="/overview"   element={<Layout><Overview /></Layout>} />
      <Route path="/simulation" element={<Layout><Simulation /></Layout>} />
      <Route path="/junctions"  element={<Layout><Junctions /></Layout>} />
      <Route path="/alerts"     element={<Layout><Alerts /></Layout>} />
    </Routes>
  );
}

export default App;