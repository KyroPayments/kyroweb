import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert,
  Spinner,
  Form,
  InputGroup
} from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const Pay = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentPublic(id);
      setPayment(response.data.payment);
    } catch (err) {
      setError('Failed to load payment details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!walletAddress.trim() || !txHash.trim()) {
      setError('Please fill in both wallet address and transaction hash');
      return;
    }

    try {
      setProcessing(true);
      // Call the public confirm payment API with verification data
      await paymentAPI.confirmPaymentPublic(id, {
        walletAddress,
        txHash
      });
      setSuccess('Payment confirmed successfully!');
    } catch (err) {
      setError('Failed to confirm payment: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">Loading payment details...</p>
        </div>
      </Container>
    );
  }

  if (error && !payment) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        {/* Payment Details - Left Panel */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4>Payment Details</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h5>Amount: {payment.amount} {payment.currency}</h5>
                <p className="text-muted">({payment.crypto_token ? payment.crypto_token.name : 'N/A'})</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Description:</strong> {payment.description || 'No description'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Network:</strong> {payment.blockchain_network ? payment.blockchain_network.name : 'N/A'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Wallet:</strong> {payment.wallet ? payment.wallet.name : 'N/A'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Status:</strong>
                  <span className={`badge ms-2 ${
                    payment.status === 'completed' ? 'bg-success' :
                    payment.status === 'pending' ? 'bg-warning' :
                    payment.status === 'cancelled' ? 'bg-secondary' : 'bg-danger'
                  }`}>
                    {payment.status}
                  </span>
                </p>
              </div>
              
              <div className="mb-3">
                <p><strong>Created:</strong> {new Date(payment.created_at).toLocaleString()}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Expires:</strong> {payment.expires_at ? new Date(payment.expires_at).toLocaleString() : 'Never'}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Payment Form - Right Panel */}
        <Col md={6}>
          {payment.status === 'pending' ? (
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <h4>Complete Payment</h4>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <div className="mb-3">
                  <p>You are about to make a payment of <strong>{payment.amount} {payment.currency}</strong> on the <strong>{payment.blockchain_network ? payment.blockchain_network.name : 'N/A'}</strong> network.</p>
                </div>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Your Wallet Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your wallet address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      disabled={processing}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Transaction Hash</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter transaction hash"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      disabled={processing}
                    />
                    <Form.Text className="text-muted">
                      Transaction hash from the blockchain network
                    </Form.Text>
                  </Form.Group>
                  
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100"
                    onClick={handleConfirmPayment}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      'Confirm Payment'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <Card.Header className={`text-white ${
                payment.status === 'completed' ? 'bg-success' : 'bg-secondary'
              }`}>
                <h4>Payment Status</h4>
              </Card.Header>
              <Card.Body>
                <p className="lead">
                  This payment is <strong>{payment.status}</strong>.
                </p>
                {payment.status === 'completed' && (
                  <Alert variant="success">
                    This payment has already been completed.
                  </Alert>
                )}
                {payment.status === 'cancelled' && (
                  <Alert variant="warning">
                    This payment has been cancelled and cannot be processed.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Pay;