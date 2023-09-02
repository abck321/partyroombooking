import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config'
import axios from 'axios';

import Calendar from './ui/Calendar/Calendar'
import Timeslot from './ui/Timeslot'

const getPartyRoomDetail = async (idData) => {
    const res = await axios.post(`${API_BASE_URL}/partyroom/detail`, idData);
    return res;
}

const PartyRoomBooking = ({ isAuthenticated }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const [partyRoomData, setPartyRoomData] = useState("");
    const [isError, setIsError] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");

    useEffect(() => {
        const fetchData = async () => {
        try {
            const idData = {
            id: id,
            };
            const res = await getPartyRoomDetail(idData);
            setPartyRoomData(res.data);
        } catch (error) {
            setIsError(true);
        }
        };

        if (id) {
            fetchData();
        }
    },[id])

    if (!id || !partyRoomData) {
        return <div>No such party room.</div>;
    }

    if (isError) {
        return <div>No party room found.</div>;
    }

    const handleButtonClick = (buttonDate) => {
        setSelectedDate(buttonDate);
    };
    
    return ( 
        <div>
            <div>Party Room name: {partyRoomData.name}</div>
            <div>Location: {partyRoomData.location}</div>
            <div>Description: {partyRoomData.description}</div>
            <div>PartyRoomCalendar</div>
            <Calendar partyRoomId={id} onButtonClick={handleButtonClick}/>
            {selectedDate && <Timeslot partyRoomId={id} selectedDate={selectedDate} isAuthenticated={isAuthenticated}/>}
        </div>
     );
}
 
export default PartyRoomBooking;