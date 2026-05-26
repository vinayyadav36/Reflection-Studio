import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TemplateSelection } from './components/TemplateSelection';
import { JournalingInterface } from './components/JournalingInterface';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="templates" element={<TemplateSelection />} />
          <Route path="journal/:templateId" element={<JournalingInterface />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
