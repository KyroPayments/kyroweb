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
import { paymentAPI, walletAPI, blockchainNetworkAPI, cryptoTokenAPI } from '../services/api';
import { useWorkspace } from '../contexts/WorkspaceContext';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [blockchainNetworks, setBlockchainNetworks] = useState([]);
  const [cryptoTokens, setCryptoTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    crypto_token_id: '',
    wallet_id: '',
    merchant_id: '', // This will be set automatically from user authentication
    description: '',
    expires_at: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentWorkspace } = useWorkspace();

  // Fetch payments, wallets, blockchain networks on component mount
  useEffect(() => {
    fetchPayments();
    fetchWallets();
    fetchBlockchainNetworks();
  }, [currentWorkspace]); // Add currentWorkspace to dependency array

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.listWallets();
      setWallets(response.data.wallets || []);
      
      // If we have wallets and no wallet selected, select the first one
      if (response.data.wallets && response.data.wallets.length > 0 && !paymentForm.wallet_id) {
        setPaymentForm(prev => ({
          ...prev,
          wallet_id: response.data.wallets[0].id
        }));
      }
    } catch (err) {
      setError('Failed to fetch wallets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchainNetworks = async () => {
    try {
      setLoading(true);
      const response = await blockchainNetworkAPI.listBlockchainNetworks();
      setBlockchainNetworks(response.data.blockchainNetworks || []);
    } catch (err) {
      setError('Failed to fetch blockchain networks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // The backend should automatically filter based on the user's current workspace
      // because the workspace is attached to the user's session via middleware
      const response = await paymentAPI.listPayments();
      setPayments(response.data.payments || []);
    } catch (err) {
      setError('Failed to fetch payments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    // Special handling for blockchain_network_id to avoid including it in form data
    if (name === 'blockchain_network_id') {
      setPaymentForm(prev => ({
        ...prev,
        [name]: value
      }));
      await loadTokensForNetwork(value);
    } else {
      setPaymentForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Load tokens when wallet is selected (for future use)
    if (name === 'wallet_id') {
      await loadTokensForWallet(value);
    }
  };
  
  const loadTokensForWallet = async (walletId) => {
    try {
      setLoading(true);
      // Find the selected wallet
      const selectedWallet = wallets.find(wallet => wallet.id === walletId);
      if (selectedWallet) {
        // Load all tokens for now, but in the future we could filter based on network
        const response = await cryptoTokenAPI.listCryptoTokens();
        setCryptoTokens(response.data.cryptoTokens || []);
      }
    } catch (err) {
      setError('Failed to fetch crypto tokens: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const loadTokensForNetwork = async (networkId) => {
    try {
      setLoading(true);
      const response = await cryptoTokenAPI.getCryptoTokensByNetwork(networkId);
      setFilteredTokens(response.data.cryptoTokens || []);
      
      // Reset the selected token when network changes
      setPaymentForm(prev => ({
        ...prev,
        crypto_token_id: '',
        blockchain_network_id: networkId
      }));
    } catch (err) {
      setError('Failed to fetch crypto tokens for network: ' + err.message);
      setFilteredTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get the authenticated user ID from the stored token
      const token = localStorage.getItem('kyro_token');
      let userId = '';
      
      if (token) {
        try {
          // Decode the JWT token to extract the user ID
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const decodedToken = JSON.parse(jsonPayload);
          userId = decodedToken.userId || decodedToken.sub || decodedToken.id;
        } catch (decodeError) {
          // Fallback to another method if token decoding fails
          console.warn('Could not decode JWT token:', decodeError);
          // In a real application, you might want to call an API endpoint to get user info
        }
      }
      
      // Prepare the payment data with the authenticated user as merchant
      // Exclude blockchain_network_id since it's only used for filtering in frontend
      const { blockchain_network_id, ...paymentData } = paymentForm;
      const fullPaymentData = {
        ...paymentData,
        merchant_id: userId, // Use the authenticated user ID as merchant ID
      };
      
      const response = await paymentAPI.createPayment(fullPaymentData);
      
      setSuccess('Payment created successfully!');
      setShowModal(false);
      setPaymentForm({
        amount: '',
        crypto_token_id: '',
        wallet_id: wallets.length > 0 ? wallets[0].id : '',
        merchant_id: userId, // Pre-populate with user ID
        description: '',
        expires_at: ''
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

  const copyPaymentLink = (paymentId) => {
    const paymentLink = `${window.location.origin}/pay/${paymentId}`;
    navigator.clipboard.writeText(paymentLink)
      .then(() => {
        setSuccess('Payment link copied to clipboard!');
      })
      .catch(err => {
        setError('Failed to copy link: ' + err.message);
      });
  };

  return (
    <Container>
      <h2>Payments</h2>
      <p className="text-muted">Showing payments in <strong>{currentWorkspace.toUpperCase()}</strong> workspace</p>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Manage Payments</h3>
        </div>
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
            <th>Wallet</th>
            <th>Network</th>
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
                <td>
                  {payment.crypto_token 
                    ? `${payment.crypto_token.name} (${payment.crypto_token.symbol})` 
                    : payment.currency || 'N/A'}
                </td>
                <td>{payment.wallet ? payment.wallet.name : payment.wallet_id || 'N/A'}</td>
                <td>{payment.blockchain_network ? payment.blockchain_network.name : 'N/A'}</td>
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
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => copyPaymentLink(payment.id)}
                  >
                    Copy Link
                  </Button>
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
              <td colSpan="8" className="text-center">
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
                  <Form.Label>Wallet</Form.Label>
                  <Form.Select
                    name="wallet_id"
                    value={paymentForm.wallet_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a wallet</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} ({wallet.address.substring(0, 10)}...)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Blockchain Network</Form.Label>
                  <Form.Select
                    name="blockchain_network_id"
                    value={paymentForm.blockchain_network_id || ''}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a network</option>
                    {blockchainNetworks.map(network => (
                      <option key={network.id} value={network.id}>
                        {network.name} ({network.symbol})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cryptocurrency</Form.Label>
                  <Form.Select
                    name="crypto_token_id"
                    value={paymentForm.crypto_token_id}
                    onChange={handleInputChange}
                    required
                    disabled={!paymentForm.blockchain_network_id}
                  >
                    <option value="">Select a cryptocurrency</option>
                    {filteredTokens.map(token => (
                      <option key={token.id} value={token.id}>
                        {token.name} ({token.symbol})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiration Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="expires_at"
                    value={paymentForm.expires_at}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={paymentForm.description}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
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