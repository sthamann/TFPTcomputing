import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import ConstantsPage from './pages/ConstantsPage'
import ConstantDetailPage from './pages/ConstantDetailPage'
import PlaygroundPage from './pages/PlaygroundPage'
import DAGPage from './pages/DAGPage'
import TestVisNetwork from './pages/TestVisNetwork'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      return stored === 'true'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
        <Routes>
          <Route path="/" element={<ConstantsPage />} />
          <Route path="/constants/:id" element={<ConstantDetailPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
          <Route path="/dag" element={<DAGPage />} />
          <Route path="/test-vis" element={<TestVisNetwork />} />
        </Routes>
      </Layout>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '',
          style: {
            background: darkMode ? 'hsl(217.2 32.6% 17.5%)' : 'white',
            color: darkMode ? 'hsl(210 40% 98%)' : 'hsl(222.2 84% 4.9%)',
            border: `1px solid ${darkMode ? 'hsl(217.2 32.6% 27.5%)' : 'hsl(214.3 31.8% 91.4%)'}`,
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App 