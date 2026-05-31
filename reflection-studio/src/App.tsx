import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TemplateSelection } from './components/TemplateSelection';
import { JournalingInterface } from './components/JournalingInterface';
import { EntryDetail } from './components/EntryDetail';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="templates" element={<TemplateSelection />} />
          <Route path="journal/:templateId" element={<JournalingInterface />} />
          <Route path="journal/:templateId/:entryId" element={<JournalingInterface />} />
          <Route path="entry/:entryId" element={<EntryDetail />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
