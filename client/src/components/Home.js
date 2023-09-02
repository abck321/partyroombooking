import Cookies from 'js-cookie';
import jwt_decode from "jwt-decode";
import toast from "react-hot-toast";
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config'
import axios from 'axios';

import SearchBar from "./ui/SearchBar";
import BasicCard from './ui/Card';
import DatabaseLoading from './ui/DatabaseLoading';

const getPartyRoomList = async (partyRoomData) => {
    const res = await axios.post(`${API_BASE_URL}/partyroom/list`, partyRoomData);
    return res;
}

const Home = ({isAuthenticated}) => {
    const [username, setUsername] = useState("");
    const [mounted, setMounted] = useState(false);
    const [partyRooms, setPartyRooms] = useState([]);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        setMounted(true);

        return () => {
            setMounted(false);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setConnecting(true);
            const partyRoomData = {
                keyword: "",
                date: "",
                location: "",
            };
            const res = await getPartyRoomList(partyRoomData);
            setPartyRooms(res.data);
            setConnecting(false);
        };
        
        fetchData();

        if(isAuthenticated && mounted){
            const accessToken = Cookies.get('access_token');
            const decodedToken = jwt_decode(accessToken)
            
            if (decodedToken) {
              const nameClaim = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
              const nameIdentifierClaim = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
              setUsername(nameClaim);
        
            } else {
                Cookies.remove('access_token');
                toast.error("User information not found");
                return;
            }
        }
    }, [isAuthenticated, mounted]);

    const handleSearch = (keyword, date, location) => {
        const fetchData = async () => {
            const partyRoomData = {
                keyword: keyword,
                date: date,
                location: location,
            };
            const res = await getPartyRoomList(partyRoomData);
            setPartyRooms(res.data);
        };
        fetchData();
    };

    
    return ( 
        <div>
            Welcome, {isAuthenticated ? username: "guest"}
            <SearchBar onSearch={handleSearch}/>
            {partyRooms.length > 0 ? (
                partyRooms.map((partyRoom)=>(
                    <BasicCard key={partyRoom.partyRoomId} partyRoom={partyRoom}/>
                ))
            ):(
                connecting ? <DatabaseLoading loadingString="Searching Party Rooms" /> : <div>No party room found.</div>
            )}
            
        </div>
     );
}
 
export default Home;