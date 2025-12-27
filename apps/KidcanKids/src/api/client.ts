// src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://10.0.2.2:8000', // tas pats kaip tėvų app, tik nepamiršk emulator address
});
