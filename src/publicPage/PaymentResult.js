import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/apiConfig";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const allParams = Object.fromEntries(queryParams);
        
        console.log("🎯 VNPay Return Params:", allParams);
  
        const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
        const vnp_Amount = queryParams.get("vnp_Amount");
        const vnp_TransactionNo = queryParams.get("vnp_TransactionNo");
        const vnp_TxnRef = queryParams.get("vnp_TxnRef");
  
        // Gửi kết quả về backend để xử lý
        const response = await api.get("/payments/vnpay-return", { 
          params: allParams 
        });
        
        console.log("Backend response:", response.data);
        
        const result = response.data;
  
        if (result.status === "success") {
          // Thanh toán thành công
          const amount = vnp_Amount ? parseInt(vnp_Amount) / 100 : 0;
          
          setPaymentData({
            status: "success",
            message: result.message || "Thanh toán thành công!",
            amount: amount,
            transactionNo: vnp_TransactionNo,
            reservationId: result.reservationId,
            paymentId: result.paymentId
          });
        } else if (result.status === "failed") {
          // Thanh toán thất bại
          setError(result.message || "Thanh toán thất bại");
          setPaymentData({
            status: "failed",
            message: result.message || "Thanh toán thất bại"
          });
        } else {
          // Lỗi khác
          setError(result.message || "Có lỗi xảy ra");
        }
        
        setLoading(false);
  
      } catch (err) {
        console.error("Payment processing error:", err);
        
        // Xử lý lỗi network hoặc backend
        const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra";
        setError(errorMsg);
        
        // Vẫn hiển thị thông tin từ URL nếu có
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
        const vnp_Amount = queryParams.get("vnp_Amount");
        
        if (vnp_ResponseCode === "00") {
          // Nếu VNPay báo thành công nhưng backend lỗi, vẫn hiển thị thành công
          setPaymentData({
            status: "success",
            message: "Thanh toán thành công! (Vui lòng liên hệ hỗ trợ để cập nhật)",
            amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0,
            transactionNo: queryParams.get("vnp_TransactionNo"),
            warning: true
          });
          setError("");
        }
        
        setLoading(false);
      }
    };
  
    processPaymentResult();
  }, [location]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang xử lý kết quả thanh toán...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger shadow">
              <div className="card-body text-center p-5">
                <div className="text-danger mb-4">
                  <i className="fas fa-times-circle fa-5x"></i>
                </div>
                <h2 className="card-title text-danger mb-3">Thanh toán thất bại</h2>
                
                <div className="alert alert-warning text-start">
                  <p className="mb-0"><strong>Lỗi:</strong> {error}</p>
                </div>
                
                <div className="mt-4">
                  <Link to="/" className="btn btn-primary me-3">
                    <i className="fas fa-home me-2"></i>Về trang chủ
                  </Link>
                  <button 
                    onClick={() => navigate("/booking")} 
                    className="btn btn-outline-primary"
                  >
                    <i className="fas fa-redo me-2"></i>Thử lại
                  </button>
                </div>
                
                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    Cần hỗ trợ? Liên hệ: <strong>1900 1234</strong>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị kết quả thành công
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className={`card border-${paymentData?.warning ? 'warning' : 'success'} shadow`}>
            <div className="card-body text-center p-5">
              {/* Icon thành công */}
              <div className={`text-${paymentData?.warning ? 'warning' : 'success'} mb-4`}>
                <i className={`fas fa-${paymentData?.warning ? 'exclamation-triangle' : 'check-circle'} fa-5x`}></i>
              </div>
              
              {/* Tiêu đề */}
              <h2 className={`card-title text-${paymentData?.warning ? 'warning' : 'success'} mb-3`}>
                {paymentData?.warning ? 'Thanh toán có cảnh báo' : 'Thanh toán thành công!'}
              </h2>
              
              {/* Thông báo */}
              <p className="card-text text-muted mb-4">
                {paymentData?.message || "Cảm ơn bạn đã đặt phòng tại khách sạn chúng tôi."}
                {paymentData?.warning && (
                  <span className="d-block mt-2 text-warning">
                    Vui lòng liên hệ hỗ trợ để cập nhật trạng thái đặt phòng.
                  </span>
                )}
              </p>

              {/* Thông tin chi tiết */}
              <div className="bg-light rounded p-4 mb-4 text-start">
                <h5 className="mb-3">Thông tin thanh toán:</h5>
                <div className="row">
                  <div className="col-6">
                    <p className="mb-2"><strong>Số tiền:</strong></p>
                    <p className="mb-2"><strong>Mã giao dịch:</strong></p>
                    {paymentData?.reservationId && (
                      <p className="mb-2"><strong>Mã đặt phòng:</strong></p>
                    )}
                  </div>
                  <div className="col-6">
                    <p className="mb-2">{paymentData?.amount?.toLocaleString() || 0} VNĐ</p>
                    <p className="mb-2">{paymentData?.transactionNo || "N/A"}</p>
                    {paymentData?.reservationId && (
                      <p className="mb-2">{paymentData.reservationId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông báo email */}
              <div className="alert alert-info mb-4">
                <i className="fas fa-envelope me-2"></i>
                Thông tin xác nhận đã được gửi đến email của bạn.
              </div>

              {/* Các nút hành động */}
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Link to="/" className="btn btn-success btn-lg">
                  <i className="fas fa-home me-2"></i>Về trang chủ
                </Link>
                <Link to="/bookings" className="btn btn-outline-primary btn-lg">
                  <i className="fas fa-list me-2"></i>Xem đơn đặt phòng
                </Link>
                <button 
                  onClick={() => window.print()} 
                  className="btn btn-outline-secondary btn-lg"
                >
                  <i className="fas fa-print me-2"></i>In hóa đơn
                </button>
              </div>

              {/* Liên hệ hỗ trợ */}
              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  Cần hỗ trợ? Liên hệ: <strong>1900 1234</strong> hoặc 
                  email: <strong>support@hotel.com</strong>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}