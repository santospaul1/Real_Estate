import axios from 'axios';

const API_URL = 'http://localhost:8000/api/agentprofiles/';

const getAll = () => axios.get(API_URL);

export default { getAll };
