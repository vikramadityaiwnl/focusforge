import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home';
import { SessionPage } from './pages/session';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { initializeAIModels } from './states/models';

function App() {
  const { theme } = useTheme()

  useEffect(() => { initializeAIModels() }, [])

  return (
    <>
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:sessionId" element={<SessionPage />} />
      </Routes>

      <Toaster 
        position='top-right' 
        containerClassName='mt-14 text-sm' 
        toastOptions={{
          style: {
            background: theme === "dark" ? '#333' : '#fff',
            color: theme === "dark" ? '#fff' : '#333',
          },
        }}
      />
    </>
  )
}

export default App
