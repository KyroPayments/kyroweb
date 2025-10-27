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
  Card,
  Badge
} from 'react-bootstrap';
import { walletAPI, networkTypeAPI } from '../services/api';
import { useWorkspace } from '../contexts/WorkspaceContext';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [networkTypes, setNetworkTypes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletForm, setWalletForm] = useState({
    name: '',
    address: '',
    network_type_id: '',
    balance: 0
  });
  const [depositForm, setDepositForm] = useState({
    amount: '',
    network_type_id: ''
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    toAddress: '',
    network_type_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentWorkspace } = useWorkspace();

  // Fetch wallets and network types on component mount
  useEffect(() => {
    fetchWallets();
    fetchNetworkTypes();
  }, [currentWorkspace]); // Add currentWorkspace to dependency array

  const fetchNetworkTypes = async () => {
    try {
      setLoading(true);
      const response = await networkTypeAPI.listNetworkTypes();
      setNetworkTypes(response.data.networkTypes || []);
      
      // Set default network type if available
      if (response.data.networkTypes && response.data.networkTypes.length > 0) {
        setWalletForm(prev => ({
          ...prev,
          network_type_id: response.data.networkTypes[0].id
        }));
      }
    } catch (err) {
      setError('Failed to fetch network types: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
        name: '',
        address: '',
        network_type_id: networkTypes.length > 0 ? networkTypes[0].id : '',
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
        depositForm
      );
      
      setSuccess('Funds deposited successfully!');
      setShowDepositModal(false);
      setDepositForm({
        amount: '',
        network_type_id: selectedWallet.network_type_id
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
        withdrawForm
      );
      
      setSuccess('Funds withdrawn successfully!');
      setShowWithdrawModal(false);
      setWithdrawForm({
        amount: '',
        toAddress: '',
        network_type_id: selectedWallet.network_type_id
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
      alert(`Balance: ${response.data.balance} ${response.data.network_type || ''}`);
    } catch (err) {
      setError('Failed to get balance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <Container>
      <h2>Wallets</h2>
      <p className="text-muted">Showing wallets in <strong>{currentWorkspace.toUpperCase()}</strong> workspace</p>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Manage Wallets</h3>
        </div>
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
                  <Card.Title>{wallet.name}</Card.Title>
                  <Card.Text>
                    <strong>Wallet ID:</strong> {wallet.id}<br />
                    <strong>Address:</strong> {wallet.address}<br />
                    <strong>Type:</strong> {networkTypes.find(nt => nt.id === wallet.network_type_id)?.name || wallet.network_type_id}<br />
                  </Card.Text>
                  <div className="d-grid gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleGetBalance(wallet.id)}
                    >
                      Get Balance
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
              <Form.Label>Wallet Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={walletForm.name}
                onChange={handleInputChange}
                placeholder="Enter a name for this wallet"
                required
              />
              <Form.Text className="text-muted">
                Give this wallet a descriptive name (e.g. "Trading Wallet", "Savings Wallet")
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Wallet Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={walletForm.address}
                onChange={handleInputChange}
                placeholder="Enter your wallet address"
                required
              />
              <Form.Text className="text-muted">
                Enter the wallet address you want to connect to this account
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Network Type</Form.Label>
              <Form.Select
                name="network_type_id"
                value={walletForm.network_type_id}
                onChange={handleInputChange}
                required
              >
                {networkTypes.map(networkType => (
                  <option key={networkType.id} value={networkType.id}>
                    {networkType.name} - {networkType.description}
                  </option>
                ))}
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
                <Form.Label>Network Type</Form.Label>
                <Form.Select
                  name="network_type_id"
                  value={depositForm.network_type_id}
                  onChange={handleDepositChange}
                  required
                >
                  <option value="">Select Network Type</option>
                  {networkTypes.map(networkType => (
                    <option key={networkType.id} value={networkType.id}>
                      {networkType.name} - {networkType.description}
                    </option>
                  ))}
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
              <p><strong>Current Balance:</strong> {selectedWallet.balance} {networkTypes.find(nt => nt.id === selectedWallet.network_type_id)?.name || selectedWallet.network_type_id}</p>
              
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
                <Form.Label>Network Type</Form.Label>
                <Form.Select
                  name="network_type_id"
                  value={withdrawForm.network_type_id}
                  onChange={handleWithdrawChange}
                  required
                >
                  <option value="">Select Network Type</option>
                  {networkTypes.map(networkType => (
                    <option key={networkType.id} value={networkType.id}>
                      {networkType.name} - {networkType.description}
                    </option>
                  ))}
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