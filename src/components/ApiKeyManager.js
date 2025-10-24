import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { apiKeyAPI } from '../services/api';

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState(['read', 'write']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null); // To display the newly created key

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await apiKeyAPI.getApiKeys();
      setApiKeys(response.data.apiKeys);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiKeyAPI.createApiKey({
        name: newKeyName,
        permissions: newKeyPermissions
      });

      // Update the list of API keys
      await fetchApiKeys();
      
      // Show the new API key to the user (only the first time)
      setNewApiKey(response.data.apiKey);
      setSuccess('API key created successfully. Make sure to copy it now as it won\'t be shown again!');
      
      // Reset form
      setNewKeyName('');
      setNewKeyPermissions(['read', 'write']);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteApiKey = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeyAPI.deleteApiKey(id);
      setSuccess('API key deleted successfully');
      await fetchApiKeys(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete API key');
    }
  };

  const togglePermission = (permission) => {
    if (newKeyPermissions.includes(permission)) {
      setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission));
    } else {
      setNewKeyPermissions([...newKeyPermissions, permission]);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>API Key Management</h2>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create New API Key
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Card>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Key</th>
                    <th>Permissions</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No API keys found. Create one to get started.</td>
                    </tr>
                  ) : (
                    apiKeys.map(key => (
                      <tr key={key.id}>
                        <td>{key.name}</td>
                        <td>
                          <code>{key.id}...{key.id.substring(key.id.length - 4)}</code>
                        </td>
                        <td>
                          {key.permissions.map((perm, idx) => (
                            <span key={idx} className="badge bg-secondary me-1">{perm}</span>
                          ))}
                        </td>
                        <td>{new Date(key.created_at).toLocaleString()}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteApiKey(key.id)}
                          >
                            Revoke
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create API Key Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New API Key</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateApiKey}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="formKeyName">
              <Form.Label>Key Name</Form.Label>
              <Form.Control
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter a name for the API key (e.g. 'Production App')"
                required
              />
              <Form.Text className="text-muted">
                This name will help you identify the purpose of this API key.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Permissions</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="permission-read"
                  label="Read"
                  checked={newKeyPermissions.includes('read')}
                  onChange={() => togglePermission('read')}
                />
                <Form.Check
                  type="checkbox"
                  id="permission-write"
                  label="Write"
                  checked={newKeyPermissions.includes('write')}
                  onChange={() => togglePermission('write')}
                />
                <Form.Check
                  type="checkbox"
                  id="permission-admin"
                  label="Admin"
                  checked={newKeyPermissions.includes('admin')}
                  onChange={() => togglePermission('admin')}
                />
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create API Key'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* API Key Display Modal */}
      <Modal show={!!newApiKey} onHide={() => setNewApiKey(null)}>
        <Modal.Header>
          <Modal.Title>New API Key Created</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <p><strong>Important: Copy your API key now!</strong></p>
            <p>This key will not be shown again. Please store it securely.</p>
          </Alert>
          <Form.Group>
            <Form.Label>Your new API Key:</Form.Label>
            <Form.Control
              type="text"
              value={newApiKey}
              readOnly
              className="font-monospace"
            />
          </Form.Group>
          <div className="mt-3">
            <Button 
              variant="secondary" 
              onClick={() => {
                navigator.clipboard.writeText(newApiKey);
              }}
              className="me-2"
            >
              Copy to Clipboard
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setNewApiKey(null)}
            >
              I've Copied It
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ApiKeyManager;