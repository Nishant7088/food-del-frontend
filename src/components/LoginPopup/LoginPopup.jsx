import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken, setUserName } = useContext(StoreContext);
    const [currState, setCurrState] = useState("Login");
    const [data, setData] = useState({ name: "", email: "", password: "" });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const onLogin = async (e) => {
        e.preventDefault();
        const endpoint = currState === "Login" ? "/login" : "/register";
        const response = await axios.post(`${url}/api/user${endpoint}`, data);
        if (response.data.success) {
            setToken(response.data.token);
            setUserName(response.data.name);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userName", response.data.name);
            setShowLogin(false);
            toast.success(currState === "Login" ? "Logged in successfully!" : "Account created!");
        } else {
            toast.error(response.data.message);
        }
    };

    return (
        <div className='login-popup'>
            <form className="login-popup-container" onSubmit={onLogin}>
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Sign Up" &&
                        <input name="name" onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />
                    }
                    <input name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                    <input name="password" onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                </div>
                <button type="submit">{currState === "Sign Up" ? "Create account" : "Login"}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, you agree to the terms of use &amp; privacy policy.</p>
                </div>
                {currState === "Login"
                    ? <p>New here? <span onClick={() => setCurrState('Sign Up')}>Create an account</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
                }
            </form>
        </div>
    );
};

export default LoginPopup;