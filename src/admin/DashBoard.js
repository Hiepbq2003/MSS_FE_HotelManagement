import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Badge, Button } from 'react-bootstrap';
import { 
    FaBed, FaUsers, FaUserTie, FaTicketAlt, 
    FaBroom, FaClipboardCheck, FaExclamationCircle 
} from 'react-icons/fa';
import { 
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../api/apiConfig';
import { toast, ToastContainer } from 'react-toastify';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStaff: 0,
        totalCustomers: 0,
        totalVouchers: 0,
        activeVouchers: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
    });
    
    const [roomStatusData, setRoomStatusData] = useState([]);
    const [recentTasks, setRecentTasks] = useState([]);

    // Màu sắc cho biểu đồ tròn (Trạng thái phòng)
    const COLORS = {
        AVAILABLE: '#198754', // Xanh lá
        OCCUPIED: '#dc3545',  // Đỏ
        MAINTENANCE: '#ffc107', // Vàng
        OUT_OF_SERVICE: '#6c757d' // Xám
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [staffRes, customerRes, voucherRes, roomRes, taskRes] = await Promise.allSettled([
                api.get('/user/staff'),
                api.get('/customers'),
                api.get('/vouchers'),
                api.get('/rooms'),
                api.get('/tasks/housekeeping')
            ]);

            let staff = [], customers = [], vouchers = [], rooms = [], tasks = [];

            if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value)) staff = staffRes.value;
            if (customerRes.status === 'fulfilled' && Array.isArray(customerRes.value)) customers = customerRes.value;
            if (voucherRes.status === 'fulfilled' && Array.isArray(voucherRes.value)) vouchers = voucherRes.value;
            if (roomRes.status === 'fulfilled' && Array.isArray(roomRes.value)) rooms = roomRes.value;
            if (taskRes.status === 'fulfilled' && Array.isArray(taskRes.value)) tasks = taskRes.value;

            // --- Xử lý Dữ liệu ---
            const available = rooms.filter(r => r.status === 'AVAILABLE').length;
            const occupied = rooms.filter(r => r.status === 'OCCUPIED').length;
            const maintenance = rooms.filter(r => r.status === 'MAINTENANCE').length;
            
            setRoomStatusData([
                { name: 'Sẵn sàng', value: available, status: 'AVAILABLE' },
                { name: 'Đang có khách', value: occupied, status: 'OCCUPIED' },
                { name: 'Đang bảo trì', value: maintenance, status: 'MAINTENANCE' },
            ]);

            setStats({
                totalStaff: staff.length,
                totalCustomers: customers.length,
                totalVouchers: vouchers.length,
                activeVouchers: vouchers.filter(v => v.status === 'ACTIVE').length,
                pendingTasks: tasks.filter(t => t.status === 'PENDING').length,
                inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
            });

            // Lấy 6 task chưa hoàn thành mới nhất để Admin theo dõi và nhắc nhở
            const activeTasks = tasks.filter(t => t.status !== 'COMPLETED').reverse().slice(0, 6);
            setRecentTasks(activeTasks);

        } catch (error) {
            console.error("Lỗi tải dữ liệu Admin Dashboard:", error);
            toast.error("Không thể tải đầy đủ dữ liệu thống kê.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Custom Label cho PieChart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
        return percent > 0 ? (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    if (loading) {
        return (
            <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
                <h5 className="mt-3 text-danger fw-bold">Đang tải dữ liệu Quản trị...</h5>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 px-4 bg-light min-vh-100">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-2 border-danger border-opacity-25">
                <div>
                    <h3 className="text-dark fw-black mb-0"><FaUserTie className="me-2 text-danger" /> Admin Control Panel</h3>
                    <p className="text-muted small mb-0 mt-1">Hệ thống giám sát tổng thể khách sạn</p>
                </div>
                <Button variant="outline-danger" onClick={fetchDashboardData}>
                    <i className="bi bi-arrow-clockwise"></i> Làm mới dữ liệu
                </Button>
            </div>

            {/* --- HÀNG 1: THẺ THỐNG KÊ TỔNG QUAN --- */}
            <Row className="mb-4">
                {/* Staff */}
                <Col xl={3} md={6} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 border-start border-primary border-4">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted fw-bold text-uppercase small mb-2">Nhân sự (Staff)</div>
                                <h2 className="fw-bolder text-dark mb-0">{stats.totalStaff} <span className="fs-6 fw-normal text-muted">Người</span></h2>
                            </div>
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                                <FaUserTie className="text-primary" size={28} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Customers */}
                <Col xl={3} md={6} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 border-start border-success border-4">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted fw-bold text-uppercase small mb-2">Tài khoản Khách</div>
                                <h2 className="fw-bolder text-dark mb-0">{stats.totalCustomers} <span className="fs-6 fw-normal text-muted">User</span></h2>
                            </div>
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                                <FaUsers className="text-success" size={28} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Vouchers */}
                <Col xl={3} md={6} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 border-start border-info border-4">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted fw-bold text-uppercase small mb-2">Voucher khả dụng</div>
                                <h2 className="fw-bolder text-dark mb-0">{stats.activeVouchers} <span className="fs-6 fw-normal text-muted">/ {stats.totalVouchers} Mã</span></h2>
                            </div>
                            <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                                <FaTicketAlt className="text-info" size={28} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Pending Tasks */}
                <Col xl={3} md={6} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100 border-start border-warning border-4">
                        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                            <div>
                                <div className="text-muted fw-bold text-uppercase small mb-2">Task đang chờ</div>
                                <h2 className="fw-bolder text-dark mb-0">{stats.pendingTasks} <span className="fs-6 fw-normal text-muted">Việc</span></h2>
                            </div>
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                                <FaExclamationCircle className="text-warning" size={28} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- HÀNG 2: PHÂN TÍCH PHÒNG & TASK --- */}
            <Row className="mb-4">
                {/* Biểu đồ trạng thái phòng */}
                <Col lg={5} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100">
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                            <h5 className="fw-bold mb-0"><FaBed className="me-2 text-primary"/> Sơ đồ Trạng thái Phòng</h5>
                            <p className="text-muted small mt-1 mb-0">Hỗ trợ phân bổ nhân sự dọn dẹp</p>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={roomStatusData}
                                            cx="50%" cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={100}
                                            innerRadius={40}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {roomStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => [`${value} Phòng`, 'Số lượng']} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <Button as={Link} to="/admin/housekeeping-management" variant="danger" className="w-100 mt-3 fw-bold rounded-pill shadow-sm">
                                Phân công dọn dẹp ngay <i className="bi bi-arrow-right ms-1"></i>
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Danh sách Task đang chờ / Đang làm */}
                <Col lg={7} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 h-100">
                        <Card.Header className="bg-white border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold mb-0"><FaBroom className="me-2 text-warning"/> Tiến độ công việc (Housekeeping)</h5>
                                <span className="badge bg-danger mt-2">{stats.pendingTasks} Chờ xử lý</span>
                                <span className="badge bg-info ms-2 mt-2">{stats.inProgressTasks} Đang làm</span>
                            </div>
                        </Card.Header>
                        <Card.Body className="px-4 pb-4">
                            <Table responsive hover borderless className="align-middle">
                                <thead className="border-bottom border-light border-2">
                                    <tr>
                                        <th className="text-muted small text-uppercase pb-3">Phòng</th>
                                        <th className="text-muted small text-uppercase pb-3">Loại việc</th>
                                        <th className="text-muted small text-uppercase pb-3 text-center">Độ ưu tiên</th>
                                        <th className="text-muted small text-uppercase pb-3 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTasks.length > 0 ? recentTasks.map((task) => (
                                        <tr key={task.id} className="border-bottom border-light">
                                            <td className="py-3">
                                                <div className="fw-bold text-dark">Phòng {task.roomNumber}</div>
                                            </td>
                                            <td className="py-3 fw-medium">{task.type}</td>
                                            <td className="py-3 text-center">
                                                <Badge bg={task.priority === 'HIGH' ? 'danger' : task.priority === 'NORMAL' ? 'primary' : 'secondary'} className="px-3 rounded-pill py-2">
                                                    {task.priority === 'HIGH' ? 'Gấp' : 'Bình thường'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-center">
                                                <Badge bg={task.status === 'PENDING' ? 'warning' : 'info'} className={task.status === 'PENDING' ? 'text-dark px-3 rounded-pill py-2' : 'px-3 rounded-pill py-2'}>
                                                    {task.status === 'PENDING' ? 'Chờ nhận' : 'Đang dọn'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">
                                                <FaClipboardCheck size={40} className="mb-3 opacity-50" /><br/>
                                                Tất cả công việc đã hoàn thành!
                                            </td>
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

export default AdminDashboard;