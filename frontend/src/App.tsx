import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Incidents from './pages/Incidents';
import Investigations from './pages/Investigations';
import InvestigationDetail from './pages/InvestigationDetail';
import Reporting from './pages/Reporting';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/investigations" element={<Investigations />} />
          <Route path="/investigations/:id" element={<InvestigationDetail />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/admin" element={<div>Admin Panel (Use Django Admin)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
