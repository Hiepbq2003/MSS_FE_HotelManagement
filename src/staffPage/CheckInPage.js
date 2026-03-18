// src/components/WalkInCheckIn.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Table } from 'react-bootstrap';
import api from '../api/apiConfig';

const WalkInCheckIn = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [todayWalkIns, setTodayWalkIns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    guestName: '',
    email: '',
    phone: '',
    nationality: '',
    documentType: 'CCCD',
    documentNumber: '',
    roomTypeId: '',
    adultCount: 1,
    childCount: 0,
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: ''
  });

  // Load room types và today walk-ins
  useEffect(() => {
    loadRoomTypes();
    loadTodayWalkIns();
  }, []);

  const loadRoomTypes = async () => {
    try {
      const data = await api.get('/room-type/hotel/1');
      setRoomTypes(data || []);
    } catch (err) {
      console.error('Error loading room types:', err);
    }
  };

  const loadTodayWalkIns = async () => {
    try {
      const data = await api.get('/checkin/walkin/today');
      setTodayWalkIns(data || []);
    } catch (err) {
      console.error('Error loading today walk-ins:', err);
    }
  };

  // Tìm phòng trống
  const checkAvailability = async () => {
    if (!form.roomTypeId || !form.checkInDate || !form.checkOutDate) {
      setError('Vui lòng chọn loại phòng và ngày');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Tìm phòng trống
      const roomsData = await api.get(
        `/checkin/walkin/available-rooms?roomTypeId=${form.roomTypeId}&checkIn=${form.checkInDate}&checkOut=${form.checkOutDate}`
      );
      setAvailableRooms(roomsData || []);
      
      // Tính giá
      const priceData = await api.get(
        `/checkin/walkin/calculate-price?roomTypeId=${form.roomTypeId}&checkIn=${form.checkInDate}&checkOut=${form.checkOutDate}`
      );
      setPrice(priceData);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể kiểm tra phòng trống');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.guestName || !form.nationality || !form.documentNumber) {
      setError('Vui lòng điền đầy đủ thông tin khách hàng');
      return;
    }

    if (availableRooms.length === 0) {
      setError('Vui lòng kiểm tra phòng trống trước khi check-in');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const payload = {
        ...form,
        receptionId: localStorage.getItem('userId')
      };

      const response = await api.post('/checkin/walkin/checkin', payload);
      setSuccess(response);
      
      // Reset form
      setForm({
        ...form,
        guestName: '',
        email: '',
        phone: '',
        nationality: '',
        documentNumber: '',
        notes: ''
      });
      setAvailableRooms([]);
      setPrice(null);
      
      // Refresh danh sách
      loadTodayWalkIns();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Check-in thất bại');
    } finally {
      setLoading(false);
    }
  };

  const receptionistName = localStorage.getItem('fullName') || 'Unknown';

  return (
    <Container className="mt-4">
      <Card className="shadow mb-4">
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0">🏨 Walk-in Check-in (Khách đến trực tiếp)</h4>
        </Card.Header>
        <Card.Body>
          <div className="mb-3 text-end">
            <small className="text-muted">
              Lễ tân: <strong>{receptionistName}</strong>
            </small>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          
          {success && (
            <Alert variant="success" className="mb-4">
              <h5>✅ Check-in thành công!</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Mã đặt phòng:</strong> {success.reservationCode}</p>
                  <p><strong>Phòng:</strong> {success.roomNumber}</p>
                  <p><strong>Khách:</strong> {success.guestName}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Tổng tiền:</strong> {success.totalAmount?.toLocaleString()} VNĐ</p>
                  <p><strong>Tiền cọc:</strong> {success.deposit?.toLocaleString()} VNĐ</p>
                  <p><strong>Check-in:</strong> {new Date(success.checkInDate).toLocaleString()}</p>
                </Col>
              </Row>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <h5 className="text-primary">📋 Thông tin khách hàng</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={form.guestName}
                    onChange={(e) => setForm({...form, guestName: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quốc tịch <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={form.nationality}
                    onChange={(e) => setForm({...form, nationality: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Loại giấy tờ</Form.Label>
                  <Form.Select
                    value={form.documentType}
                    onChange={(e) => setForm({...form, documentType: e.target.value})}
                  >
                    <option value="CCCD">CCCD</option>
                    <option value="PASSPORT">Passport</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số giấy tờ <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={form.documentNumber}
                    onChange={(e) => setForm({...form, documentNumber: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <h5 className="text-primary">🏠 Thông tin phòng</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Loại phòng <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={form.roomTypeId}
                    onChange={(e) => setForm({...form, roomTypeId: e.target.value})}
                    required
                  >
                    <option value="">-- Chọn loại phòng --</option>
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.capacity} người
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày nhận</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.checkInDate}
                        onChange={(e) => setForm({...form, checkInDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Ngày trả</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.checkOutDate}
                        onChange={(e) => setForm({...form, checkOutDate: e.target.value})}
                        min={form.checkInDate}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Người lớn</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={form.adultCount}
                        onChange={(e) => setForm({...form, adultCount: parseInt(e.target.value) || 1})}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Trẻ em</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={form.childCount}
                        onChange={(e) => setForm({...form, childCount: parseInt(e.target.value) || 0})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button 
                  variant="info" 
                  onClick={checkAvailability}
                  disabled={loading || !form.roomTypeId}
                  className="mb-3 w-100"
                >
                  {loading ? <Spinner size="sm" /> : '🔍 Kiểm tra phòng trống'}
                </Button>

                {price && (
                  <Alert variant="info" className="mb-3">
                    <p><strong>Số đêm:</strong> {price.nights}</p>
                    <p><strong>Giá/đêm:</strong> {price.pricePerNight?.toLocaleString()} VNĐ</p>
                    <p><strong>Tổng tiền:</strong> {price.totalPrice?.toLocaleString()} VNĐ</p>
                    <p><strong>Tiền cọc (20%):</strong> {price.deposit?.toLocaleString()} VNĐ</p>
                  </Alert>
                )}

                {availableRooms.length > 0 && (
                  <Alert variant="success">
                    <p><strong>Còn {availableRooms.length} phòng trống</strong></p>
                    <small>Phòng: {availableRooms.map(r => r.roomNumber).join(', ')}</small>
                  </Alert>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({...form, notes: e.target.value})}
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="success" 
                  className="w-100"
                  disabled={loading || availableRooms.length === 0}
                >
                  {loading ? <Spinner size="sm" /> : '✅ Xác nhận Check-in'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Danh sách walk-in hôm nay */}
      <Card className="shadow">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">📋 Walk-in Check-in hôm nay</h5>
        </Card.Header>
        <Card.Body>
          {todayWalkIns.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Mã đặt</th>
                  <th>Khách hàng</th>
                  <th>Phòng</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {todayWalkIns.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.reservationCode}</td>
                    <td>{item.guestName}</td>
                    <td>{item.roomNumber}</td>
                    <td>{new Date(item.checkInDate).toLocaleTimeString()}</td>
                    <td>{new Date(item.checkOutDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge bg-success">CHECKED-IN</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">Chưa có walk-in check-in nào hôm nay</Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WalkInCheckIn;