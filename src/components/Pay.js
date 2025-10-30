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
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';

// Helper function to calculate remaining time until expiration
const calculateTimeRemaining = (expiresAt) => {
  if (!expiresAt) return null;
  
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  const diffMs = expirationDate - now;
  
  if (diffMs <= 0) {
    return { timeRemaining: 'Expired', unit: '' };
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return { 
      timeRemaining: diffDays, 
      unit: diffDays === 1 ? 'day' : 'days',
      isExpired: false 
    };
  } else {
    return { 
      timeRemaining: diffHours, 
      unit: diffHours === 1 ? 'hour' : 'hours',
      isExpired: false 
    };
  }
};

const Pay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [payerInfo, setPayerInfo] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentPublic(id);
      setPayment(response.data.payment);
      
      // If payment is already confirmed, redirect to confirmation page
      if (response.data.payment.status === 'confirmed') {
        navigate(`/payment/confirmed/${id}`);
      }
    } catch (err) {
      setError('Failed to load payment details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!walletAddress.trim() || !txHash.trim() || !payerInfo.firstname.trim() || !payerInfo.lastname.trim() || !payerInfo.email.trim() || !payerInfo.phone.trim() || !payerInfo.address.trim() || !payerInfo.city.trim() || !payerInfo.state.trim() || !payerInfo.zip.trim() || !payerInfo.country.trim()) {
      setError('Please fill in all the required fields');
      return;
    }

    try {
      setProcessing(true);
      // Call the public confirm payment API with verification data and payer information
      await paymentAPI.confirmPaymentPublic(id, {
        walletAddress,
        txHash,
        ...payerInfo
      });
      
      // Redirect to confirmation page after successful payment
      navigate(`/payment/confirmed/${id}`);
    } catch (err) {
      setError('Failed to confirm payment: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayerInfoChange = (field, value) => {
    setPayerInfo(prev => ({
      ...prev,
      [field]: value
    }));
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
              </div>
              
              <div className="mb-3">
                <p><strong>Description:</strong> {payment.description || 'No description'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Network:</strong> {payment.blockchain_network ? payment.blockchain_network.name : 'N/A'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Wallet:</strong> {payment.wallet ? payment.wallet.address : 'N/A'}</p>
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
                {payment.expires_at && (() => {
                  const timeRemaining = calculateTimeRemaining(payment.expires_at);
                  return (
                    <p>
                      <strong>Time Remaining:</strong> 
                      <span className={timeRemaining.isExpired === false ? '' : 'text-danger'}>
                        {timeRemaining.timeRemaining} {timeRemaining.unit}
                      </span>
                    </p>
                  );
                })()}
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
                
                {/* Warning message for testnet payments only */}
                {payment && payment.workspace === 'testnet' && (
                  <Alert variant="warning">
                    <h5><i className="fas fa-exclamation-triangle"></i> Testnet Payment</h5>
                    <p className="mb-0">
                      This is a test payment on the testnet network. The tokens being used are not real and have no monetary value. 
                      This payment is for testing purposes only.
                    </p>
                  </Alert>
                )}
                
                <div className="mb-3">
                  <p>You are about to make a payment of <strong>{payment.amount} {payment.currency}</strong> on the <strong>{payment.blockchain_network ? payment.blockchain_network.name : 'N/A'}</strong> network.</p>
                  <p> If you want to pay manually, please use the following wallet address when you make the payment: <strong>{payment.wallet ? payment.wallet.address : 'N/A'}</strong></p>
                </div>
                
                <Form>
                  {/* Payer Information Section */}
                  <div className="mb-4">
                    <h5>Payer Information</h5>
                    <p className="text-muted">Please provide your information to complete the payment</p>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your first name"
                            value={payerInfo.firstname}
                            onChange={(e) => handlePayerInfoChange('firstname', e.target.value)}
                            disabled={processing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your last name"
                            value={payerInfo.lastname}
                            onChange={(e) => handlePayerInfoChange('lastname', e.target.value)}
                            disabled={processing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email address"
                        value={payerInfo.email}
                        onChange={(e) => handlePayerInfoChange('email', e.target.value)}
                        disabled={processing}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Phone *</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter your phone number"
                        value={payerInfo.phone}
                        onChange={(e) => handlePayerInfoChange('phone', e.target.value)}
                        disabled={processing}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Address *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your street address"
                        value={payerInfo.address}
                        onChange={(e) => handlePayerInfoChange('address', e.target.value)}
                        disabled={processing}
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>City *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your city"
                            value={payerInfo.city}
                            onChange={(e) => handlePayerInfoChange('city', e.target.value)}
                            disabled={processing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>State/Province *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="State/Province"
                            value={payerInfo.state}
                            onChange={(e) => handlePayerInfoChange('state', e.target.value)}
                            disabled={processing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>ZIP/Postal Code *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="ZIP/Postal"
                            value={payerInfo.zip}
                            onChange={(e) => handlePayerInfoChange('zip', e.target.value)}
                            disabled={processing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Country *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your country"
                        value={payerInfo.country}
                        onChange={(e) => handlePayerInfoChange('country', e.target.value)}
                        disabled={processing}
                      />
                    </Form.Group>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Your Wallet Address *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your wallet address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      disabled={processing}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Transaction Hash *</Form.Label>
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
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="success" 
                      size="lg"
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
                    {payment.cancel_url && (
                      <div className="mt-2">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => window.open(payment.cancel_url, '_self')}
                        >
                          Cancel Payment
                        </Button>
                      </div>
                    )}
                  </div>
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