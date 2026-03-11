import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import api from "../api/apiConfig";

const BookingPage = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [requiredRooms, setRequiredRooms] = useState(1);
  const [extraDocs, setExtraDocs] = useState([]);

  const [form, setForm] = useState({
    customerId: localStorage.getItem("customerId") || "",
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
    const loadRoom = async () => {
      try {
        const data = await api.get(`/room-type/${id}`);
        setRoom(data);
      } catch (err) {
        setError("Không tải được thông tin phòng.");
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [id]);

  useEffect(() => {
    if (!room) return;
    const adult = Number(form.adultCount) || 0;
    const child = Number(form.childCount) || 0;
    const totalGuest = adult + child / 2;
    const capacity = room.capacity || 1;
    const roomsNeeded = Math.ceil(totalGuest / capacity);

    setRequiredRooms(roomsNeeded);

    if (roomsNeeded > 1) {
      setExtraDocs(Array.from({ length: roomsNeeded - 1 }, () => generateDocNumber()));
    } else {
      setExtraDocs([]);
    }
  }, [form.adultCount, form.childCount, room]);

  const generateDocNumber = () => "DOC-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

  const buildRoomsPayload = () => {
    const customerId = form.customerId || localStorage.getItem("customerId") || null;
    const rooms = [];

    for (let i = 0; i < requiredRooms; i++) {
      rooms.push({
        customerId: customerId,
        guestName: i === 0 ? form.guestName : `${form.guestName} (phòng ${i + 1})`,
        email: form.email,
        phone: form.phone,
        nationality: form.nationality,
        documentType: i === 0 ? form.documentType : "",
        documentNumber: i === 0 ? form.documentNumber || generateDocNumber() : extraDocs[i - 1],
        adultCount: parseInt(form.adultCount || "1", 10),
        childCount: parseInt(form.childCount || "0", 10),
        notes: form.notes,
      });
    }

    return rooms;
  };

  const toLocalDateTime = (d) => (d ? `${d}T00:00:00` : null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      localStorage.setItem("guestName", form.guestName);
      localStorage.setItem("email", form.email);
      localStorage.setItem("phone", form.phone);
      localStorage.setItem("customerId", form.customerId);

      const body = {
        roomType: room.code,
        checkInDate: toLocalDateTime(form.checkInDate),
        checkOutDate: toLocalDateTime(form.checkOutDate),
        guestName: form.guestName,
        rooms: buildRoomsPayload(),
      };

      console.log("Request body:", JSON.stringify(body, null, 2));

      const res = await api.post("/booking", body);
      
      // FIX: Lấy reservationId từ response data đúng cách
      const reservationId = res.data?.reservationId || res.data?.id || res?.reservationId || res?.id;

      console.log("Full response:", res);
      console.log("Reservation ID:", reservationId);

      if (!reservationId) {
        console.error("Response structure:", res);
        throw new Error("Không lấy được reservationId từ server. Response: " + JSON.stringify(res.data));
      }

      const mainRoomDoc = body.rooms[0]?.documentNumber || "Không có mã";
      const nights =
        (new Date(form.checkOutDate) - new Date(form.checkInDate)) /
          (1000 * 60 * 60 * 24) || 1;
      const deposit = room.basePrice * nights * 23000 * 0.2;

      setSuccess(
        <>
          <p>Đặt phòng thành công!</p>
          <p>
            Mã phòng chính: <strong>{mainRoomDoc}</strong>
          </p>
          <p>
            Tiền cọc (20%): <strong>{deposit.toLocaleString()} VNĐ</strong>
          </p>
          <p>Đang chuyển sang VNPay...</p>
        </>
      );

      // Thêm delay để hiển thị thông báo thành công
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentResp = await api.post("/payment/create-vnpay", {
        reservationId,
      });
      
      // FIX: Lấy VNPay URL đúng cách
      const vnpUrl = paymentResp?.data?.vnpayUrl || paymentResp?.vnpayUrl;

      console.log("Payment response:", paymentResp);
      console.log("VNPay URL:", vnpUrl);

      if (!vnpUrl) {
        throw new Error("Không tạo được VNPay URL. Response: " + JSON.stringify(paymentResp.data));
      }

      window.location.assign(vnpUrl);

    } catch (err) {
      console.error("Booking error:", err);
      setError("Đặt phòng thất bại: " + (err.response?.data?.message || err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  if (!room) return <Alert variant="danger">Không tìm thấy loại phòng.</Alert>;

  return (
    <Container style={{ paddingTop: 40, paddingBottom: 40 }}>
      <Row>
        <Col md={7}>
          <h3 className="fw-bold">{room.name}</h3>
          <p style={{ color: "#666" }}>{room.description}</p>
          <p><strong>Giá:</strong> {(room.basePrice * 23000).toLocaleString()} VNĐ/đêm</p>
          <p><strong>Sức chứa:</strong> {room.capacity} người lớn</p>
          <p><strong>Giường:</strong> {room.bedInfo}</p>

          {requiredRooms > 1 && (
            <Alert variant="warning">
              Số khách vượt sức chứa 1 phòng. Hệ thống tự động đặt {requiredRooms} phòng.
            </Alert>
          )}
        </Col>

        <Col md={5}>
          <div style={{ background: "#1f1f1f", padding: 25, borderRadius: 10, color: "#fff" }}>
            <h4 className="text-warning fw-bold mb-3">Thông tin đặt phòng</h4>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <h5 className="text-info fw-bold mb-3">Phòng 1</h5>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày nhận phòng</Form.Label>
                    <Form.Control type="date" name="checkInDate" value={form.checkInDate} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày trả phòng</Form.Label>
                    <Form.Control type="date" name="checkOutDate" value={form.checkOutDate} onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Người lớn</Form.Label>
                    <Form.Control type="number" min="1" name="adultCount" value={form.adultCount} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Trẻ em</Form.Label>
                    <Form.Control type="number" min="0" name="childCount" value={form.childCount} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control as="textarea" rows={3} name="notes" value={form.notes} onChange={handleChange} />
              </Form.Group>

              {requiredRooms > 1 &&
                extraDocs.map((doc, index) => (
                  <div key={index} className="mt-4 p-3" style={{ background: "#333", borderRadius: 8 }}>
                    <h5 className="text-warning">Phòng {index + 2}</h5>
                    <p>Mã tự sinh: {doc}</p>
                  </div>
                ))}

              <Button variant="warning" type="submit" className="w-100 fw-bold" disabled={submitting}>
                {submitting ? "Đang xử lý..." : "Hoàn tất đặt phòng"}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingPage;
