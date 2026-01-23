import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import CreateBOM from './pages/CreateBOM';
import FacultyDashboard from './pages/FacultyDashboard';
import BOMManagement from './pages/BOMManagement';
import CreateTeam from './pages/CreateTeam';
import ViewTeams from './pages/ViewTeams';
import LabInchargeDashboard from './pages/LabInchargeDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Layout wrapper to conditionally show Navbar/Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentRoute = location.pathname.startsWith('/student');
  const isFacultyRoute = location.pathname.startsWith('/faculty');

  return (
    <>
      {!isAdminRoute && !isStudentRoute && !isFacultyRoute && <Navbar />}
      {children}
      {!isAdminRoute && !isStudentRoute && !isFacultyRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/create-bom"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CreateBOM />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty/bom-management"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <BOMManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty/create-team"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <CreateTeam />
                </ProtectedRoute>
              }
            />

            <Route
              path="/faculty/view-teams"
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <ViewTeams />
                </ProtectedRoute>
              }
            />

            <Route
              path="/labincharge/dashboard"
              element={
                <ProtectedRoute allowedRoles={['labincharge']}>
                  <LabInchargeDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
