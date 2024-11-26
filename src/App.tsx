import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home';
import { SessionPage } from './pages/session';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:sessionId" element={<SessionPage />} />
    </Routes>
  )
}

export default App
