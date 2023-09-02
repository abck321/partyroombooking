import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../config';

export const checkAuth = async () => {
  const accessToken = Cookies.get('access_token'); // Retrieve the access token from the cookie
  
  if(!accessToken) return;
  try {
    const response = await axios.get(`${API_BASE_URL}/resource`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.status === 200;

  } catch (error) {

    return false;
  }
};