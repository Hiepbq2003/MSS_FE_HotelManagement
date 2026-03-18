// src/components/BookingServicesList.js
import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../api/apiConfig';
import { FaUtensils, FaSpa, FaWifi, FaTv, FaCoffee, FaTrash, FaConciergeBell } from 'react-icons/fa';

const getServiceIcon = (serviceName) => {
  const name = serviceName?.toLowerCase() || '';
  if (name.includes('ăn') || name.includes('food') || name.includes('restaurant')) return <FaUtensils />;
  if (name.includes('spa') || name.includes('massage')) return <FaSpa />;
  if (name.includes('wifi') || name.includes('internet')) return <FaWifi />;
  if (name.includes('tv') || name.includes('television')) return <FaTv />;
  if (name.includes('coffee') || name.includes('cafe') || name.includes('bar')) return <FaCoffee />;
  return <FaConciergeBell />;
};

const BookingServicesList = ({ reservationId, onUpdate }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (reservationId) {
      loadServices();
    }
  }, [reservationId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/services/${reservationId}`);
      const data = response?.data || response || [];
      setServices(data);
    } catch (err) {
      console.error('Load services error:', err);
      setError('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (!window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) return;
    
    setDeleting(serviceId);
    try {
      await api.delete(`/bookings/services/${serviceId}`);
      await loadServices();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Remove service error:', err);
      alert('Không thể xóa dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Card className="mt-3">
        <Card.Body className="text-center p-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải dịch vụ...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-3">
        <Card.Body>
          <Alert variant="danger" className="mb-0">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="mt-3">
        <Card.Body>
          <Alert variant="info" className="mb-0 text-center">
            <FaConciergeBell size={30} className="mb-2" />
            <p className="mb-0">Chưa có dịch vụ nào được đặt</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const totalAmount = services.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <Card className="mt-3 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <FaConciergeBell className="me-2" />
          Dịch vụ đã đặt ({services.length})
        </h5>
      </Card.Header>
      <ListGroup variant="flush">
        {services.map((item, index) => (
          <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <span className="me-3 text-primary fs-4">
                {getServiceIcon(item.serviceName)}
              </span>
              <div>
                <strong className="fs-6">{item.serviceName}</strong>
                <br />
                <small className="text-muted">
                  {item.quantity} x {item.unitPrice?.toLocaleString() || 0} VNĐ
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <Badge bg="success" className="me-3 p-2 fs-6">
                {(item.totalPrice || 0).toLocaleString()} VNĐ
              </Badge>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemoveService(item.serviceId)}
                disabled={deleting === item.serviceId}
                className="rounded-circle"
                style={{ width: '35px', height: '35px' }}
              >
                {deleting === item.serviceId ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FaTrash />
                )}
              </Button>
            </div>
          </ListGroup.Item>
        ))}
        <ListGroup.Item className="d-flex justify-content-between bg-light py-3">
          <span className="fw-bold fs-5">Tổng cộng:</span>
          <span className="fw-bold fs-5 text-primary">{totalAmount.toLocaleString()} VNĐ</span>
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
};

export default BookingServicesList;