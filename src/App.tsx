import './App.css'
import LoginPage from './pages/Credential Pages/Login'
import { AuthProvider } from './AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Messages from './pages/Messages'
import ProtectedRoute from './ProtectedRoute'
import SignupPage from './pages/Credential Pages/Register'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<SignupPage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/messages" element={
            <ProtectedRoute><Messages /></ProtectedRoute>
          }></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
