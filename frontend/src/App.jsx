import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import AddQuestion from './pages/Admin/AddQuestion';
import ManageQuestions from './pages/Admin/ManageQuestions';
import Practice from './pages/Practice';
import Dashboard from './pages/Dashboard';

function Home() {
  return (
    <div style={{ 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Hero Section */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: 'rgba(45, 212, 191, 0.1)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#2dd4bf',
          marginBottom: '2rem'
        }}>
          ✓ Built for ECE Aspirants
        </div>

        {/* Main Heading */}
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: '700',
          lineHeight: '1.1',
          marginBottom: '1.5rem',
          color: '#f3f4f6'
        }}>
          Engineer Your Success in{' '}
          <span style={{
            background: 'linear-gradient(135deg, #2dd4bf 0%, #4b8aaf 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            GATE ECE.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{ 
          fontSize: '1.125rem',
          color: '#9ca3af',
          marginBottom: '3rem',
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          A focused platform for Electronics & Communication Engineering aspirants to practice MCQs and monitor exam readiness.
        </p>

        {/* CTA Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link 
            to="/practice" 
            style={{
              padding: '1rem 2.5rem',
              background: '#2dd4bf',
              color: '#151a1d',
              borderRadius: '0.5rem',
              fontWeight: '700',
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(45, 212, 191, 0.3)',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#26bfaa';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 212, 191, 0.4)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#2dd4bf';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 212, 191, 0.3)';
            }}
          >
            Start Practicing
          </Link>
          <Link 
            to="/dashboard" 
            style={{
              padding: '1rem 2.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f3f4f6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ 
        padding: '4rem 2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Feature 1 */}
          <div style={{
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(75, 138, 175, 0.15)',
              border: '1px solid rgba(75, 138, 175, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              📚
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#f3f4f6',
              marginBottom: '0.75rem'
            }}>
              Subject Mastery
            </h3>
            <p style={{
              fontSize: '0.9375rem',
              color: '#9ca3af',
              lineHeight: '1.6'
            }}>
              Deep-dive into core ECE subjects. Access comprehensive question banks for Network Theory, Signals & Systems, Analog Electronics, and Electromagnetics.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(75, 138, 175, 0.15)',
              border: '1px solid rgba(75, 138, 175, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              📊
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#f3f4f6',
              marginBottom: '0.75rem'
            }}>
              Performance Insights
            </h3>
            <p style={{
              fontSize: '0.9375rem',
              color: '#9ca3af',
              lineHeight: '1.6'
            }}>
              Granular data visualization of your progress. Track accuracy by topic, maintain daily streaks, and compare your percentile with thousands of aspirants.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(75, 138, 175, 0.15)',
              border: '1px solid rgba(75, 138, 175, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              🎯
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#f3f4f6',
              marginBottom: '0.75rem'
            }}>
              Exam-Like Practice
            </h3>
            <p style={{
              fontSize: '0.9375rem',
              color: '#9ca3af',
              lineHeight: '1.6'
            }}>
              GATE CBT interface simulation. Practice with timed sessions, question palette navigation, and mark for review features to optimize your revision time.
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Credits */}
      <div style={{ 
        padding: '3rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: 'auto'
      }}>
        <p style={{
          fontSize: '1rem',
          color: '#9ca3af',
          marginBottom: '1.5rem',
          fontWeight: '500'
        }}>
          Designed & Developed completely by{' '}
          <span style={{ 
            color: '#2dd4bf', 
            fontWeight: '700',
            background: 'rgba(45, 212, 191, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid rgba(45, 212, 191, 0.2)'
          }}>
            Karan
          </span>
        </p>

        <div style={{ color: '#4b5563', fontSize: '0.8125rem' }}>
          <div>
            © 2026 Karan Kumar. All rights reserved.
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <button 
              onClick={() => {
                const pwd = prompt("Enter Admin Password:");
                if (pwd === import.meta.env.VITE_ADMIN_PASSWORD) {
                  sessionStorage.setItem('isAdmin', 'true');
                  window.location.href = '/admin/manage-questions';
                } else if (pwd) {
                  alert("Incorrect password");
                }
              }}
              style={{ 
                background: 'none',
                border: 'none',
                color: 'inherit',
                textDecoration: 'none',
                opacity: 0.5,
                transition: 'opacity 0.2s',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                padding: 0
              }}
              onMouseOver={e => e.currentTarget.style.opacity = 1}
              onMouseOut={e => e.currentTarget.style.opacity = 0.5}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  return isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
          <nav className="navbar">
            <div className="container navbar-inner">
              <Link to="/" className="logo-text" onClick={() => setIsMenuOpen(false)}>
                GATE<span className="logo-accent">.PRO</span>
              </Link>
              
              <button 
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                <Link to="/practice" className="nav-item" onClick={() => setIsMenuOpen(false)}>Practice</Link>
                <Link to="/dashboard" className="nav-item" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                {sessionStorage.getItem('isAdmin') === 'true' && (
                  <div className="nav-group-right">
                    <Link to="/admin/add-question" className="nav-link-add" onClick={() => setIsMenuOpen(false)}>Add</Link>
                    <Link to="/admin/manage-questions" className="nav-link-manage" onClick={() => setIsMenuOpen(false)}>Manage</Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route 
              path="/admin/add-question" 
              element={
                <ProtectedRoute>
                  <AddQuestion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-questions" 
              element={
                <ProtectedRoute>
                  <ManageQuestions />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
