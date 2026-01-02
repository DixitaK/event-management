import axios from "axios";

const API_URL = "http://localhost:5000";

export const getEvents = (params) => axios.get(`${API_URL}/events`, { params });
export const createEvent = (data) => axios.post(`${API_URL}/events`, data);
export const updateEvent = (id, data) => axios.patch(`${API_URL}/events/${id}`, data);
export const deleteEvent = (id) => axios.delete(`${API_URL}/events/${id}`);
export const getCategories = () => axios.get(`${API_URL}/categories`);
