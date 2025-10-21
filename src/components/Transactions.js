import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col,
  Alert,
  Badge
} from 'react-bootstrap';
import { transactionAPI } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    from_wallet: '',
    to_wallet: '',
    amount: '',
    currency: 'ETH',
    type: 'transfer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.listTransactions();
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError('Failed to fetch transactions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await transactionAPI.createTransaction(transactionForm);
      
      setSuccess('Transaction created successfully!');
      setShowModal(false);
      setTransactionForm({
        from_wallet: '',
        to_wallet: '',
        amount: '',
        currency: 'ETH',
        type: 'transfer'
      });
      
      // Refresh the transactions list
      fetchTransactions();
    } catch (err) {
      setError('Failed to create transaction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatus = async (id) => {
    try {
      setLoading(true);
      const response = await transactionAPI.getTransactionStatus(id);
      alert(`Transaction Status: ${response.data.status}`);
    } catch (err) {
      setError('Failed to get transaction status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (id) => {
    if (window.confirm('Are you sure you want to refund this transaction?')) {
      try {
        setLoading(true);
        await transactionAPI.refundTransaction(id);
        setSuccess('Transaction refunded successfully!');
        fetchTransactions();
      } catch (err) {
        setError('Failed to refund transaction: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container>
      <h2>Transactions</h2>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Transactions</h3>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Create Transaction
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading && <p>Loading...</p>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>From Wallet</th>
            <th>To Wallet</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Type</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.from_wallet}</td>
                <td>{transaction.to_wallet}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.currency}</td>
                <td>
                  <Badge bg={
                    transaction.type === 'transfer' ? 'primary' :
                    transaction.type === 'payment' ? 'success' : 'warning'
                  }>
                    {transaction.type}
                  </Badge>
                </td>
                <td>
                  <Badge bg={
                    transaction.status === 'completed' ? 'success' :
                    transaction.status === 'pending' ? 'warning' :
                    transaction.status === 'failed' ? 'danger' :
                    transaction.status === 'refunded' ? 'info' : 'secondary'
                  }>
                    {transaction.status}
                  </Badge>
                </td>
                <td>{new Date(transaction.created_at).toLocaleString()}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => handleGetStatus(transaction.id)}
                    className="me-1"
                  >
                    Status
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    onClick={() => handleRefund(transaction.id)}
                    disabled={transaction.status !== 'completed'}
                    className="me-1"
                  >
                    Refund
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                {loading ? 'Loading...' : 'No transactions found'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Create Transaction Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Transaction</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTransaction}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>From Wallet ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="from_wallet"
                    value={transactionForm.from_wallet}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>To Wallet ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="to_wallet"
                    value={transactionForm.to_wallet}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={transactionForm.amount}
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
                    value={transactionForm.currency}
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
              <Form.Label>Transaction Type</Form.Label>
              <Form.Select
                name="type"
                value={transactionForm.type}
                onChange={handleInputChange}
                required
              >
                <option value="transfer">Transfer</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Transaction'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Transactions;