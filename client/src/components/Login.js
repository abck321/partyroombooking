import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config'
import toast from "react-hot-toast";
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginData = {
            email,
            password,
        };
        
        try {
            const response = await axios.post(`${API_BASE_URL}/user/login`, loginData);

            const { access_token, expires_in } = response.data;
            Cookies.set('access_token', access_token, { expires: new Date(expires_in) });
            toast.success("Login successfully")
            
            setEmail('');
            setPassword('');
            window.location.replace('/');
        } catch (error) {
            toast.error(error.response.data)
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <Link to="/register">Register</Link>
        </div>
    );
};

export default Login;