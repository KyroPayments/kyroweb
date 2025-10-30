import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert,
  Spinner,
  Badge,
  Table
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { walletAPI } from '../services/api';

const BalanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [balanceDetails, setBalanceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBalanceDetails();
  }, [id]);

  const fetchBalanceDetails = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getBalanceDetails(id);
      setBalanceDetails(response.data);
    } catch (err) {
      setError('Failed to load balance details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">Loading balance details...</p>
        </div>
      </Container>
    );
  }

  if (error && !balanceDetails) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/wallets')}>
          Back to Wallets
        </Button>
      </Container>
    );
  }

  if (!balanceDetails) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Balance details not found</Alert>
        <Button variant="primary" onClick={() => navigate('/wallets')}>
          Back to Wallets
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Wallet Balance Details</h2>
            <Button variant="secondary" onClick={() => navigate('/wallets')}>
              Back to Wallets
            </Button>
          </div>
        </Col>
      </Row>
      
      <Row>
        {/* Wallet Information Card */}
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h4>Wallet Information</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h5>Wallet: {balanceDetails.wallet_name}</h5>
              </div>
              
              <div className="mb-3">
                <p><strong>Wallet ID:</strong> {balanceDetails.wallet_id}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Address:</strong></p>
                <p className="text-break">{balanceDetails.wallet_address}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Total Token Types:</strong> {balanceDetails.total_tokens}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Last Updated:</strong> {new Date(balanceDetails.updated_at).toLocaleString()}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Balance Summary Card */}
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-success text-white">
              <h4>Balance Summary</h4>
            </Card.Header>
            <Card.Body>
              {balanceDetails.balances && balanceDetails.balances.length > 0 ? (
                <div>
                  {balanceDetails.balances.map((balance, index) => (
                    <div key={balance.token_id} className="mb-3">
                      <h5>
                        {balance.token_symbol} 
                        {balance.network_name && (
                          <span className="ms-2">
                            <Badge bg="info">{balance.network_name}</Badge>
                          </span>
                        )}
                      </h5>
                      <p className="mb-1">
                        <strong>Amount:</strong> {balance.total_amount} {balance.token_symbol}
                      </p>
                      <p className="mb-0 text-muted">
                        {balance.token_name} ({balance.token_symbol}) on {balance.network_name || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No confirmed payments found for this wallet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Detailed Balance Table */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <h4>Detailed Balance Information</h4>
            </Card.Header>
            <Card.Body>
              {balanceDetails.balances && balanceDetails.balances.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Token Name</th>
                      <th>Token Symbol</th>
                      <th>Network</th>
                      <th>Amount</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {balanceDetails.balances.map((balance, index) => (
                      <tr key={balance.token_id}>
                        <td>{balance.token_name}</td>
                        <td>{balance.token_symbol}</td>
                        <td>{balance.network_name || 'N/A'}</td>
                        <td>{balance.total_amount}</td>
                        
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No confirmed payments found for this wallet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BalanceDetails;