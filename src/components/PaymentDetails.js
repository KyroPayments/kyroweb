import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert,
  Spinner,
  Badge
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const PaymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPayment(id);
      setPayment(response.data.payment);
    } catch (err) {
      setError('Failed to load payment details: ' + err.message);
    } finally {
      setLoading(false);
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
        <Button variant="primary" onClick={() => navigate('/payments')}>
          Back to Payments
        </Button>
      </Container>
    );
  }

  if (!payment) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Payment not found</Alert>
        <Button variant="primary" onClick={() => navigate('/payments')}>
          Back to Payments
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Payment Details</h2>
            <Button variant="secondary" onClick={() => navigate('/payments')}>
              Back to Payments
            </Button>
          </div>
        </Col>
      </Row>
      
      <Row>
        {/* Payment Information Card */}
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h4>Payment Information</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h5>Payment ID: {payment.id}</h5>
              </div>
              
              <div className="mb-3">
                <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Description:</strong> {payment.description || 'No description'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Network:</strong> {payment.blockchain_network ? payment.blockchain_network.name : 'N/A'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Cryptocurrency:</strong> {payment.crypto_token ? `${payment.crypto_token.name} (${payment.crypto_token.symbol})` : 'N/A'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Wallet:</strong> {payment.wallet ? payment.wallet.name : 'N/A'}</p>
                {payment.wallet && (
                  <p className="text-muted ms-4">{payment.wallet.address}</p>
                )}
              </div>
              
              <div className="mb-3">
                <p><strong>Status:</strong>
                  <span className={`badge ms-2 ${
                    payment.status === 'confirmed' ? 'bg-success' :
                    payment.status === 'pending' ? 'bg-warning' :
                    payment.status === 'cancelled' ? 'bg-secondary' : 'bg-danger'
                  }`}>
                    {payment.status}
                  </span>
                </p>
              </div>
              
              <div className="mb-3">
                <p><strong>Workspace:</strong> {payment.workspace?.toUpperCase() || 'N/A'}</p>
              </div>
              
              <div className="mb-3">
                <p><strong>Created:</strong> {new Date(payment.created_at).toLocaleString()}</p>
              </div>
              
              {payment.expires_at && (
                <div className="mb-3">
                  <p><strong>Expires:</strong> {new Date(payment.expires_at).toLocaleString()}</p>
                </div>
              )}
              
              
            </Card.Body>
          </Card>
        </Col>
        
        {/* Payer Information Card */}
        <Col lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-info text-white">
              <h4>Payer Information</h4>
            </Card.Header>
            <Card.Body>
              {payment.transaction_hash && (
                <div className="mb-3">
                  <p><strong>Transaction Hash:</strong></p>
                  <p className="text-break">{payment.transaction_hash}</p>
                </div>
              )}
              
              {payment.payment_address && (
                <div className="mb-3">
                  <p><strong>Payment Address:</strong></p>
                  <p className="text-break">{payment.payment_address}</p>
                </div>
              )}
              {payment.payer_firstname || payment.payer_lastname || 
               payment.payer_email || payment.payer_phone ||
               payment.payer_address || payment.payer_city ||
               payment.payer_state || payment.payer_zip ||
               payment.payer_country ? (
                <>
                  {payment.payer_firstname || payment.payer_lastname ? (
                    <div className="mb-3">
                      <p><strong>Name:</strong> {payment.payer_firstname || ''} {payment.payer_lastname || ''}</p>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p><strong>Name:</strong> <em>No name provided</em></p>
                    </div>
                  )}
                  
                  {payment.payer_email ? (
                    <div className="mb-3">
                      <p><strong>Email:</strong> {payment.payer_email}</p>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p><strong>Email:</strong> <em>No email provided</em></p>
                    </div>
                  )}
                  
                  {payment.payer_phone ? (
                    <div className="mb-3">
                      <p><strong>Phone:</strong> {payment.payer_phone}</p>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p><strong>Phone:</strong> <em>No phone provided</em></p>
                    </div>
                  )}
                  
                  {(payment.payer_address || payment.payer_city || payment.payer_state || payment.payer_zip || payment.payer_country) ? (
                    <div className="mb-3">
                      <p><strong>Address:</strong></p>
                      {payment.payer_address && <p className="ms-4">{payment.payer_address}</p>}
                      {payment.payer_city && <p className="ms-4">{payment.payer_city}{payment.payer_state ? ',' : ''} {payment.payer_state} {payment.payer_zip || ''}</p>}
                      {payment.payer_country && <p className="ms-4">{payment.payer_country}</p>}
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p><strong>Address:</strong> <em>No address provided</em></p>
                    </div>
                  )}
                </>
              ) : (
                <p><em>No payer information provided for this payment.</em></p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentDetails;