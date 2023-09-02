import Cookies from 'js-cookie';
import jwt_decode from "jwt-decode";
import toast from "react-hot-toast";
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config'
import axios from 'axios';

import BasicTable from './ui/BasicTable'

const getAppointmentList = async (userData) => {
    const res = await axios.post(`${API_BASE_URL}/partyroom/appointment`, userData);
    return res;
}

const MyAppointment = ({isAuthenticated}) => {
    const [mounted, setMounted] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [userId, setUserId] = useState("");
    const [loading, setLoading] = useState(false);
  
    
    useEffect(() => {
        setMounted(true);
        
        return () => {
            setMounted(false);
        };
    }, []);

    useEffect(() => {
        if(isAuthenticated && mounted){
            const accessToken = Cookies.get('access_token');
            const decodedToken = jwt_decode(accessToken)
            
            if (decodedToken) {
                const nameClaim = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
                const nameIdentifierClaim = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                setUserId(nameIdentifierClaim);

                const fetchData = async () => {
                    const userData = {
                        userId: nameIdentifierClaim,
                    };
                    const res = await getAppointmentList(userData);
                    setAppointments(res.data);
                };

                fetchData();
                
            } else {
                Cookies.remove('access_token');
                toast.error("User information not found");
                return;
            }
        }

    }, [isAuthenticated, mounted]);

    const handleConfirmBooking = (appointmentId, userId) => {
        const fetchData = async () => {
            const bookingConfirmDetail={
                appointmentId,
                userId,
            };
            setLoading(true);
            try {
                await axios.post(`${API_BASE_URL}/partyroom/bookingconfirm`, bookingConfirmDetail)
                .then((response)=>{
                    toast.success(response.data);
                    const fetchData = async () => {
                        const userData = {
                            userId,
                        };
                        const res = await getAppointmentList(userData);
                        setAppointments(res.data);
                    };
                    fetchData();
                });
            } catch (error) {
                toast.error(error.response.data);
            };
            setLoading(false);
        }
        fetchData();
    }

    const handleCancelBooking = (appointmentId, userId) => {
        const fetchData = async () => {
            const bookingCancelDetail={
                appointmentId,
                userId,
            };
            setLoading(true);
            try {
                await axios.post(`${API_BASE_URL}/partyroom/bookingcancel`, bookingCancelDetail)
                .then((response)=>{
                    toast.success(response.data);
                    const fetchData = async () => {
                        const userData = {
                            userId,
                        };
                        const res = await getAppointmentList(userData);
                        setAppointments(res.data);
                    };
                    fetchData();
                });
            } catch (error) {
                toast.error(error.response.data);
            };
            setLoading(false);
        }
        fetchData();
    }

    return ( 
        <div>
            {isAuthenticated ? (
                appointments.length > 0 ? (
                    appointments.map((appointment) => (
                        <BasicTable key={appointment.partyRoomId} appointment={appointment} userId={userId} handleConfirmBooking={handleConfirmBooking} handleCancelBooking={handleCancelBooking} loading={loading}/>
                    ))
                ) : (
                    <div>No booking yet.</div>
                )
            ) : (
                <div>Login to view</div>
            )}
        </div>
     );
}
 
export default MyAppointment;