import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { profileAPI } from '../services/api';
import { useWorkspace } from '../contexts/WorkspaceContext';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', workspace: 'testnet' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { updateWorkspace } = useWorkspace();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setUser(response.data.user);
      const workspace = response.data.user.workspace || 'testnet';
      setFormData({ 
        name: response.data.user.name,
        workspace: workspace
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await profileAPI.updateProfile(formData);
      setUser(response.data.user);
      // Update the workspace context to reflect the new workspace
      updateWorkspace(response.data.user.workspace);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
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
        <Col md={{ span: 6, offset: 3 }}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="mb-4">Profile Settings</Card.Title>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your business name"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={user?.email || ''}
                    disabled
                    placeholder="Email cannot be changed"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formWorkspace">
                  <Form.Label>Workspace</Form.Label>
                  <Form.Select
                    name="workspace"
                    value={formData.workspace}
                    onChange={handleChange}
                    required
                  >
                    <option value="testnet">Testnet (Sandbox)</option>
                    <option value="mainnet">Mainnet (Production)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Select your working environment. This affects which networks, tokens, and data you see.
                  </Form.Text>
                </Form.Group>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Button
                  variant="primary"
                  type="submit"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;