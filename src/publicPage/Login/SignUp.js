import React, { useState } from "react";
import './Login.css';
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn } from "react-icons/fa";
import api from "../../api/apiConfig"; 

function SignUpForm({ onRegisterSuccess }) { 
    const [state, setState] = useState({ 
        name: "", 
        email: "", 
        password: "",
        phone: "" 
    });
    const [error, setError] = useState(null); 
    const handleChange = (evt) => {
        setState({ ...state, [evt.target.name]: evt.target.value });
    };

    const handleOnSubmit = async (evt) => {
        evt.preventDefault();
        setError(null); 

        try {
            const requestBody = {
                fullName: state.name, 
                email: state.email,
                password: state.password,
                phone: state.phone || "" 
            };

            await api.post("/auth/register", requestBody);
            
            setState({ name: "", email: "", password: "", phone: "" });
            
            if (onRegisterSuccess) {
                onRegisterSuccess(); 
            }

        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            
            // Xử lý lỗi trả về từ Backend (ví dụ: "Email đã tồn tại.")
            if (err.message) {
                setError(err.message); 
            } else if (err.response && err.response.data) {
     
                setError(err.response.data);
            } else {
                setError("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin và kết nối mạng.");
            }
        }
    };

    return (
        <div className="form-container sign-up-container">
            <form onSubmit={handleOnSubmit}>
                <h1>Create Account</h1>

                <div className="social-container">
                    <a href="#"><FaFacebookF /></a>
                    <a href="#"><FaGooglePlusG /></a>
                    <a href="#"><FaLinkedinIn /></a>
                </div>

                <span>or use your email for registration</span>
                
                {/* Hiển thị lỗi */}
                {error && <p style={{ color: 'red', margin: '10px 0', fontSize: '14px' }}>{error}</p>}

                <input 
                    type="text" 
                    name="name" 
                    value={state.name} 
                    onChange={handleChange} 
                    placeholder="Full Name" 
                    required 
                />
                <input 
                    type="email" 
                    name="email" 
                    value={state.email} 
                    onChange={handleChange} 
                    placeholder="Email" 
                    required 
                />
                <input 
                    type="password" 
                    name="password" 
                    value={state.password} 
                    onChange={handleChange} 
                    placeholder="Password" 
                    required
                />
                
                <input 
                    type="text" 
                    name="phone" 
                    value={state.phone} 
                    onChange={handleChange} 
                    placeholder="Phone Number" 
                />

                <button type="submit" className="sign">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUpForm;