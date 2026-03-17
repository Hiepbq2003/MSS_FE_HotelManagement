import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge } from 'react-bootstrap';
import { 
    FaBed, FaCalendarCheck, FaChartLine, FaConciergeBell, 
    FaWifi, FaLayerGroup, FaMoneyBillWave , FaUsers, FaSignOutAlt, FaBroom, FaTicketAlt
} from 'react-icons/fa';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import api from '../api/apiConfig';
import { toast, ToastContainer } from 'react-toastify';

const ManagerDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        maintenanceRooms: 0,
        totalAmenities: 0,
        totalServices: 0,
        totalRoomTypes: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
    });
    
    const [roomTypesData, setRoomTypesData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Gọi song song các API liên quan đến quản lý của Manager
            const [roomsRes, amenitiesRes, servicesRes, roomTypesRes] = await Promise.allSettled([
                api.get('/rooms'),
                api.get('/hotel-amenities'),
                api.get('/hotel-services'),
                api.get('/room-type')
            ]);

            let rooms = [], amenities = [], services = [], roomTypes = [];

            if (roomsRes.status === 'fulfilled' && Array.isArray(roomsRes.value)) rooms = roomsRes.value;
            if (amenitiesRes.status === 'fulfilled' && Array.isArray(amenitiesRes.value)) amenities = amenitiesRes.value;
            if (servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value)) services = servicesRes.value;
            if (roomTypesRes.status === 'fulfilled' && Array.isArray(roomTypesRes.value)) roomTypes = roomTypesRes.value;

            // Tính toán thống kê phòng
            const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').length;
            const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
            const maintenanceRooms = rooms.filter(r => r.status === 'MAINTENANCE').length;

            setStats({
                totalRooms: rooms.length,
                availableRooms,
                occupiedRooms,
                maintenanceRooms,
                totalAmenities: amenities.length,
                totalServices: services.length,
                totalRoomTypes: roomTypes.length,
                monthlyRevenue: 125000000, // Mock data: Chờ Backend API Report/Payment
                yearlyRevenue: 1450000000, // Mock data
            });

            setRoomTypesData(roomTypes.slice(0, 5)); // Lấy 5 loại phòng tiêu biểu để hiển thị

            // Mock Dữ liệu biểu đồ doanh thu theo tháng (Chờ tích hợp API thật từ Report-Service)
            setRevenueData([
                { name: 'T1', revenue: 90000000 },
                { name: 'T2', revenue: 110000000 },
                { name: 'T3', revenue: 105000000 },
                { name: 'T4', revenue: 130000000 },
                { name: 'T5', revenue: 125000000 },
                { name: 'T6', revenue: 150000000 },
                { name: 'T7', revenue: 170000000 }, // Tháng hiện tại giả định
            ]);

        } catch (error) {
            console.error("Lỗi tải dữ liệu Dashboard:", error);
            toast.error("Không thể tải đầy đủ dữ liệu thống kê.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="grow" variant="primary" />
                <span className="ms-3 text-primary fw-bold fs-5">Đang thiết lập Dashboard...</span>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 px-4 bg-light min-vh-100">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                <div>
                    <h3 className="text-dark fw-bolder mb-0">📊 Manager Overview</h3>
                    <p className="text-muted small mb-0">Theo dõi hoạt động kinh doanh và dịch vụ khách sạn</p>
                </div>
                <div className="text-end">
                    <span className="text-muted fw-bold d-block">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm">Real-time Data</Badge>
                </div>
            </div>

            {/* --- HÀNG 1: THẺ THỐNG KÊ (KPI CARDS) --- */}
            <Row className="mb-4">
                {/* Doanh thu tháng */}
                <Col xl={3} md={6} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 overflow-hidden">
                        <Card.Body className="position-relative p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted fw-bold text-uppercase" style={{fontSize: '0.8rem'}}>Doanh thu tháng này</span>
                                <div className="bg-success bg-opacity-10 p-2 rounded-3">
                                    <FaMoneyBillWave className="text-success" size={20} />
                                </div>
                            </div>
                            <h3 className="fw-bolder text-dark mb-1">
                                {stats.monthlyRevenue.toLocaleString('vi-VN')} ₫
                            </h3>
                            <span className="text-success fw-bold small"><FaChartLine /> +15.3%</span> <span className="text-muted small">so với tháng trước</span>
                            <div className="position-absolute bottom-0 start-0 w-100 bg-success" style={{height: '4px'}}></div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tổng phòng */}
                <Col xl={3} md={6} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 overflow-hidden">
                        <Card.Body className="position-relative p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted fw-bold text-uppercase" style={{fontSize: '0.8rem'}}>Tình trạng phòng</span>
                                <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                                    <FaBed className="text-primary" size={20} />
                                </div>
                            </div>
                            <h3 className="fw-bolder text-dark mb-1">
                                {stats.availableRooms} <span className="text-muted fs-5 fw-normal">/ {stats.totalRooms}</span>
                            </h3>
                            <span className="text-primary fw-bold small">Sẵn sàng đón khách</span>
                            <div className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{height: '4px'}}></div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tiện ích & Dịch vụ */}
                <Col xl={3} md={6} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 overflow-hidden">
                        <Card.Body className="position-relative p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted fw-bold text-uppercase" style={{fontSize: '0.8rem'}}>Dịch vụ & Tiện ích</span>
                                <div className="bg-info bg-opacity-10 p-2 rounded-3">
                                    <FaConciergeBell className="text-info" size={20} />
                                </div>
                            </div>
                            <h3 className="fw-bolder text-dark mb-1">
                                {stats.totalServices} <span className="text-muted fs-5 fw-normal">SV</span> | {stats.totalAmenities} <span className="text-muted fs-5 fw-normal">AM</span>
                            </h3>
                            <span className="text-info fw-bold small">Đang hoạt động tốt</span>
                            <div className="position-absolute bottom-0 start-0 w-100 bg-info" style={{height: '4px'}}></div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Loại phòng */}
                <Col xl={3} md={6} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 overflow-hidden">
                        <Card.Body className="position-relative p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted fw-bold text-uppercase" style={{fontSize: '0.8rem'}}>Hạng phòng (Room Types)</span>
                                <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                                    <FaLayerGroup className="text-warning" size={20} />
                                </div>
                            </div>
                            <h3 className="fw-bolder text-dark mb-1">
                                {stats.totalRoomTypes} <span className="text-muted fs-5 fw-normal">Hạng</span>
                            </h3>
                            <span className="text-warning fw-bold small">Đa dạng lựa chọn</span>
                            <div className="position-absolute bottom-0 start-0 w-100 bg-warning" style={{height: '4px'}}></div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- HÀNG 2: BIỂU ĐỒ & CHI TIẾT PHÒNG --- */}
            <Row>
                {/* Biểu đồ doanh thu */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100">
                        <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="fw-bolder text-dark mb-0">Biểu đồ doanh thu 7 tháng gần nhất</h5>
                                <Badge bg="light" text="dark" className="border">Năm 2024</Badge>
                            </div>
                        </Card.Header>
                        <Card.Body className="px-2">
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#198754" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#198754" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6c757d'}} dy={10} />
                                        <YAxis tickFormatter={(value) => `${value / 1000000}M`} axisLine={false} tickLine={false} tick={{fill: '#6c757d'}} />
                                        <Tooltip 
                                            formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#198754" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sơ đồ trạng thái phòng */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <Card.Body className="d-flex flex-column text-white p-4">
                            <div className="text-center mb-4 mt-3">
                                <div className="d-inline-flex bg-white bg-opacity-25 rounded-circle p-3 mb-3 shadow-sm">
                                    <FaBed size={40} className="text-white" />
                                </div>
                                <h4 className="fw-bold">Tình trạng phòng</h4>
                                <p className="opacity-75 small mb-0">Giám sát công suất phòng trực tiếp</p>
                            </div>
                            
                            <div className="mt-auto bg-white bg-opacity-10 rounded-4 p-3 shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-success rounded-circle me-2 shadow-sm" style={{width: 12, height: 12}}></div>
                                        <span className="fw-medium">Sẵn sàng (Available)</span>
                                    </div>
                                    <h4 className="mb-0 fw-bold">{stats.availableRooms}</h4>
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-danger rounded-circle me-2 shadow-sm" style={{width: 12, height: 12}}></div>
                                        <span className="fw-medium">Có khách (Occupied)</span>
                                    </div>
                                    <h4 className="mb-0 fw-bold">{stats.occupiedRooms}</h4>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-warning rounded-circle me-2 shadow-sm" style={{width: 12, height: 12}}></div>
                                        <span className="fw-medium">Bảo trì (Maintenance)</span>
                                    </div>
                                    <h4 className="mb-0 fw-bold">{stats.maintenanceRooms}</h4>
                                </div>

                                <div className="border-top border-light border-opacity-25 pt-3 d-flex justify-content-between align-items-center">
                                    <span className="text-uppercase fw-bold opacity-75 small">Tổng công suất</span>
                                    <h3 className="mb-0 fw-bolder">{stats.totalRooms} <span className="fs-6 fw-normal">Phòng</span></h3>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- HÀNG 3: BẢNG ROOM TYPES TÓM TẮT --- */}
            <Row>
                <Col xs={12}>
                    <Card className="shadow-sm border-0 rounded-4">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-2 px-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bolder text-dark mb-0">
                                <FaLayerGroup className="me-2 text-warning" /> Hạng phòng đang quản lý
                            </h5>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            <Table hover responsive borderless className="align-middle mb-0">
                                <thead className="bg-light rounded-3">
                                    <tr>
                                        <th className="py-3 text-muted text-uppercase small fw-bold">Mã Hạng</th>
                                        <th className="py-3 text-muted text-uppercase small fw-bold">Tên hạng phòng</th>
                                        <th className="py-3 text-muted text-uppercase small fw-bold text-center">Người lớn tối đa</th>
                                        <th className="py-3 text-muted text-uppercase small fw-bold text-center">Trẻ em tối đa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roomTypesData.length > 0 ? roomTypesData.map((type, idx) => (
                                        <tr key={type.id} className="border-bottom">
                                            <td className="py-3 fw-bold text-primary">{type.code}</td>
                                            <td className="py-3 fw-medium">{type.name}</td>
                                            <td className="py-3 text-center">
                                                <Badge bg="secondary" className="px-3 rounded-pill">{type.maxAdults} <FaUsers className="ms-1"/></Badge>
                                            </td>
                                            <td className="py-3 text-center">
                                                <Badge bg="light" text="dark" className="border px-3 rounded-pill">{type.maxChildren}</Badge>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">Chưa có dữ liệu hạng phòng.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
};

export default ManagerDashboard;