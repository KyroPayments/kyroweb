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
  Card
} from 'react-bootstrap';
import { walletAPI } from '../services/api';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletForm, setWalletForm] = useState({
    user_id: '',
    crypto_type: 'ETH',
    balance: 0
  });
  const [depositForm, setDepositForm] = useState({
    amount: '',
    cryptoType: 'ETH'
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    toAddress: '',
    cryptoType: 'ETH'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch wallets on component mount
  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.listWallets();
      setWallets(response.data.wallets || []);
    } catch (err) {
      setError('Failed to fetch wallets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWalletForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepositChange = (e) => {
    const { name, value } = e.target;
    setDepositForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWithdrawChange = (e) => {
    const { name, value } = e.target;
    setWithdrawForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await walletAPI.createWallet(walletForm);
      
      setSuccess('Wallet created successfully!');
      setShowCreateModal(false);
      setWalletForm({
        user_id: '',
        crypto_type: 'ETH',
        balance: 0
      });
      
      // Refresh the wallets list
      fetchWallets();
    } catch (err) {
      setError('Failed to create wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!selectedWallet) return;
    
    try {
      setLoading(true);
      const response = await walletAPI.depositFunds(
        selectedWallet.id,
        depositForm.amount,
        depositForm.cryptoType
      );
      
      setSuccess('Funds deposited successfully!');
      setShowDepositModal(false);
      setDepositForm({
        amount: '',
        cryptoType: 'ETH'
      });
      
      // Refresh the wallets list
      fetchWallets();
    } catch (err) {
      setError('Failed to deposit funds: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!selectedWallet) return;
    
    try {
      setLoading(true);
      const response = await walletAPI.withdrawFunds(
        selectedWallet.id,
        withdrawForm.amount,
        withdrawForm.toAddress,
        withdrawForm.cryptoType
      );
      
      setSuccess('Funds withdrawn successfully!');
      setShowWithdrawModal(false);
      setWithdrawForm({
        amount: '',
        toAddress: '',
        cryptoType: 'ETH'
      });
      
      // Refresh the wallets list
      fetchWallets();
    } catch (err) {
      setError('Failed to withdraw funds: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetBalance = async (id) => {
    try {
      setLoading(true);
      const response = await walletAPI.getBalance(id);
      alert(`Balance: ${response.data.balance} ${response.data.crypto_type}`);
    } catch (err) {
      setError('Failed to get balance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAddress = async (id, cryptoType) => {
    try {
      setLoading(true);
      const response = await walletAPI.generateAddress(id, cryptoType);
      alert(`New address generated: ${response.data.address}`);
    } catch (err) {
      setError('Failed to generate address: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>Wallets</h2>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Manage Wallets</h3>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Create Wallet
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading && <p>Loading...</p>}

      <Row>
        {wallets.length > 0 ? (
          wallets.map(wallet => (
            <Col md={6} lg={4} key={wallet.id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{wallet.id}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {wallet.crypto_type}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>User ID:</strong> {wallet.user_id}<br />
                    <strong>Balance:</strong> {wallet.balance} {wallet.crypto_type}
                  </Card.Text>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleGetBalance(wallet.id)}
                    >
                      Get Balance
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm"
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setShowDepositModal(true);
                      }}
                    >
                      Deposit
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm"
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setShowWithdrawModal(true);
                      }}
                    >
                      Withdraw
                    </Button>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => handleGenerateAddress(wallet.id, wallet.crypto_type)}
                    >
                      Generate Address
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <div className="text-center">
              {loading ? <p>Loading...</p> : <p>No wallets found</p>}
            </div>
          </Col>
        )}
      </Row>

      {/* Create Wallet Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Wallet</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateWallet}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>User ID</Form.Label>
              <Form.Control
                type="text"
                name="user_id"
                value={walletForm.user_id}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Cryptocurrency Type</Form.Label>
              <Form.Select
                name="crypto_type"
                value={walletForm.crypto_type}
                onChange={handleInputChange}
                required
              >
                <option value="ETH">Ethereum (ETH)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="USDC">USD Coin (USDC)</option>
                <option value="BNB">Binance Coin (BNB)</option>
                <option value="MATIC">Polygon (MATIC)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Wallet'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Deposit Modal */}
      {selectedWallet && (
        <Modal show={showDepositModal} onHide={() => setShowDepositModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Deposit to Wallet</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleDeposit}>
            <Modal.Body>
              <p><strong>Wallet ID:</strong> {selectedWallet.id}</p>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={depositForm.amount}
                  onChange={handleDepositChange}
                  required
                  step="0.01"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Cryptocurrency Type</Form.Label>
                <Form.Select
                  name="cryptoType"
                  value={depositForm.cryptoType}
                  onChange={handleDepositChange}
                  required
                >
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                  <option value="MATIC">Polygon (MATIC)</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDepositModal(false)}>
                Close
              </Button>
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Deposit Funds'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {selectedWallet && (
        <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Withdraw from Wallet</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleWithdraw}>
            <Modal.Body>
              <p><strong>Wallet ID:</strong> {selectedWallet.id}</p>
              <p><strong>Current Balance:</strong> {selectedWallet.balance} {selectedWallet.crypto_type}</p>
              
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={withdrawForm.amount}
                  onChange={handleWithdrawChange}
                  required
                  step="0.01"
                  max={selectedWallet.balance}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Destination Address</Form.Label>
                <Form.Control
                  type="text"
                  name="toAddress"
                  value={withdrawForm.toAddress}
                  onChange={handleWithdrawChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Cryptocurrency Type</Form.Label>
                <Form.Select
                  name="cryptoType"
                  value={withdrawForm.cryptoType}
                  onChange={handleWithdrawChange}
                  required
                >
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                  <option value="MATIC">Polygon (MATIC)</option>
                </Form.Select>
              </Form.Group>
              
              <Alert variant="warning">
                Please double check the destination address before submitting.
              </Alert>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>
                Close
              </Button>
              <Button variant="warning" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Withdraw Funds'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Container>
  );
};

export default Wallets;