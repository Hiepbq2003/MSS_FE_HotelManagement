import React, { useState } from "react";
import "./Login.css";
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn } from "react-icons/fa";
import api from "../../api/apiConfig";

function SignInForm({ onLoginSuccess, onForgotPasswordClick }) {
  const [state, setState] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (evt) => {
    setState({ ...state, [evt.target.name]: evt.target.value });
  };

  const handleLoginSuccess = (loginData) => {
    // Trích xuất dữ liệu từ phản hồi thành công của server
    const { token, role, email, fullName, phone, id, userId: staffId } = loginData; 
    const finalId = id || staffId || "";
    
    // Lưu thông tin mới vào storage
    localStorage.setItem("userId", finalId);     
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("email", email);
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("phone", phone);
  
    if (onLoginSuccess) {
      onLoginSuccess(role);
    }
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    setError(null);
    setLoading(true);

    // BƯỚC 1: Xóa sạch dữ liệu cũ để tránh lỗi 403 Forbidden do Token cũ gây ra
    localStorage.clear(); 
  
    // BƯỚC 2: Cấu hình Payload với key là 'username' để khớp với Backend
    const loginPayload = {
      username: state.email, // Sử dụng giá trị từ input email nhưng gửi đi dưới tên 'username'
      password: state.password,
    };
  
    try {
      // 3. Thử đăng nhập quyền Staff trước
      console.log("Đang thử đăng nhập Staff...");
      const response = await api.post("/auth/staff/login", loginPayload);
      console.log("✅ Đăng nhập Staff thành công.");
      handleLoginSuccess(response);

    } catch (errStaff) {
      // 4. Nếu Staff lỗi, tự động thử sang User
      console.warn("Staff login không khớp, đang thử đăng nhập User...");
      
      try {
        const response = await api.post("/auth/login", loginPayload);
        console.log("✅ Đăng nhập User thành công.");
        handleLoginSuccess(response);

      } catch (errUser) {
        // Lấy thông tin lỗi thực tế từ JSON trả về của server (ví dụ: "Sai tài khoản hoặc mật khẩu!")
        console.error("Lỗi đăng nhập:", errUser);
        const errorMessage = errUser?.message || "Sai tài khoản hoặc mật khẩu!";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      // Xóa mật khẩu sau khi xử lý xong để bảo mật
      setState(prev => ({ ...prev, password: "" }));
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <div className="social-container">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaGooglePlusG /></a>
          <a href="#"><FaLinkedinIn /></a>
        </div>
        <span>or use your account</span>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <p style={{ 
            color: "white", 
            backgroundColor: "#ff4b2b", 
            padding: "8px", 
            borderRadius: "4px", 
            fontSize: "13px", 
            margin: "10px 0",
            width: "100%"
          }}>
            {error}
          </p>
        )}

        <input 
          type="email" 
          name="email" 
          value={state.email} 
          onChange={handleChange} 
          placeholder="Email" 
          required 
          disabled={loading}
        />
        <input 
          type="password" 
          name="password" 
          value={state.password} 
          onChange={handleChange} 
          placeholder="Password" 
          required 
          disabled={loading}
        />
        
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onForgotPasswordClick(); }} 
          style={{ cursor: "pointer", color: "#333" }}
        >
          Forgot your password?
        </a>

        <button type="submit" className="sign" disabled={loading}>
          {loading ? "Logging in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default SignInForm;