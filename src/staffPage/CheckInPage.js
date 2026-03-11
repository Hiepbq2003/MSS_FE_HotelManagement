import React, { useEffect, useState } from "react";
import api from "../api/apiConfig";
import {
  Card,
  Button,
  Form,
  Container,
  Row,
  Col,
  Table,
  Spinner,
  Alert,
} from "react-bootstrap";

const CheckInPage = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [assignedRoom, setAssignedRoom] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🎯 THÊM: State cho reception info
  const [receptionInfo, setReceptionInfo] = useState({
    id: null,
    name: "",
    role: ""
  });

  // 🆕 State cho validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ✅ Helper to format datetime-local correctly for local timezone
  const formatDateTimeLocal = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const [form, setForm] = useState({
    guestName: "",
    checkInDate: formatDateTimeLocal(now),
    checkOutDate: formatDateTimeLocal(tomorrow),
    roomType: "",
    adultCount: 1,
    childCount: 0,
    phone: "",
    nationality: "",
    documentType: "CCCD",
    documentNumber: "000000",
  });

  const nations = [
    "Viet Nam",
    "Mĩ",
    "Colombia",
    "Nga",
    "Úc",
    "Hàn",
    "Nhật",
    "Trung",
    "Ấn",
    "EU",
    "Anh",
    "Các nước khác",
  ];

  const [selectedTime, setSelectedTime] = useState("12:00");

  // 🔹 Load Room Types
  useEffect(() => {
    api
      .get("/room-type/hotel/1")
      .then((res) => setRoomTypes(res))
      .catch((err) => console.error("❌ Lỗi khi tải room types:", err));
  }, []);

  // 🔹 Load reception info khi component mount
  useEffect(() => {
    const loadReceptionInfo = () => {
      const customerId = localStorage.getItem("customerId");
      const userId = localStorage.getItem("userId");
      const fullName = localStorage.getItem("fullName");
      const userRole = localStorage.getItem("userRole");
      
      const receptionId = userId;
      
      setReceptionInfo({
        id: receptionId,
        name: fullName || "Unknown Receptionist",
        role: userRole || "Unknown"
      });

      if (!receptionId) {
        console.warn("⚠️ No reception ID found in localStorage!");
      }
    };

    loadReceptionInfo();
  }, []);

  // 🔹 Load danh sách check-in hôm nay
  const fetchTodayCheckIns = async () => {
    try {
      const res = await api.get("/checkIn/today");
      setCheckIns(res || []);
      setError(null);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách check-in hôm nay:", err);
      setError("Không thể tải danh sách khách check-in hôm nay.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayCheckIns();
  }, []);

  // 🆕 VALIDATION RULES
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "guestName":
        if (!value.trim()) {
          error = "Tên khách hàng là bắt buộc";
        } else if (value.trim().length < 2) {
          error = "Tên khách hàng phải có ít nhất 2 ký tự";
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value.trim())) {
          error = "Tên khách hàng chỉ được chứa chữ cái và khoảng trắng";
        }
        break;

      case "phone":
        if (value && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(value)) {
          error = "Số điện thoại không hợp lệ (VD: 0912345678)";
        }
        break;

      case "roomType":
        if (!value) {
          error = "Vui lòng chọn loại phòng";
        }
        break;

      case "adultCount":
        if (!value || value < 1) {
          error = "Số người lớn phải lớn hơn 0";
        } else if (value > 10) {
          error = "Số người lớn không được vượt quá 10";
        }
        break;

      case "childCount":
        if (value < 0) {
          error = "Số trẻ em không được âm";
        } else if (value > 10) {
          error = "Số trẻ em không được vượt quá 10";
        }
        break;

      case "nationality":
        if (!value) {
          error = "Vui lòng chọn quốc tịch";
        }
        break;

      case "checkOutDate":
        const checkOutDate = new Date(value);
        const checkInDate = new Date(form.checkInDate);
        if (checkOutDate <= checkInDate) {
          error = "Ngày check-out phải sau ngày check-in";
        }
        break;

      default:
        break;
    }

    return error;
  };

  // 🆕 VALIDATE FORM
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(form).forEach(field => {
      if (field !== "documentNumber") { // Skip documentNumber validation
        const error = validateField(field, form[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🆕 HANDLE BLUR (when user leaves a field)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // 🆕 HANDLE CHANGE với validation real-time
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setForm(prev => ({ 
      ...prev, 
      [name]: name === "adultCount" || name === "childCount" ? parseInt(value) || 0 : value 
    }));

    // Real-time validation sau khi user đã touch field
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // 🔹 Khi chọn mốc giờ checkout
  const handleCheckoutTimeChange = (e) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);

    const dateOnly = new Date(form.checkOutDate);
    const [hour, minute] = newTime.split(":").map(Number);
    dateOnly.setHours(hour, minute, 0, 0);

    const newCheckOutDate = formatDateTimeLocal(dateOnly);
    setForm(prev => ({ ...prev, checkOutDate: newCheckOutDate }));

    // Validate checkOutDate
    if (touched.checkOutDate) {
      const error = validateField("checkOutDate", newCheckOutDate);
      setErrors(prev => ({
        ...prev,
        checkOutDate: error
      }));
    }
  };

  // 🆕 RESET FORM
  const resetForm = () => {
    setForm({
      guestName: "",
      checkInDate: formatDateTimeLocal(now),
      checkOutDate: formatDateTimeLocal(tomorrow),
      roomType: "",
      adultCount: 1,
      childCount: 0,
      phone: "",
      nationality: "",
      documentType: "CCCD",
      documentNumber: "000000",
    });
    setErrors({});
    setTouched({});
    setSelectedTime("12:00");
    setAssignedRoom(null);
  };

  // 🔹 Xử lý Check-in
  const handleCheckIn = async () => {
    // Mark all fields as touched để hiển thị tất cả errors
    const allTouched = {};
    Object.keys(form).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      alert("❌ Vui lòng kiểm tra lại thông tin trong form!");
      return;
    }

    try {
      // 🎯 LẤY RECEPTION ID
      const receptionId = receptionInfo.id;
      
      if (!receptionId) {
        alert("❌ Không tìm thấy thông tin receptionist. Vui lòng đăng nhập lại.");
        return;
      }

      const payload = {
        ...form,
        receptionId: parseInt(receptionId),
        checkInDate: new Date(form.checkInDate).toISOString(),
        checkOutDate: new Date(form.checkOutDate).toISOString(),
        email: "",
        documentNumber: "000000",
      };
      
      console.log("📤 Payload gửi lên backend:", payload);
      const res = await api.post("/checkIn/assign", payload);
      console.log("✅ Response từ backend:", res);

      if (!res) {
        alert("❌ Phản hồi rỗng từ server — kiểm tra backend!");
        return;
      }

      setAssignedRoom(res);
      alert(
        `✅ Đã nhận phòng ${res.number} (${res.type}) cho khách ${form.guestName}`
      );

      // Reset form sau khi check-in thành công
      resetForm();
      fetchTodayCheckIns(); // Refresh list
      
    } catch (err) {
      console.error("❌ Lỗi check-in:", err);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Không còn phòng trống hoặc lỗi server!";
      alert(`❌ Lỗi check-in: ${errorMessage}`);
    }
  };

  // 🆕 Helper để hiển thị error
  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : "";
  };

  // 🆕 Check if form is valid
  const isFormValid = () => {
    return form.guestName && 
           form.roomType && 
           form.checkOutDate && 
           receptionInfo.id && 
           Object.keys(errors).length === 0;
  };

  return (
    <Container className="mt-4">
      {/* 🎯 THÊM: Hiển thị thông tin receptionist */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Reception - Guest Check-in</h3>
        <div className="text-end">
          <small className="text-muted">
            Receptionist: <strong>{receptionInfo.name}</strong> 
            {receptionInfo.id && ` (ID: ${receptionInfo.id})`}
            {receptionInfo.role && ` - ${receptionInfo.role}`}
          </small>
        </div>
      </div>

      {/* ==================== FORM CHECK-IN ==================== */}
      <Card className="p-4 shadow-sm mb-5">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Guest Name *</Form.Label>
              <Form.Control
                type="text"
                name="guestName"
                value={form.guestName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Nhập tên khách hàng"
                isInvalid={!!getFieldError("guestName")}
                required
              />
              <Form.Control.Feedback type="invalid">
                {getFieldError("guestName")}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Check-in Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="checkInDate"
                value={form.checkInDate}
                readOnly
              />
              <Form.Text className="text-muted">
                Tự động set thời gian hiện tại
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Check-out Date *</Form.Label>
              <Form.Control
                type="date"
                value={form.checkOutDate.slice(0, 10)}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const date = new Date(newDate + "T" + selectedTime);
                  const newCheckOutDate = formatDateTimeLocal(date);
                  setForm(prev => ({ ...prev, checkOutDate: newCheckOutDate }));

                  // Validate
                  if (touched.checkOutDate) {
                    const error = validateField("checkOutDate", newCheckOutDate);
                    setErrors(prev => ({
                      ...prev,
                      checkOutDate: error
                    }));
                  }
                }}
                onBlur={handleBlur}
                isInvalid={!!getFieldError("checkOutDate")}
                required
              />
              <Form.Control.Feedback type="invalid">
                {getFieldError("checkOutDate")}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Checkout Time</Form.Label>
              <Form.Select
                value={selectedTime}
                onChange={handleCheckoutTimeChange}
              >
                <option value="08:00">08:00</option>
                <option value="12:00">12:00</option>
                <option value="18:00">18:00</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Adults *</Form.Label>
                  <Form.Control
                    type="number"
                    name="adultCount"
                    min="1"
                    max="10"
                    value={form.adultCount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!getFieldError("adultCount")}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError("adultCount")}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Children</Form.Label>
                  <Form.Control
                    type="number"
                    name="childCount"
                    min="0"
                    max="10"
                    value={form.childCount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!getFieldError("childCount")}
                  />
                  <Form.Control.Feedback type="invalid">
                    {getFieldError("childCount")}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Col>

          <Col lg={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Số điện thoại khách hàng (VD: 0912345678)"
                isInvalid={!!getFieldError("phone")}
              />
              <Form.Control.Feedback type="invalid">
                {getFieldError("phone")}
              </Form.Control.Feedback>
            </Form.Group>

            {/* 🎯 DOCUMENT NUMBER: ẨN HOÀN TOÀN - LUÔN GỬI 000000 */}
            <input 
              type="hidden" 
              name="documentNumber" 
              value="000000" 
            />

            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <br />
              {["CCCD", "Passport"].map((type) => (
                <Form.Check
                  key={type}
                  type="radio"
                  inline
                  name="documentType"
                  label={type}
                  value={type}
                  checked={form.documentType === type}
                  onChange={handleChange}
                  className="mb-2"
                />
              ))}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nationality *</Form.Label>
              <Form.Select
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!getFieldError("nationality")}
                required
              >
                <option value="">-- Chọn quốc tịch --</option>
                {nations.map((nation) => (
                  <option key={nation} value={nation}>
                    {nation}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {getFieldError("nationality")}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Room Type *</Form.Label>
              <Form.Select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!getFieldError("roomType")}
                required
              >
                <option value="">-- Chọn loại phòng --</option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {getFieldError("roomType")}
              </Form.Control.Feedback>
            </Form.Group>

            {/* 🎯 THÊM: Hiển thị reception info khi check-in */}
            <div className="mb-3 p-2 border rounded bg-light">
              <small>
                <strong>Receptionist:</strong> {receptionInfo.name} 
              </small>
            </div>

            <div className="d-flex gap-2">
              <Button
                onClick={handleCheckIn}
                disabled={!isFormValid()}
                variant={!receptionInfo.id ? "warning" : "primary"}
              >
                {!receptionInfo.id ? "⚠️ Chưa đăng nhập" : "Assign Room"}
              </Button>

              <Button
                variant="outline-secondary"
                onClick={resetForm}
              >
                Clear Form
              </Button>
            </div>

            {assignedRoom && (
              <div className="mt-3 p-3 border rounded bg-success text-white">
                ✅ <strong>Check-in thành công!</strong>
                <br />
                Phòng: <strong>{assignedRoom.number}</strong> ({assignedRoom.type})
                <br />
                Khách: <strong>{form.guestName}</strong>
                <br />
                Mã booking: <strong>{assignedRoom.reservationCode}</strong>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* ==================== DANH SÁCH CHECK-IN HÔM NAY ==================== */}
      <Card className="p-4 shadow-sm">
        <h3 className="mb-4 text-primary">🛎️ Guests Checked In Today</h3>

        {loading && <Spinner animation="border" />}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          checkIns.length > 0 ? (
            <Table bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Guest Name</th>
                  <th>Room Number</th>
                  <th>Room Type</th>
                  <th>Check-in Date</th>
                  <th>Check-out Date</th>
                  <th>Document Type</th>
                  <th>Document Number</th>
                </tr>
              </thead>
              <tbody>
                {checkIns.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.guestName}</td>
                    <td>{item.roomNumber}</td>
                    <td>{item.roomType}</td>
                    <td>{new Date(item.checkInDate).toLocaleString()}</td>
                    <td>{new Date(item.checkOutDate).toLocaleString()}</td>
                    <td>{item.documentType}</td>
                    <td>{item.documentNumber}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">Chưa có khách nào check-in hôm nay.</Alert>
          )
        )}
      </Card>
    </Container>
  );
};

export default CheckInPage;