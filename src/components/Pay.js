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
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const [metamaskAccount, setMetamaskAccount] = useState('');
  const [metamaskChainId, setMetamaskChainId] = useState('');

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

  // Check if payment is expired
  const isPaymentExpired = () => {
    if (!payment || !payment.expires_at) return false;
    const expirationDate = new Date(payment.expires_at);
    const now = new Date();
    return now > expirationDate;
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectToMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      setError('Please install MetaMask to use this feature.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setMetamaskAccount(accounts[0]);
      setMetamaskChainId(chainId);
      setMetamaskConnected(true);

      // Automatically populate wallet address
      setWalletAddress(accounts[0]);

      setError('');
    } catch (err) {
      setError('Failed to connect to MetaMask: ' + err.message);
    }
  };

  // Disconnect from MetaMask
  const disconnectFromMetaMask = () => {
    setMetamaskConnected(false);
    setMetamaskAccount('');
    setMetamaskChainId('');
    setWalletAddress(''); // Optionally clear wallet address on disconnect
  };

  // Handle transaction hash change (for manual entry)
  const handleTxHashChange = (e) => {
    setTxHash(e.target.value);
  };

  // Send payment via MetaMask
  const sendPaymentViaMetaMask = async () => {
    if (!metamaskConnected || !payment) {
      setError('Please connect MetaMask and ensure payment details are loaded.');
      return;
    }

    try {
      setProcessing(true);

      // Check if the connected network matches the payment network
      const connectedChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const requiredChainId = payment.blockchain_network ? payment.blockchain_network.chain_id : null;

      if (requiredChainId && connectedChainId !== requiredChainId) {
        // Try to switch to the required network

        const chainIdHex = '0x' +requiredChainId.toString(16);
        
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdHex  }],
          });
        } catch (switchError) {
          
          // If the network is not added, try to add it
          if (switchError.code === 4902) {
            try {
              // Get network details from payment
              const networkDetails = {
                chainId: chainIdHex,
                chainName: payment.blockchain_network?.name || 'Unknown Network',
                nativeCurrency: {
                  name: payment.blockchain_network?.symbol || 'ETH',
                  symbol: payment.blockchain_network?.symbol || 'ETH',
                  decimals: 18
                },
                rpcUrls: [payment.blockchain_network?.rpc_url] || [],
              };

              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [networkDetails],
              });
            } catch (addError) {
              throw new Error(`Please switch to the correct network (${payment.blockchain_network?.name || 'required network'}) in MetaMask: ${addError.message}`);
            }
          } else {
            throw new Error(`Please switch to the correct network (${payment.blockchain_network?.name || 'required network'}) in MetaMask: ${switchError.message}`);
          }
        }
      }

      // Check if this is a token transfer or native currency transfer
      const isTokenTransfer = payment.crypto_token && payment.crypto_token.contract_address;

      let txHash;
      //console.log("Is Token Transfer:", isTokenTransfer);
      if (isTokenTransfer) {
        // Handle token transfer
        // This requires calling the token contract's transfer function
        const tokenContractAddress = payment.crypto_token.contract_address;
        const recipientAddress = payment.wallet ? payment.wallet.address : '';
        const tokenDecimals = payment.crypto_token.decimals || 18;

        // Calculate the amount in the token's smallest unit
        const amountInSmallestUnit = (parseFloat(payment.amount) * Math.pow(10, tokenDecimals)).toString();
        const hexAmount = '0x' + BigInt(amountInSmallestUnit).toString(16);

        // ABI for ERC20 transfer function
        const transferABI = [
          {
            "constant": false,
            "inputs": [
              {"name": "_to", "type": "address"},
              {"name": "_value", "type": "uint256"}
            ],
            "name": "transfer",
            "outputs": [{"name": "", "type": "bool"}],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ];

        // Encode the function call
        const Web3 = (await import('web3')).default;
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(transferABI, tokenContractAddress);
        const encodedABI = contract.methods.transfer(recipientAddress, hexAmount).encodeABI();

        // Prepare transaction parameters for token transfer
        const transactionParameters = {
          from: metamaskAccount, // User's MetaMask wallet address
          to: tokenContractAddress, // Token contract address
          data: encodedABI, // Encoded function call
        };

        // Request MetaMask to send the transaction
        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });
      } else {
        // Handle native currency transfer (ETH, BNB, etc.)
        // Convert payment amount based on the native currency decimals
        const nativeCurrencyDecimals = payment.blockchain_network?.native_currency_decimals || 18;
        const multiplier = Math.pow(10, nativeCurrencyDecimals);
        const amountInSmallestUnit = (parseFloat(payment.amount) * multiplier).toString();
        const hexAmount = '0x' + BigInt(Math.floor(parseFloat(amountInSmallestUnit))).toString(16);

        // Prepare transaction parameters for native currency transfer
        const transactionParameters = {
          from: metamaskAccount, // User's MetaMask wallet address
          to: payment.wallet ? payment.wallet.address : '', // Recipient wallet address from payment details
          value: hexAmount, // Convert payment amount to hex of smallest unit
        };

        // Request MetaMask to send the transaction
        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });
      }

      // Set the transaction hash in the form
      setTxHash(txHash);

      // Show success message
      setSuccess('Payment sent successfully! Transaction hash has been populated.');
      setError('');
    } catch (err) {
      setError('Failed to send payment via MetaMask: ' + err.message);
    } finally {
      setProcessing(false);
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
            isPaymentExpired() ? (
              <Card className="shadow-sm">
                <Card.Header className="bg-danger text-white">
                  <h4>Payment Expired</h4>
                </Card.Header>
                <Card.Body>
                  <Alert variant="danger">
                    <h5><i className="fas fa-exclamation-circle"></i> Payment Expired</h5>
                    <p className="mb-0">
                      This payment request has expired and can no longer be processed.
                      Please contact the merchant to create a new payment request.
                    </p>
                  </Alert>

                  <div className="mb-3">
                    <p>You are about to make a payment of <strong>{payment.amount} {payment.currency}</strong> on the <strong>{payment.blockchain_network ? payment.blockchain_network.name : 'N/A'}</strong> network.</p>
                    <p> If you want to pay manually, please use the following wallet address when you make the payment: <strong>{payment.wallet ? payment.wallet.address : 'N/A'}</strong></p>
                  </div>

                  <div className="d-grid gap-2">
                    {payment.cancel_url && (
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => window.open(payment.cancel_url, '_self')}
                      >
                        Return to Merchant
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ) : (
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

                    {/* MetaMask Integration Section */}
                    <div className="mb-4">
                      <h5>Wallet Connection</h5>
                      <p className="text-muted">Connect your MetaMask wallet or enter details manually</p>

                      <div className="d-grid gap-2 mb-3">
                        {!metamaskConnected ? (
                          <Button
                            variant="outline-primary"
                            onClick={connectToMetaMask}
                            disabled={processing}
                          >
                            <i className="fab fa-ethereum me-2"></i>
                            Connect MetaMask
                          </Button>
                        ) : (
                          <div>
                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
                              <div>
                                <small className="text-muted">Connected Account:</small>
                                <div className="fw-bold">
                                  {metamaskAccount ? `${metamaskAccount.substring(0, 6)}...${metamaskAccount.substring(metamaskAccount.length - 4)}` : ''}
                                </div>
                              </div>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={disconnectFromMetaMask}
                                disabled={processing}
                              >
                                Disconnect
                              </Button>
                            </div>

                            {/* Send Payment Button */}
                            <div className="d-grid gap-2">
                              <Button
                                variant="success"
                                onClick={sendPaymentViaMetaMask}
                                disabled={processing}
                              >
                                <i className="fab fa-ethereum me-2"></i>
                                Send Payment via MetaMask
                              </Button>
                              <small className="text-muted text-center">
                                This will open MetaMask to confirm the transaction of {payment?.amount} {payment?.currency} to {payment?.wallet?.address ? `${payment.wallet.address.substring(0, 6)}...${payment.wallet.address.substring(payment.wallet.address.length - 4)}` : 'recipient'}.
                                <br />
                                Network: {payment?.blockchain_network?.name || 'Unknown'} | Token: {payment?.crypto_token?.name || payment?.currency || 'Native'}
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label>Your Wallet Address *</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Enter your wallet address"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          disabled={processing || (metamaskConnected && !isMetaMaskInstalled())}
                        />
                        {metamaskConnected && (
                          <Button
                            variant="outline-secondary"
                            onClick={() => setWalletAddress(metamaskAccount)}
                            disabled={processing}
                          >
                            Use Connected
                          </Button>
                        )}
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Transaction Hash *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter transaction hash"
                        value={txHash}
                        onChange={handleTxHashChange}
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
                        disabled={processing || !walletAddress.trim() || !txHash.trim()}
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
            )
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