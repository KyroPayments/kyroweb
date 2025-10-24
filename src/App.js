import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Payments from './components/Payments';
import Wallets from './components/Wallets';
import Transactions from './components/Transactions';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import ApiKeyManager from './components/ApiKeyManager';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status when component mounts
    const token = localStorage.getItem('kyro_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kyro_token');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">KyroWeb</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              
              {isAuthenticated && (
                <>
                  <Nav.Link as={Link} to="/payments">Payments</Nav.Link>
                  <Nav.Link as={Link} to="/wallets">Wallets</Nav.Link>
                  <Nav.Link as={Link} to="/transactions">Transactions</Nav.Link>
                  <Nav.Link as={Link} to="/api-keys">API Keys</Nav.Link>
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                </>
              )}
            </Nav>
            
            <Nav>
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
        </Routes>
      </Container>
    </div>
  );
}

export default App;