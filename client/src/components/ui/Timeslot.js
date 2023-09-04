import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import jwt_decode from "jwt-decode";
import { API_BASE_URL } from '../../config'
import axios from 'axios';
import toast from "react-hot-toast";
import { Link } from 'react-router-dom';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Button, Checkbox } from "@mui/material";
import DatabaseLoading from './DatabaseLoading';

const timeslots = [
    { label: "00:00 to 01:00", startTime: "00:00", endTime: "01:00" },
    { label: "01:00 to 02:00", startTime: "01:00", endTime: "02:00" },
    { label: "02:00 to 03:00", startTime: "02:00", endTime: "03:00" },
    { label: "03:00 to 04:00", startTime: "03:00", endTime: "04:00" },
    { label: "04:00 to 05:00", startTime: "04:00", endTime: "05:00" },
    { label: "05:00 to 06:00", startTime: "05:00", endTime: "06:00" },
    { label: "06:00 to 07:00", startTime: "06:00", endTime: "07:00" },
    { label: "07:00 to 08:00", startTime: "07:00", endTime: "08:00" },
    { label: "08:00 to 09:00", startTime: "08:00", endTime: "09:00" },
    { label: "09:00 to 10:00", startTime: "09:00", endTime: "10:00" },
    { label: "10:00 to 11:00", startTime: "10:00", endTime: "11:00" },
    { label: "11:00 to 12:00", startTime: "11:00", endTime: "12:00" },
    { label: "12:00 to 13:00", startTime: "12:00", endTime: "13:00" },
    { label: "13:00 to 14:00", startTime: "13:00", endTime: "14:00" },
    { label: "14:00 to 15:00", startTime: "14:00", endTime: "15:00" },
    { label: "15:00 to 16:00", startTime: "15:00", endTime: "16:00" },
    { label: "16:00 to 17:00", startTime: "16:00", endTime: "17:00" },
    { label: "17:00 to 18:00", startTime: "17:00", endTime: "18:00" },
    { label: "18:00 to 19:00", startTime: "18:00", endTime: "19:00" },
    { label: "19:00 to 20:00", startTime: "19:00", endTime: "20:00" },
    { label: "20:00 to 21:00", startTime: "20:00", endTime: "21:00" },
    { label: "21:00 to 22:00", startTime: "21:00", endTime: "22:00" },
    { label: "22:00 to 23:00", startTime: "22:00", endTime: "23:00" },
    { label: "23:00 to 24:00", startTime: "23:00", endTime: "24:00" },
];


const Timeslot = ({ partyRoomId, selectedDate, isAuthenticated, loading, setLoading }) => {
    const [checkedList, setCheckedList] = useState([]);
    const [disabledList, setDisabledList] = useState([]);

    const [userId, setUserId] = useState("");
    const [mounted, setMounted] = useState(false);

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
        
            } else {
                Cookies.remove('access_token');
                toast.error("User information not found");
                return;
            }
        }
    }, [isAuthenticated, mounted]);
  
    const handleCheckboxDisabled = async (startTime) => {
      const partyRoomData = {
        partyRoomId,
        selectedDate,
        startTime,
      };
      const res = await axios.post(`${API_BASE_URL}/partyroom/checkboxdisable`, partyRoomData);
      return res.data;
    };
  
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const promises = timeslots.map((timeslot) => {
            return handleCheckboxDisabled(timeslot.startTime);
            });
  
            const results = await Promise.all(promises);
            setCheckedList([]);
            const updatedDisabledList = timeslots.filter((_, index) => results[index]);
            
            setDisabledList(updatedDisabledList);
            setLoading(false);
        };
  
        fetchData();
    }, [partyRoomId, selectedDate]);
  
    const handleCheckboxChange = (timeslot, isChecked) => {
      if (isChecked) {
        setCheckedList((prevCheckedList) => [...prevCheckedList, timeslot]);
      } else {
        setCheckedList((prevCheckedList) =>
          prevCheckedList.filter((element) => element !== timeslot)
        );
      }
    };

    const handleBooking = () => {
        if(checkedList.length === 0) {
            toast.error("You need to select at least one timeslot.");
            return;
        }
        const fetchData = async () => {
            const bookingDetail={
                partyRoomId,
                userId,
                selectedDate,
                checkedList,
            }
            setLoading(true);
            try {
                await axios.post(`${API_BASE_URL}/partyroom/booking`, bookingDetail)
                .then((response)=>{
                    toast.success(response.data);
                    const fetchData = async () => {
                        const promises = timeslots.map((timeslot) => {
                        return handleCheckboxDisabled(timeslot.startTime);
                        });
              
                        const results = await Promise.all(promises);
                        setCheckedList([]);
                        const updatedDisabledList = timeslots.filter((_, index) => results[index]);
                        
                        setDisabledList(updatedDisabledList);
                        
                    };
                    
                    fetchData();
                });
            } catch (error) {
                toast.error(error.response.data);
            }
            setLoading(false);
        };
        fetchData();
    };
  
    return (
        <div>
            <h3>Selected Date: {selectedDate}</h3>
            <h5>Available timeslots:</h5>
            {loading && <DatabaseLoading loadingString="Loading Timeslots" />}
            {!loading &&
                <div>
                    <FormGroup row>
                        {timeslots.map((timeslot) => (
                            <FormControlLabel
                            key={timeslot.startTime}
                            control={
                                <Checkbox
                                checked={checkedList.includes(timeslot)}
                                onChange={(e) => handleCheckboxChange(timeslot, e.target.checked)}
                                />
                            }
                            label={timeslot.label}
                            disabled={disabledList.includes(timeslot)}
                            />
                        ))}
                    </FormGroup>
                    {isAuthenticated ? <Button onClick={handleBooking} disabled={loading}>Book now</Button> : <Link to="/login"><Button>Login to book</Button></Link>}
                </div>
            }
        </div>
    );
};
  
export default Timeslot;