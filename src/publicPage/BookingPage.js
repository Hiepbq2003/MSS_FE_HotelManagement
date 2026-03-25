import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner, Card, InputGroup, Modal,Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import BookingServicesList from '../components/BookingServicesList';
import { FaConciergeBell, FaTicketAlt, FaCalendarWeek, FaPlus, FaShoppingCart } from 'react-icons/fa';
import api from "../api/apiConfig";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roomAllocations, setRoomAllocations] = useState([]);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [showServicesList, setShowServicesList] = useState(false);
  const [servicesUpdated, setServicesUpdated] = useState(false);
  const [deposit, setDeposit] = useState(0);
  const [nights, setNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  
  // State cho dịch vụ tạm thời (chưa đặt phòng)
  const [tempServices, setTempServices] = useState([]);
  const [showTempServicesModal, setShowTempServicesModal] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // State cho giảm giá cuối tuần
  const [weekendDiscount, setWeekendDiscount] = useState(0);
  const [weekendDiscountAmount, setWeekendDiscountAmount] = useState(0);
  const [isWeekendBooking, setIsWeekendBooking] = useState(false);

  // State cho voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValidating, setVoucherValidating] = useState(false);
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);

  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/1200x600?text=Room+Luxury+Image";

  const [form, setForm] = useState({
    guestName: localStorage.getItem("fullName") || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
    nationality: "",
    documentType: "",
    documentNumber: "",
    checkInDate: "",
    checkOutDate: "",
    adultCount: 1,
    childCount: 0,
    notes: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const data = await api.get(`/room-type/${id}`);
        setRoom(data);
      } catch (err) {
        setError("Không tải được thông tin phòng.");
        console.error("Load room error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [id]);

  // Load danh sách dịch vụ
  useEffect(() => {
    const loadServices = async () => {
      if (!room) return;
      try {
        setLoadingServices(true);
        const response = await api.get(`/services/hotel/${room.hotelId || 1}`);
        const data = response?.data || response || [];
        setAvailableServices(data);
      } catch (err) {
        console.error("Load services error:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, [room]);

  // Kiểm tra ngày check-in có phải cuối tuần không
  const checkWeekendBooking = (checkInDate) => {
    if (!checkInDate) return false;
    const date = new Date(checkInDate);
    const day = date.getDay();
    return day === 5 || day === 6 || day === 0;
  };

  // Tính toán phân bổ phòng và tiền
  useEffect(() => {
    if (!room) return;
    
    const adult = Number(form.adultCount) || 0;
    const child = Number(form.childCount) || 0;
    const capacity = room.capacity || 1;
    
    const totalGuestWeight = adult + (child * 0.5);
    const roomsNeeded = Math.ceil(totalGuestWeight / capacity);
    
    const allocations = [];
    let remainingAdults = adult;
    let remainingChildren = child;
    
    for (let i = 0; i < roomsNeeded; i++) {
      let roomCapacity = capacity;
      let adultsInRoom = 0;
      let childrenInRoom = 0;
      
      while (roomCapacity >= 1 && remainingAdults > 0) {
        adultsInRoom++;
        remainingAdults--;
        roomCapacity -= 1;
      }
      
      while (roomCapacity >= 0.5 && remainingChildren > 0) {
        childrenInRoom++;
        remainingChildren--;
        roomCapacity -= 0.5;
      }
      
      allocations.push({
        roomNumber: i + 1,
        adultCount: adultsInRoom,
        childCount: childrenInRoom,
        totalWeight: adultsInRoom + (childrenInRoom * 0.5)
      });
    }
    
    setRoomAllocations(allocations);

    // Tính tiền khi có checkInDate và checkOutDate
    if (form.checkInDate && form.checkOutDate) {
      const checkIn = new Date(form.checkInDate);
      const checkOut = new Date(form.checkOutDate);
      const nightsCount = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
      setNights(nightsCount);
      
      const baseTotal = room.basePrice * nightsCount * roomsNeeded;
      setOriginalAmount(baseTotal);
      
      // Kiểm tra giảm giá cuối tuần
      const isWeekend = checkWeekendBooking(form.checkInDate);
      setIsWeekendBooking(isWeekend);
      
      let afterWeekendDiscount = baseTotal;
      let weekendDiscAmount = 0;
      
      if (isWeekend) {
        weekendDiscAmount = baseTotal * 0.1;
        afterWeekendDiscount = baseTotal - weekendDiscAmount;
        setWeekendDiscountAmount(weekendDiscAmount);
        setWeekendDiscount(10);
      } else {
        setWeekendDiscountAmount(0);
        setWeekendDiscount(0);
      }
      
      setTotalAmount(afterWeekendDiscount);
      
      // Tính sau voucher
      if (voucherApplied) {
        let discountAmount = 0;
        if (voucherApplied.discountType === "PERCENTAGE") {
          discountAmount = afterWeekendDiscount * (voucherApplied.discountValue / 100);
        } else {
          discountAmount = voucherApplied.discountValue;
        }
        setVoucherDiscount(discountAmount);
        const final = afterWeekendDiscount - discountAmount;
        setFinalAmount(final);
        setDeposit(final * 0.2);
      } else {
        setFinalAmount(afterWeekendDiscount);
        setDeposit(afterWeekendDiscount * 0.2);
      }
    }
  }, [form.adultCount, form.childCount, form.checkInDate, form.checkOutDate, room, voucherApplied]);

  // Tính tổng tiền dịch vụ tạm thời
  const getTempServicesTotal = () => {
    return tempServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  };

  // Thêm dịch vụ tạm thời
  const handleAddTempService = (service) => {
    setTempServices(prev => {
      const existing = prev.find(s => s.id === service.id);
      if (existing) {
        return prev.map(s => 
          s.id === service.id 
            ? { ...s, quantity: s.quantity + 1 }
            : s
        );
      } else {
        return [...prev, { ...service, quantity: 1 }];
      }
    });
  };

  // Xóa dịch vụ tạm thời
  const handleRemoveTempService = (serviceId) => {
    setTempServices(prev => prev.filter(s => s.id !== serviceId));
  };

  // Cập nhật số lượng dịch vụ tạm thời
  const handleUpdateTempServiceQuantity = (serviceId, quantity) => {
    if (quantity <= 0) {
      handleRemoveTempService(serviceId);
    } else {
      setTempServices(prev => 
        prev.map(s => s.id === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s)
      );
    }
  };

  // Kiểm tra voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherMessage("Vui lòng nhập mã voucher");
      return;
    }

    if (!totalAmount || totalAmount === 0) {
      setVoucherMessage("Vui lòng chọn ngày nhận/trả phòng trước");
      return;
    }

    setVoucherValidating(true);
    setVoucherMessage("");

    try {
      const response = await api.post("/vouchers/validate", {
        code: voucherCode,
        orderAmount: totalAmount
      });

      if (response.valid) {
        setVoucherApplied({
          code: voucherCode,
          discountType: response.discountType,
          discountValue: response.discountValue
        });
        setVoucherDiscount(response.discountAmount);
        setVoucherMessage(response.message);
      } else {
        setVoucherApplied(null);
        setVoucherDiscount(0);
        setVoucherMessage(response.message);
      }
    } catch (err) {
      console.error("Voucher validation error:", err);
      setVoucherMessage("Lỗi kiểm tra voucher, vui lòng thử lại");
      setVoucherApplied(null);
      setVoucherDiscount(0);
    } finally {
      setVoucherValidating(false);
    }
  };

  // Hủy áp dụng voucher
  const handleRemoveVoucher = () => {
    setVoucherApplied(null);
    setVoucherCode("");
    setVoucherDiscount(0);
    setVoucherMessage("");
  };

  const validateForm = () => {
    if (form.adultCount < 1) {
      setError("Phải có ít nhất 1 người lớn");
      return false;
    }
    
    if (!form.checkInDate || !form.checkOutDate) {
      setError("Vui lòng chọn ngày nhận và trả phòng");
      return false;
    }
    
    const checkIn = new Date(form.checkInDate);
    const checkOut = new Date(form.checkOutDate);
    
    if (checkOut <= checkIn) {
      setError("Ngày trả phòng phải sau ngày nhận phòng");
      return false;
    }
    
    return true;
  };

  const generateDocNumber = () => {
    return "DOC-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      const customerId = localStorage.getItem("customerId") || localStorage.getItem("userId");
      const customerEmail = localStorage.getItem("email");
      const customerName = localStorage.getItem("fullName");
      
      const body = {
        hotelId: 1,
        roomTypeId: room.id,
        expectedCheckInDate: form.checkInDate,
        expectedCheckOutDate: form.checkOutDate,
        note: form.notes,
        voucherCode: voucherApplied ? voucherApplied.code : null,
        customerId: customerId ? parseInt(customerId) : null,
        guest: {
          fullName: form.guestName,
          email: form.email,
          phone: form.phone,
          nationality: form.nationality || "Vietnam",
          documentType: form.documentType || "PASSPORT",
          documentNumber: form.documentNumber || generateDocNumber()
        },
        rooms: roomAllocations.map(alloc => ({
          adultCount: alloc.adultCount,
          childCount: alloc.childCount
        })),
        services: tempServices.map(s => ({  // Thêm dịch vụ tạm thời vào request
          serviceId: s.id,
          quantity: s.quantity
        }))
      };
    
      console.log("📤 Booking Request Body:", JSON.stringify(body, null, 2));
    
      const response = await api.post("/bookings", body);
      const responseData = response?.data || response;
  
      if (typeof responseData !== 'object' || responseData === null) {
        throw new Error("Server trả về dữ liệu không hợp lệ");
      }
  
      const reservationId = responseData?.reservationId;
      const reservationCode = responseData?.reservationCode;
  
      if (!reservationId) {
        throw new Error("Không lấy được reservationId từ server");
      }
  
      setCurrentReservationId(reservationId);
  
      // Tạo thanh toán VNPay
      let paymentResponse;
      try {
        paymentResponse = await api.post("/payments/create-vnpay", {
          reservationId: reservationId,
          amount: deposit
        });
      } catch (paymentError) {
        throw paymentError;
      }
      
      const paymentData = paymentResponse?.data || paymentResponse;
      const vnpUrl = paymentData?.vnpayUrl || paymentResponse?.vnpayUrl;
      
      if (!vnpUrl) {
        throw new Error("Không tạo được VNPay URL");
      }
  
      const successContent = (
        <div>
          <p className="fw-bold text-success">{responseData.message || "Đặt phòng thành công!"}</p>
          <p>Mã đặt phòng: <strong>{reservationCode}</strong></p>
          {isWeekendBooking && (
            <p className="text-info">
              <FaCalendarWeek className="me-1" />
              Áp dụng giảm giá cuối tuần: <strong>-{weekendDiscountAmount.toLocaleString()} VNĐ (10%)</strong>
            </p>
          )}
          {voucherApplied && (
            <p className="text-info">Đã áp dụng voucher: <strong>{voucherApplied.code}</strong> - Giảm {voucherDiscount.toLocaleString()} VNĐ</p>
          )}
          {tempServices.length > 0 && (
            <p className="text-info">
              <FaConciergeBell className="me-1" />
              Đã thêm {tempServices.length} dịch vụ: <strong>{getTempServicesTotal().toLocaleString()} VNĐ</strong>
            </p>
          )}
          <p>
            {responseData.isLoggedIn 
              ? `Khách hàng: ${responseData.customerName || form.guestName}` 
              : "Khách vãng lai"}
          </p>
          <p>
            Số phòng: <strong>{responseData.requiredRooms || roomAllocations.length}</strong> 
            (Người lớn: {responseData.totalAdults || form.adultCount}, 
             Trẻ em: {responseData.totalChildren || form.childCount})
          </p>
          <p>
            <strong>Thông tin giá:</strong><br/>
            Tổng tiền phòng: {originalAmount.toLocaleString()} VNĐ<br/>
            {tempServices.length > 0 && (
              <>Dịch vụ: +{getTempServicesTotal().toLocaleString()} VNĐ<br/></>
            )}
            {isWeekendBooking && (
              <>Giảm giá cuối tuần (10%): -{weekendDiscountAmount.toLocaleString()} VNĐ<br/></>
            )}
            {voucherApplied && (
              <>Giảm giá voucher: -{voucherDiscount.toLocaleString()} VNĐ<br/></>
            )}
            <strong>Thành tiền: {(finalAmount + getTempServicesTotal()).toLocaleString()} VNĐ</strong><br/>
            Tiền cọc (20%): <strong className="text-warning">{deposit.toLocaleString()} VNĐ</strong>
          </p>
          <p>Đang chuyển sang cổng thanh toán VNPay...</p>
        </div>
      );
  
      setSuccess(successContent);
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.href = vnpUrl;
  
    } catch (err) {
      console.error("❌ Booking error:", err);
      let errorMessage = "Lỗi không xác định";
      
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || err.message;
      } else if (err.request) {
        errorMessage = "Không thể kết nối đến server";
      } else {
        errorMessage = err.message;
      }
      
      setError("Đặt phòng thất bại: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleServicesAdded = () => {
    setServicesUpdated(prev => !prev);
    setShowServicesList(true);
  };

  const handleViewServices = () => {
    setShowServicesList(!showServicesList);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!room) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Không tìm thấy loại phòng.</Alert>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: 40, paddingBottom: 40 }}>
      <Row>
        <Col md={7}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <img 
                className="d-block w-100" 
                src={room.imageUrl || DEFAULT_IMAGE_URL}
                style={{ height: "400px", objectFit: "cover" }} 
                alt={room.name} 
            />
          </Card>

          <h3 className="fw-bold">{room.name}</h3>
          <p style={{ color: "#666" }}>{room.description}</p>
          
          <p><strong>Giá:</strong> {room.basePrice?.toLocaleString()} VNĐ/đêm</p>
          <p><strong>Sức chứa:</strong> {room.capacity} người lớn (trẻ em tính 0.5)</p>
          <p><strong>Giường:</strong> {room.bedInfo}</p>

          {roomAllocations.length > 1 && (
            <Alert variant="info">
              <Alert.Heading>Cần {roomAllocations.length} phòng</Alert.Heading>
              <p>
                Với {form.adultCount} người lớn và {form.childCount} trẻ em,
                hệ thống sẽ phân bổ như sau:
              </p>
              <ul>
                {roomAllocations.map((alloc, idx) => (
                  <li key={idx}>
                    Phòng {idx + 1}: {alloc.adultCount} người lớn, {alloc.childCount} trẻ em
                  </li>
                ))}
              </ul>
            </Alert>
          )}
          
          {nights > 0 && (
            <Alert variant="success">
              <strong>Thông tin giá:</strong><br/>
              Tổng tiền phòng: <strong>{originalAmount.toLocaleString()} VNĐ</strong><br/>
              {tempServices.length > 0 && (
                <>Dịch vụ: +<strong>{getTempServicesTotal().toLocaleString()} VNĐ</strong><br/></>
              )}
              {isWeekendBooking && (
                <span className="text-success">
                  🎉 Giảm giá cuối tuần (10%): <strong>-{weekendDiscountAmount.toLocaleString()} VNĐ</strong><br/>
                </span>
              )}
              {voucherApplied && (
                <>Giảm giá voucher: <strong className="text-danger">-{voucherDiscount.toLocaleString()} VNĐ</strong><br/></>
              )}
              <strong>Thành tiền: {(finalAmount + getTempServicesTotal()).toLocaleString()} VNĐ</strong><br/>
              <strong>Tiền cọc 20%:</strong> <span className="text-danger fw-bold">{deposit.toLocaleString()} VNĐ</span>
            </Alert>
          )}
        </Col>

        <Col md={5}>
          <div style={{ background: "#1f1f1f", padding: 25, borderRadius: 10, color: "#fff" }}>
            <h4 className="text-warning fw-bold mb-3">Thông tin đặt phòng</h4>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Các form fields giữ nguyên */}
              <h5 className="text-info fw-bold mb-3">Thông tin người đặt</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Họ tên</Form.Label>
                <Form.Control 
                  type="text" 
                  name="guestName" 
                  value={form.guestName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nhập họ tên đầy đủ"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="example@email.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control 
                  type="tel" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="0123456789"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Quốc tịch</Form.Label>
                <Form.Control 
                  type="text" 
                  name="nationality" 
                  value={form.nationality} 
                  onChange={handleChange} 
                  placeholder="VD: Vietnam"
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Loại giấy tờ</Form.Label>
                <Form.Select 
                  name="documentType" 
                  value={form.documentType} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn loại giấy tờ</option>
                  <option value="PASSPORT">Hộ chiếu (Passport)</option>
                  <option value="ID_CARD">CMND/CCCD</option>
                  <option value="DRIVER_LICENSE">Giấy phép lái xe</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số giấy tờ</Form.Label>
                <Form.Control 
                  type="text" 
                  name="documentNumber" 
                  value={form.documentNumber} 
                  onChange={handleChange} 
                  placeholder="VD: B1234567"
                  required 
                />
              </Form.Group>

              <h5 className="text-info fw-bold mb-3 mt-4">Thông tin phòng</h5>
              
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày nhận phòng</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="checkInDate" 
                      value={form.checkInDate} 
                      onChange={handleChange} 
                      min={new Date().toISOString().split('T')[0]}
                      required 
                    />
                    {isWeekendBooking && form.checkInDate && (
                      <Form.Text className="text-success">
                        🎉 Đặt phòng cuối tuần được giảm 10%!
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày trả phòng</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="checkOutDate" 
                      value={form.checkOutDate} 
                      onChange={handleChange} 
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
                      max="20"
                      name="adultCount" 
                      value={form.adultCount} 
                      onChange={handleChange} 
                    />
                    <Form.Text className="text-muted">
                      Tối thiểu 1 người lớn
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Trẻ em (0-11 tuổi)</Form.Label>
                    <Form.Control 
                      type="number" 
                      min="0" 
                      max="20"
                      name="childCount" 
                      value={form.childCount} 
                      onChange={handleChange} 
                    />
                    <Form.Text className="text-muted">
                      Mỗi trẻ em tính 0.5
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Nút thêm dịch vụ */}
              <Button
                variant="outline-info"
                className="w-100 fw-bold mb-3"
                onClick={() => setShowTempServicesModal(true)}
                disabled={loadingServices}
              >
                <FaPlus className="me-2" />
                {loadingServices ? "Đang tải dịch vụ..." : "Thêm dịch vụ"}
              </Button>

              {/* Hiển thị dịch vụ đã chọn tạm thời */}
              {tempServices.length > 0 && (
                <div className="mb-3 p-3 bg-dark rounded">
                  <h6 className="text-info mb-2">
                    <FaShoppingCart className="me-2" />
                    Dịch vụ đã chọn ({tempServices.length})
                  </h6>
                  {tempServices.map(service => (
                    <div key={service.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary">
                      <div>
                        <span>{service.name}</span>
                        <br />
                        <small className="text-muted">{service.price.toLocaleString()} VNĐ x {service.quantity}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleUpdateTempServiceQuantity(service.id, service.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="mx-2">{service.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleUpdateTempServiceQuantity(service.id, service.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveTempService(service.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                    <strong>Tổng dịch vụ:</strong>
                    <strong className="text-warning">{getTempServicesTotal().toLocaleString()} VNĐ</strong>
                  </div>
                </div>
              )}

              {/* Voucher Section */}
              <div className="mt-3 mb-3 p-3 bg-dark rounded">
                <div className="d-flex align-items-center mb-2">
                  <FaTicketAlt className="text-warning me-2" />
                  <h6 className="text-info mb-0">Mã giảm giá</h6>
                </div>
                
                {!voucherApplied ? (
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      disabled={voucherValidating}
                    />
                    <Button
                      variant="outline-warning"
                      onClick={handleApplyVoucher}
                      disabled={voucherValidating}
                    >
                      {voucherValidating ? <Spinner size="sm" /> : "Áp dụng"}
                    </Button>
                  </InputGroup>
                ) : (
                  <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-25 p-2 rounded">
                    <div>
                      <span className="text-warning fw-bold">{voucherApplied.code}</span>
                      <small className="text-light d-block">
                        Giảm {voucherApplied.discountType === "PERCENTAGE" 
                          ? `${voucherApplied.discountValue}%` 
                          : `${voucherApplied.discountValue.toLocaleString()} VNĐ`}
                      </small>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleRemoveVoucher}
                    >
                      Xóa
                    </Button>
                  </div>
                )}
                {voucherMessage && (
                  <Form.Text className={voucherApplied ? "text-success" : "text-warning"}>
                    {voucherMessage}
                  </Form.Text>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="notes" 
                  value={form.notes} 
                  onChange={handleChange} 
                  placeholder="Yêu cầu đặc biệt (nếu có)"
                />
              </Form.Group>

              {isLoggedIn && (
                <Alert variant="info" className="mt-3">
                  <i className="bi bi-info-circle"></i> Bạn đang đặt phòng với tài khoản: <strong>{form.email}</strong>
                </Alert>
              )}

              <div className="mt-3 p-3 bg-dark rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tổng tiền phòng:</span>
                  <span className="fw-bold">{originalAmount.toLocaleString()} VNĐ</span>
                </div>
                {tempServices.length > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-info">
                    <span>Dịch vụ:</span>
                    <span>+{getTempServicesTotal().toLocaleString()} VNĐ</span>
                  </div>
                )}
                {isWeekendBooking && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Giảm giá cuối tuần (10%):</span>
                    <span>-{weekendDiscountAmount.toLocaleString()} VNĐ</span>
                  </div>
                )}
                {voucherApplied && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Giảm giá voucher:</span>
                    <span>-{voucherDiscount.toLocaleString()} VNĐ</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2 border-top pt-2">
                  <span>Thành tiền:</span>
                  <span className="fw-bold">{(finalAmount + getTempServicesTotal()).toLocaleString()} VNĐ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tiền cọc (20%):</span>
                  <span className="fw-bold text-warning">{deposit.toLocaleString()} VNĐ</span>
                </div>
              </div>

              <Button 
                variant="warning" 
                type="submit" 
                className="w-100 fw-bold mt-3" 
                disabled={submitting || !deposit}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Đang xử lý...
                  </>
                ) : (
                  `Đặt cọc ${deposit.toLocaleString()} VNĐ`
                )}
              </Button>

              {currentReservationId && (
                <Button
                  variant="info"
                  className="w-100 fw-bold mt-2"
                  onClick={handleViewServices}
                >
                  <FaConciergeBell className="me-2" />
                  {showServicesList ? 'Ẩn dịch vụ đã đặt' : 'Xem dịch vụ đã đặt'}
                </Button>
              )}

              {showServicesList && currentReservationId && (
                <div className="mt-3">
                  <BookingServicesList
                    reservationId={currentReservationId}
                    onUpdate={() => setServicesUpdated(prev => !prev)}
                  />
                </div>
              )}
            </Form>
          </div>
        </Col>
      </Row>

      {/* Modal chọn dịch vụ */}
      <Modal show={showTempServicesModal} onHide={() => setShowTempServicesModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaConciergeBell className="me-2" />
            Chọn dịch vụ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingServices ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải danh sách dịch vụ...</p>
            </div>
          ) : availableServices.length === 0 ? (
            <Alert variant="info">Không có dịch vụ nào cho khách sạn này</Alert>
          ) : (
            <Row>
              {availableServices.map(service => {
                const existing = tempServices.find(s => s.id === service.id);
                const quantity = existing ? existing.quantity : 0;
                return (
                  <Col md={6} key={service.id} className="mb-3">
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        <Card.Title className="text-primary">{service.name}</Card.Title>
                        <Card.Text>
                          <strong className="text-success">
                            {service.price?.toLocaleString()} VNĐ
                          </strong>
                          <span className="text-muted ms-2">/ dịch vụ</span>
                        </Card.Text>
                        {service.description && (
                          <Card.Text className="text-muted small">
                            {service.description}
                          </Card.Text>
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          {quantity > 0 ? (
                            <div className="d-flex align-items-center">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleUpdateTempServiceQuantity(service.id, quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="mx-3 fw-bold">{quantity}</span>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleUpdateTempServiceQuantity(service.id, quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleAddTempService(service)}
                            >
                              <FaPlus className="me-1" /> Thêm
                            </Button>
                          )}
                          {quantity > 0 && (
                            <Badge bg="warning">
                              {(service.price * quantity).toLocaleString()} VNĐ
                            </Badge>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
          {tempServices.length > 0 && (
            <div className="mt-4 p-3 bg-light rounded">
              <h6 className="text-primary mb-2">Dịch vụ đã chọn:</h6>
              {tempServices.map(service => (
                <div key={service.id} className="d-flex justify-content-between mb-2">
                  <span>{service.name} x {service.quantity}</span>
                  <span className="fw-bold">{(service.price * service.quantity).toLocaleString()} VNĐ</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Tổng dịch vụ:</strong>
                <strong className="text-primary">{getTempServicesTotal().toLocaleString()} VNĐ</strong>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTempServicesModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={() => setShowTempServicesModal(false)}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingPage;