import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AddQuestion from './pages/Admin/AddQuestion';
import ManageQuestions from './pages/Admin/ManageQuestions';
import Practice from './pages/Practice';
import Dashboard from './pages/Dashboard';

function Home() {
  return (
    <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        GATE ECE Tracker
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem' }}>
        Master concepts with previous year questions and track your progress.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Link to="/practice" className="btn btn-primary">
          Start Practicing
        </Link>
        <Link to="/dashboard" className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          View Dashboard
        </Link>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/admin/manage-questions" style={{ color: '#ef4444', fontSize: '0.9rem', textDecoration: 'underline' }}>
          Admin: Manage Questions
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
          <nav style={{ borderBottom: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div className="container" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to="/" style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                GATE<span style={{ color: 'var(--accent-primary)' }}>.PRO</span>
              </Link>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/practice" style={{ color: 'var(--text-secondary)' }}>Practice</Link>
                <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
                <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                  <Link to="/admin/add-question" style={{ color: 'var(--accent-primary)' }}>Add</Link>
                  <Link to="/admin/manage-questions" style={{ color: '#ef4444' }}>Manage</Link>
                </div>
              </div>
            </div>
          </nav>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/add-question" element={<AddQuestion />} />
            <Route path="/admin/manage-questions" element={<ManageQuestions />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
