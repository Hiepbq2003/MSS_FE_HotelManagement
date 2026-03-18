// src/components/BookingServices.js
import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import api from '../api/apiConfig';
import { FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';

const BookingServices = ({ show, handleClose, reservationId, hotelId, onServicesAdded }) => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load danh sách dịch vụ từ Hotel Service
  useEffect(() => {
    if (show && hotelId) {
      loadServices();
    }
  }, [show, hotelId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      // Gọi API lấy services theo hotel
      const response = await api.get(`/services/hotel/${hotelId}`);
      const data = response?.data || response || [];
      setServices(data);
      
      // Khởi tạo selected services
      const initialSelected = {};
      data.forEach(service => {
        initialSelected[service.id] = 0;
      });
      setSelectedServices(initialSelected);
      
    } catch (err) {
      setError('Không thể tải danh sách dịch vụ');
      console.error('Load services error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (serviceId, change) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: Math.max(0, (prev[serviceId] || 0) + change)
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selectedServices).forEach(serviceId => {
      const quantity = selectedServices[serviceId];
      if (quantity > 0) {
        const service = services.find(s => s.id === parseInt(serviceId));
        if (service) {
          total += service.price * quantity;
        }
      }
    });
    return total;
  };

  const getSelectedServicesList = () => {
    const list = [];
    Object.keys(selectedServices).forEach(serviceId => {
      const quantity = selectedServices[serviceId];
      if (quantity > 0) {
        const service = services.find(s => s.id === parseInt(serviceId));
        if (service) {
          list.push({
            serviceId: parseInt(serviceId),
            quantity: quantity,
            serviceName: service.name,
            price: service.price
          });
        }
      }
    });
    return list;
  };

  const handleSubmit = async () => {
    const selectedList = getSelectedServicesList();
    
    if (selectedList.length === 0) {
      setError('Vui lòng chọn ít nhất một dịch vụ');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const servicesToAdd = selectedList.map(item => ({
        serviceId: item.serviceId,
        quantity: item.quantity,
        serviceName: item.serviceName,
        price: item.price
      }));

      // Gọi API thêm services vào booking
      const response = await api.post('/bookings/services', {
        reservationId,
        services: servicesToAdd
      });
      
      const responseData = response?.data || response;
      
      setSuccess('Thêm dịch vụ thành công!');
      
      if (onServicesAdded) {
        onServicesAdded(responseData);
      }

      // Reset selection và đóng modal sau 1.5s
      setTimeout(() => {
        handleClose();
        // Reset selected services
        const resetSelected = {};
        services.forEach(service => {
          resetSelected[service.id] = 0;
        });
        setSelectedServices(resetSelected);
      }, 1500);

    } catch (err) {
      console.error('Add services error:', err);
      setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedList = getSelectedServicesList();
  const totalAmount = calculateTotal();

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaShoppingCart className="me-2" />
          Chọn dịch vụ bổ sung
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Đang tải danh sách dịch vụ...</p>
          </div>
        ) : (
          <>
            {services.length === 0 ? (
              <Alert variant="info">Không có dịch vụ nào cho khách sạn này</Alert>
            ) : (
              <>
                <Row>
                  {services.map(service => (
                    <Col md={6} key={service.id} className="mb-3">
                      <Card className="h-100 shadow-sm">
                        <Card.Body>
                          <Card.Title className="text-primary">{service.name}</Card.Title>
                          <Card.Text>
                            <strong className="text-success">
                              {service.price?.toLocaleString()} VNĐ
                            </strong>
                          </Card.Text>
                          <div className="d-flex align-items-center justify-content-between mt-3">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleQuantityChange(service.id, -1)}
                              disabled={!selectedServices[service.id]}
                              className="rounded-circle"
                              style={{ width: '35px', height: '35px' }}
                            >
                              <FaMinus />
                            </Button>
                            <span className="mx-3 fw-bold fs-5">
                              {selectedServices[service.id] || 0}
                            </span>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleQuantityChange(service.id, 1)}
                              className="rounded-circle"
                              style={{ width: '35px', height: '35px' }}
                            >
                              <FaPlus />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {selectedList.length > 0 && (
                  <div className="mt-4 p-4 bg-light rounded shadow-sm">
                    <h5 className="mb-3 text-primary">Dịch vụ đã chọn:</h5>
                    {selectedList.map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                        <span>
                          <strong>{item.serviceName}</strong> x {item.quantity}
                        </span>
                        <span className="fw-bold text-success">
                          {(item.price * item.quantity).toLocaleString()} VNĐ
                        </span>
                      </div>
                    ))}
                    <hr className="my-3" />
                    <div className="d-flex justify-content-between">
                      <h5 className="mb-0">Tổng cộng:</h5>
                      <h5 className="mb-0 text-primary">{totalAmount.toLocaleString()} VNĐ</h5>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={submitting || selectedList.length === 0 || loading}
        >
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Đang xử lý...
            </>
          ) : (
            'Thêm dịch vụ'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingServices;