import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Home = () => {
  return (
    <div>
      <header className="App-header">
        <h1>Welcome to KyroWeb</h1>
        <p>Your crypto payment platform dashboard</p>
      </header>

      <Container className="my-5">
        <Row>
          <Col md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Payments</Card.Title>
                <Card.Text>
                  Process and manage cryptocurrency payments for your business.
                </Card.Text>
                <Button variant="primary" href="/payments">
                  Manage Payments
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Wallets</Card.Title>
                <Card.Text>
                  Create and manage cryptocurrency wallets for transactions.
                </Card.Text>
                <Button variant="primary" href="/wallets">
                  Manage Wallets
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Transactions</Card.Title>
                <Card.Text>
                  Track and monitor your cryptocurrency transactions.
                </Card.Text>
                <Button variant="primary" href="/transactions">
                  View Transactions
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <h2>How Kyro Works</h2>
            <p>
              Kyro is a crypto payment platform that allows businesses to accept cryptocurrency payments
              easily and securely. Our platform provides all the tools you need to integrate crypto
              payments into your business.
            </p>
            
            <h3>Key Features:</h3>
            <ul className="text-start">
              <li>Multiple cryptocurrency support (ETH, BTC, USDT, and more)</li>
              <li>Real-time transaction monitoring</li>
              <li>Secure wallet management</li>
              <li>Easy integration with existing systems</li>
              <li>Comprehensive API for developers</li>
            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;