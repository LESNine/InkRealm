import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ToastContainer from './components/Toast';
import HomePage from './pages/HomePage';
import OutlinePage from './pages/OutlinePage';
import ScenesPage from './pages/ScenesPage';
import SceneEditPage from './pages/SceneEditPage';
import DailyPage from './pages/DailyPage';
import KnowledgePage from './pages/KnowledgePage';
import AssemblePage from './pages/AssemblePage';
import SettingsPage from './pages/SettingsPage';
import AgentSettingsPage from './pages/AgentSettingsPage';
import WritingStylePage from './pages/WritingStylePage';

function App() {
  return (
    <HashRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="project/:projectId/outline" element={<OutlinePage />} />
          <Route path="project/:projectId/scenes" element={<ScenesPage />} />
          <Route path="project/:projectId/scene/:sceneId" element={<SceneEditPage />} />
          <Route path="project/:projectId/daily" element={<DailyPage />} />
          <Route path="project/:projectId/knowledge" element={<KnowledgePage />} />
          <Route path="project/:projectId/assemble" element={<AssemblePage />} />
          <Route path="settings/style" element={<WritingStylePage />} />
          <Route path="settings/api" element={<SettingsPage />} />
          <Route path="settings/agent" element={<AgentSettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
