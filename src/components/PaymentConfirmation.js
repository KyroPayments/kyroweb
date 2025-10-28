import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import api from '../services/api';

const PaymentConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await api.get(`/payments/public/${id}`);
        setPayment(response.data.payment);
        
        // If payment is not confirmed, redirect back
        if (response.data.payment.status !== 'confirmed') {
          navigate(`/pay/${id}`);
        }
      } catch (err) {
        setError('Failed to load payment details');
        console.error('Error fetching payment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id, navigate]);

  if (loading) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md="8">
            <Alert variant="info">Loading payment details...</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md="8">
            <Alert variant="danger">{error}</Alert>
            <Button 
              variant="primary" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md="8">
          <Card className="shadow">
            <Card.Header className="bg-success text-white text-center">
              <h2>Payment Confirmed!</h2>
              <p className="mb-0">Thank you for your payment</p>
            </Card.Header>
            <Card.Body>
              {payment && (
                <>
                  <div className="text-center mb-4">
                    <div className="bg-success text-white d-inline-block p-3 rounded-circle">
                      <i className="fas fa-check fa-2x"></i>
                    </div>
                  </div>
                  
                  <h4 className="text-center mb-4">Transaction Successful</h4>
                  
                  <div className="payment-details">
                    <h5>Payment Details</h5>
                    <div className="row mb-2">
                      <div className="col-6"><strong>Payment ID:</strong></div>
                      <div className="col-6">{payment.id}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>Amount:</strong></div>
                      <div className="col-6">{payment.amount} {payment.currency}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>Status:</strong></div>
                      <div className="col-6"><span className="badge bg-success">{payment.status}</span></div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>Token:</strong></div>
                      <div className="col-6">{payment.crypto_token?.name} ({payment.crypto_token?.symbol})</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>Network:</strong></div>
                      <div className="col-6">{payment.blockchain_network?.name}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>From Address:</strong></div>
                      <div className="col-6">{payment.payment_address}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>To Address:</strong></div>
                      <div className="col-6">{payment.wallet?.address}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>Transaction Hash:</strong></div>
                      <div className="col-6">
                        {payment.transaction_hash ? (
                          payment.blockchain_network?.explorer_url ? (
                            <a 
                              href={`${payment.blockchain_network.explorer_url}/tx/${payment.transaction_hash}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {payment.transaction_hash.substring(0, 10)}...{payment.transaction_hash.substring(payment.transaction_hash.length - 6)}
                            </a>
                          ) : (
                            payment.transaction_hash.substring(0, 10) + '...' + payment.transaction_hash.substring(payment.transaction_hash.length - 6)
                          )
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>Description:</strong></div>
                      <div className="col-6">{payment.description}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-6"><strong>Created:</strong></div>
                      <div className="col-6">{new Date(payment.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <p className="mb-0">Your payment has been successfully processed and confirmed.</p>
            </Card.Footer>
          </Card>
          
          <div className="text-center mt-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentConfirmation;