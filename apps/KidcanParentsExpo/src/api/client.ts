import axios from "axios";
import Constants from "expo-constants";

const { API_BASE_URL } = Constants.expoConfig?.extra ?? {};

export const api = axios.create({
  baseURL: API_BASE_URL,
});
