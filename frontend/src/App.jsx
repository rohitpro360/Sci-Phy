import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Resources from './pages/Resources'
import Departments from './pages/Departments'
import Subjects from './pages/Subjects'
import TeacherDashboard from './pages/TeacherDashboard'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App