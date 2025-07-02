import axios from "axios";
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
const apiKey = Constants.expoConfig?.extra?.apiKey;

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const api = axios.create({
  baseURL: apiUrl,
  params: {
    apikey: apiKey,
  },
});
