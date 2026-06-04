import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyProfile from './pages/CompanyProfile';
import CreateDocument from './pages/CreateDocument';
import DocumentPreview from './pages/DocumentPreview';
import DocumentHistory from './pages/DocumentHistory';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import Clients from './pages/Clients';
import Catalog from './pages/Catalog';
import SharedDocumentView from './pages/SharedDocumentView';
import Team from './pages/Team';
import Documents from './pages/Documents';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#714B67]" /></div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#714B67]" /></div>;
  if (user) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: '13px' } }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shared/:token" element={<SharedDocumentView />} />

          {/* Auth */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* App */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<CompanyProfile />} />
            <Route path="documents/create" element={<CreateDocument />} />
            <Route path="documents/:id" element={<DocumentPreview />} />
            <Route path="documents/:id/history" element={<DocumentHistory />} />
            <Route path="documents" element={<Documents />} />
            <Route path="clients" element={<Clients />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="team" element={<Team />} />
          </Route>

          {/* Admin Console */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
