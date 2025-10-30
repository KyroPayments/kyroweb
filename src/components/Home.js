import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { token } = useAuth();
  const isAuthenticated = !!token;

  return (
    <div>
      <header className="App-header">
        <h1>Welcome to Kyro</h1>
        <p>Your crypto payment platform dashboard</p>
      </header>

      <Container className="my-5">
      <Row className="mt-5">
          <Col>
            <h2>How Kyro Works</h2>
            <p>
              Kyro is a comprehensive crypto payment platform that allows businesses to accept cryptocurrency payments
              easily and securely. Our platform provides all the tools you need to integrate crypto
              payments into your business with minimal setup and maximum security. Whether you're an e-commerce store, 
              service provider, or any business looking to expand payment options, Kyro makes it simple to accept payments in multiple cryptocurrencies.
            </p>
            
            <h3>Key Features:</h3>
            <Row>
              <Col md={6}>
                <ul className="text-start">
                  <li>Multiple cryptocurrency support (now BTC, MUSD in Mezo network)</li>
                  <li>User experience friendly to make payments</li>
                  <li>Real-time transaction monitoring and confirmations</li>
                  <li>Easy integration with existing systems via REST API</li>
                </ul>
              </Col>
              <Col md={6}>
                <ul className="text-start">
                  <li>Comprehensive payment tracking and analytics</li>
                  <li>Webhook notifications for payment events</li>
                  <li>Advanced security with encryption and authentication</li>
                  <li>Detailed transaction history and reporting</li>
                </ul>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Payments</Card.Title>
                <Card.Text>
                  Process and manage cryptocurrency payments for your business. Create secure payment requests, 
                  track payment status in real-time, and receive instant notifications when payments are confirmed. 
                  Our system supports multiple cryptocurrencies and provides detailed analytics on your payment flows.
                </Card.Text>
                {isAuthenticated && (
                  <Button variant="primary" href="/payments">
                    Manage Payments
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Wallets</Card.Title>
                <Card.Text>
                  Create and manage cryptocurrency wallets for transactions. Connect your wallets to your account, 
                  monitor balances, and perform deposits and withdrawals. 
                </Card.Text>
                {isAuthenticated && (
                  <Button variant="primary" href="/wallets">
                    Manage Wallets
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        

        <Row className="mt-5">
          <Col>
            <h2>Why Choose Kyro?</h2>
            <p>
              Kyro is designed for businesses that want to seamlessly integrate cryptocurrency payments into their operations. 
              Our platform provides enterprise-grade security, developer-friendly APIs, and an intuitive user interface that makes 
              cryptocurrency transactions straightforward for both merchants and customers. With Kyro, you can expand your customer base, 
              reduce transaction fees, and offer modern payment options that meet the evolving needs of the digital economy.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;