import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config'
import toast from "react-hot-toast";
import { Link } from 'react-router-dom';


const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const registrationData = {
            username,
            email,
            password,
        };
        
        try {
            const response = await axios.post(`${API_BASE_URL}/user/register`, registrationData);
            toast.success(response.data)

            setUsername('');
            setEmail('');
            setPassword('');
        } catch (error) {
            toast.error(error.response.data)
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
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
                <button type="submit">Register</button>
            </form>
            <Link to="/login">Login</Link>
        </div>
    );
};

export default Register;