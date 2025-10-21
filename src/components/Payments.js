import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col,
  Alert
} from 'react-bootstrap';
import { paymentAPI } from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    currency: 'ETH',
    wallet_id: '',
    merchant_id: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.listPayments();
      setPayments(response.data.payments || []);
    } catch (err) {
      setError('Failed to fetch payments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await paymentAPI.createPayment(paymentForm);
      
      setSuccess('Payment created successfully!');
      setShowModal(false);
      setPaymentForm({
        amount: '',
        currency: 'ETH',
        wallet_id: '',
        merchant_id: '',
        description: ''
      });
      
      // Refresh the payments list
      fetchPayments();
    } catch (err) {
      setError('Failed to create payment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this payment?')) {
      try {
        setLoading(true);
        await paymentAPI.cancelPayment(id);
        setSuccess('Payment cancelled successfully!');
        fetchPayments();
      } catch (err) {
        setError('Failed to cancel payment: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container>
      <h2>Payments</h2>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Payments</h3>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Create Payment
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading && <p>Loading...</p>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Wallet ID</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.amount}</td>
                <td>{payment.currency}</td>
                <td>{payment.wallet_id}</td>
                <td>
                  <span className={`badge ${
                    payment.status === 'completed' ? 'bg-success' :
                    payment.status === 'pending' ? 'bg-warning' :
                    payment.status === 'cancelled' ? 'bg-secondary' : 'bg-danger'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td>{new Date(payment.created_at).toLocaleString()}</td>
                <td>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleCancelPayment(payment.id)}
                    disabled={payment.status !== 'pending'}
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                {loading ? 'Loading...' : 'No payments found'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Create Payment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Payment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreatePayment}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    name="currency"
                    value={paymentForm.currency}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="BNB">BNB</option>
                    <option value="MATIC">MATIC</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Wallet ID</Form.Label>
              <Form.Control
                type="text"
                name="wallet_id"
                value={paymentForm.wallet_id}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Merchant ID</Form.Label>
              <Form.Control
                type="text"
                name="merchant_id"
                value={paymentForm.merchant_id}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={paymentForm.description}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Payment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Payments;