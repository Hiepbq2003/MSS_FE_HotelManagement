import React, { useEffect, useState } from "react";
import { Container, Row, Col, Carousel, Button, Spinner, Alert, Card, Form, Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { 
    FaBed, FaUsers, FaArrowsAlt, FaCheckCircle, 
    FaStar, FaRegStar, FaCommentDots, FaCalendarAlt 
} from 'react-icons/fa';
import api from "../api/apiConfig";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component con hỗ trợ chọn số sao
const StarRating = ({ rating, setRating, interactive = false }) => {
    return (
        <div className="d-flex align-items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <span 
                    key={star} 
                    onClick={() => interactive && setRating(star)}
                    style={{ 
                        cursor: interactive ? 'pointer' : 'default', 
                        color: star <= rating ? '#ffc107' : '#dee2e6', 
                        fontSize: interactive ? '1.8rem' : '1.2rem',
                        marginRight: '3px'
                    }}
                >
                    {star <= rating ? <FaStar /> : <FaRegStar />}
                </span>
            ))}
        </div>
    );
};

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States cho Form đánh giá
    const [userRating, setUserRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSending, setIsSending] = useState(false);

    const DEFAULT_IMAGE_URL = "https://via.placeholder.com/1200x600?text=Room+Luxury+Image";

    // 1. Lấy thông tin phòng và danh sách đánh giá
    const fetchData = async () => {
        try {
            const [roomData, reviewsData] = await Promise.all([
                api.get(`/room-type/${id}`),
                api.get(`/reviews/room-type/${id}`)
            ]);
            setRoom(roomData);
            setReviews(reviewsData || []);
            setError(null);
        } catch (err) {
            setError("Không thể tải thông tin chi tiết. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // 2. Xử lý gửi đánh giá mới
    const handleSendReview = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            toast.warning("Vui lòng đăng nhập để gửi đánh giá!");
            return;
        }

        if (!comment.trim()) {
            toast.error("Vui lòng nhập nội dung nhận xét.");
            return;
        }

        setIsSending(true);
        try {
            await api.post('/reviews', {
                roomTypeId: id,
                customerId: userId,
                rating: userRating,
                comment: comment
            });
            toast.success("Cảm ơn bạn đã gửi đánh giá!");
            setComment("");
            setUserRating(5);
            fetchData(); // Tải lại danh sách review mới
        } catch (err) {
            toast.error("Gửi đánh giá thất bại.");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80vh" }}>
            <Spinner animation="grow" variant="primary" />
            <p className="mt-3 fw-bold text-primary">Đang tải không gian nghỉ dưỡng của bạn...</p>
        </div>
    );

    if (error || !room) return <Container className="mt-5"><Alert variant="danger">{error || "Phòng không tồn tại."}</Alert></Container>;

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <ToastContainer position="top-right" autoClose={3000} />
            
            {/* --- HEADER CHÍNH --- */}
            <div className="bg-white border-bottom py-4 mb-4 shadow-sm">
                <Container>
                    <Row className="align-items-end">
                        <Col md={8}>
                            <Badge bg="primary" className="mb-2 px-3 py-2 rounded-pill">Luxury Room</Badge>
                            <h2 className="fw-bolder mb-1">{room.name}</h2>
                            <div className="d-flex align-items-center text-muted small">
                                <StarRating rating={4.8} /> {/* Rating trung bình mẫu */}
                                <span className="ms-2">({reviews.length} đánh giá từ khách hàng)</span>
                            </div>
                        </Col>
                        <Col md={4} className="text-md-end mt-3 mt-md-0">
                            <h3 className="text-warning fw-bold mb-0">{room.basePrice?.toLocaleString()} VNĐ <small className="text-muted fs-6 fw-normal">/ đêm</small></h3>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="pb-5">
                <Row className="g-4">
                    {/* --- CỘT TRÁI: HÌNH ẢNH & THÔNG TIN --- */}
                    <Col lg={8}>
                        {/* Carousel Hình ảnh */}
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <Carousel fade>
                                <Carousel.Item>
                                    <img 
                                        className="d-block w-100" 
                                        src={room.imageUrl || DEFAULT_IMAGE_URL}
                                        style={{ height: "500px", objectFit: "cover" }} 
                                        alt={room.name} 
                                    />
                                </Carousel.Item>
                            </Carousel>
                        </Card>

                        {/* Thông số phòng (Specs) */}
                        <Row className="text-center mb-4 g-3">
                            <Col xs={4}>
                                <div className="bg-white p-3 rounded-4 shadow-sm h-100">
                                    <FaArrowsAlt size={24} className="text-primary mb-2" />
                                    <p className="mb-0 small text-muted">Diện tích</p>
                                    <span className="fw-bold">{room.size || 25} m²</span>
                                </div>
                            </Col>
                            <Col xs={4}>
                                <div className="bg-white p-3 rounded-4 shadow-sm h-100">
                                    <FaUsers size={24} className="text-primary mb-2" />
                                    <p className="mb-0 small text-muted">Sức chứa</p>
                                    <span className="fw-bold">{room.capacity} người</span>
                                </div>
                            </Col>
                            <Col xs={4}>
                                <div className="bg-white p-3 rounded-4 shadow-sm h-100">
                                    <FaBed size={24} className="text-primary mb-2" />
                                    <p className="mb-0 small text-muted">Loại giường</p>
                                    <span className="fw-bold text-truncate d-block px-2">{room.bedInfo}</span>
                                </div>
                            </Col>
                        </Row>

                        {/* Mô tả & Tiện nghi */}
                        <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h5 className="fw-bold mb-3 border-bottom pb-2">Mô tả chi tiết</h5>
                            <p className="text-secondary leading-relaxed">{room.description}</p>
                            
                            <h5 className="fw-bold mt-4 mb-3 border-bottom pb-2">Tiện nghi có sẵn</h5>
                            <Row>
                                {room.amenities?.length > 0 ? room.amenities.map((a, i) => (
                                    <Col md={4} key={i} className="mb-2">
                                        <div className="d-flex align-items-center">
                                            <FaCheckCircle className="text-success me-2" />
                                            <span>{a.name || a}</span>
                                        </div>
                                    </Col>
                                )) : <Col><p className="text-muted small">Đang cập nhật...</p></Col>}
                            </Row>
                        </Card>

                        {/* --- KHU VỰC ĐÁNH GIÁ (REVIEWS) --- */}
                        <div className="mt-5">
                            <h4 className="fw-bold mb-4 d-flex align-items-center">
                                <FaCommentDots className="me-2 text-primary" /> Nhận xét từ khách hàng ({reviews.length})
                            </h4>
                            
                            {/* Danh sách bình luận */}
                            <div className="mb-5">
                                {reviews.length > 0 ? reviews.map(rev => (
                                    <Card key={rev.id} className="border-0 shadow-sm mb-3 rounded-4">
                                        <Card.Body className="p-4">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <StarRating rating={rev.rating} />
                                                    <p className="mb-0 mt-2 fw-bold">Khách hàng ẩn danh</p>
                                                </div>
                                                <div className="text-muted small d-flex align-items-center">
                                                    <FaCalendarAlt className="me-1" /> {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                            <p className="mt-3 text-secondary italic mb-0">"{rev.comment}"</p>
                                        </Card.Body>
                                    </Card>
                                )) : (
                                    <div className="text-center py-5 bg-white rounded-4 shadow-sm text-muted">
                                        Chưa có đánh giá nào cho phòng này.
                                    </div>
                                )}
                            </div>

                            {/* Form gửi đánh giá mới */}
                            <Card className="border-0 shadow rounded-4 overflow-hidden">
                                <div className="bg-dark text-white p-3">
                                    <h5 className="mb-0">Bạn thấy phòng này thế nào?</h5>
                                </div>
                                <Card.Body className="p-4 bg-white">
                                    <Form onSubmit={handleSendReview}>
                                        <div className="mb-4 text-center">
                                            <label className="text-muted mb-2 d-block">Chọn số sao đánh giá:</label>
                                            <div className="d-inline-block p-2 rounded-pill bg-light border">
                                                <StarRating rating={userRating} setRating={setUserRating} interactive={true} />
                                            </div>
                                        </div>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold text-muted small">Cảm nghĩ của bạn</Form.Label>
                                            <Form.Control 
                                                as="textarea" 
                                                rows={4} 
                                                placeholder="Ví dụ: Phòng rất sạch sẽ, nhân viên phục vụ tận tình..." 
                                                className="border-0 bg-light p-3 rounded-4"
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            />
                                        </Form.Group>
                                        <div className="text-end">
                                            <Button 
                                                type="submit" 
                                                variant="primary" 
                                                className="px-5 py-2 fw-bold rounded-pill shadow"
                                                disabled={isSending}
                                            >
                                                {isSending ? <Spinner size="sm" className="me-2" /> : "Gửi bình luận"}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>

                    {/* --- CỘT PHẢI: BOOKING CARD (Side Card) --- */}
                    <Col lg={4}>
                        <div className="sticky-top" style={{ top: "30px", zIndex: 10 }}>
                            <Card className="border-0 shadow rounded-4 overflow-hidden">
                                <div className="bg-primary text-white p-4 text-center">
                                    <h5 className="mb-0">Thông tin đặt phòng</h5>
                                </div>
                                <Card.Body className="p-4">
                                    <ul className="list-unstyled mb-4">
                                        <li className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                            <span className="text-muted">Giá cơ bản:</span>
                                            <span className="fw-bold">{room.basePrice?.toLocaleString()} ₫</span>
                                        </li>
                                        <li className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                            <span className="text-muted">Số lượng phòng:</span>
                                            <span className="fw-bold">1 phòng</span>
                                        </li>
                                        <li className="d-flex justify-content-between">
                                            <span className="text-muted fw-bold">Tổng tạm tính:</span>
                                            <span className="h4 text-danger fw-black mb-0">{room.basePrice?.toLocaleString()} ₫</span>
                                        </li>
                                    </ul>

                                    <Button 
                                        variant="warning" 
                                        className="w-100 py-3 fw-bolder rounded-pill shadow-sm mb-3"
                                        onClick={() => navigate(`/booking/${room.id}`)}
                                    >
                                        TIẾP TỤC ĐẶT PHÒNG
                                    </Button>

                                    <div className="bg-light p-3 rounded-4 small text-muted border border-dashed border-secondary border-opacity-25">
                                        <h6 className="fw-bold mb-2">Chính sách chung:</h6>
                                        <p className="mb-1">✔️ Hủy phòng miễn phí trước 24h.</p>
                                        <p className="mb-1">✔️ Check-in: 14:00, Check-out: 12:00.</p>
                                        <p className="mb-0">✔️ Bao gồm bữa sáng và dịch vụ gym.</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default RoomDetails;