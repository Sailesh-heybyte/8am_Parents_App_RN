import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.the8am.in',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default client;

