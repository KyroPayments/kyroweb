import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Button, Badge } from 'react-bootstrap';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { setUnauthorizedCallback } from './services/authHandler';
import Home from './components/Home';
import Payments from './components/Payments';
import Wallets from './components/Wallets';
import Transactions from './components/Transactions';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import ApiKeyManager from './components/ApiKeyManager';
import Pay from './components/Pay';
import PaymentConfirmation from './components/PaymentConfirmation';
import PaymentDetails from './components/PaymentDetails';
import BalanceDetails from './components/BalanceDetails';
import { useWorkspace } from './contexts/WorkspaceContext';
import { profileAPI } from './services/api';
import './App.css';

// Custom hook to get current location pathname
function useCurrentPath() {
  const location = useLocation();
  return location.pathname;
}

// Component to wrap the entire app with workspace logic
function AppContent() {
  const { token, login, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { loadProfile, currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const currentPath = useCurrentPath();

  // Handle unauthorized event (triggered by API interceptor)
  useEffect(() => {
    const handleUnauthorized = () => {
      logout(); // This will navigate to login
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Set up unauthorized callback for API errors
  useEffect(() => {
    setUnauthorizedCallback(() => {
      // This is now handled by the event listener
    });
  }, []);

  // Check if the current path is a public payment page
  const isPublicPaymentPage = currentPath.startsWith('/pay/') || currentPath.startsWith('/payment/confirmed/');

  useEffect(() => {
    // Check authentication status when component mounts
    setIsAuthenticated(!!token);

    // If authenticated, fetch user profile to load workspace
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      loadProfile(response.data.user);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      // If profile fetch fails, still set as authenticated but with default workspace
      loadProfile({ workspace: 'testnet' });
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Render navigation bar only for non-public payment pages */}
      {!isPublicPaymentPage && (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand as={Link} to="/">Kyro</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                
                {isAuthenticated && (
                  <>
                    <Nav.Link as={Link} to="/payments">Payments</Nav.Link>
                    <Nav.Link as={Link} to="/wallets">Wallets</Nav.Link>
                    
                    <Nav.Link as={Link} to="/api-keys">API Keys</Nav.Link>
                    <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                  </>
                )}
              </Nav>
              
              <Nav>
                {/* Show workspace indicator in navbar for authenticated users */}
                {isAuthenticated && (
                  <Nav.Item className="d-flex align-items-center me-3">
                    <Badge 
                      bg={currentWorkspace === 'testnet' ? 'warning' : 'success'}
                      text={currentWorkspace === 'testnet' ? 'dark' : 'light'}
                    >
                      {currentWorkspace.toUpperCase()}
                    </Badge>
                  </Nav.Item>
                )}
                
                {!isAuthenticated ? (
                  <>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                  </>
                ) : (
                  <Button variant="outline-light" onClick={handleLogout}>
                    Logout
                  </Button>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/api-keys" element={<ApiKeyManager />} />
          <Route path="/pay/:id" element={<Pay />} />
          <Route path="/payment/confirmed/:id" element={<PaymentConfirmation />} />
          <Route path="/payment/:id" element={<PaymentDetails />} />
          <Route path="/wallet/:id/balance-details" element={<BalanceDetails />} />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;