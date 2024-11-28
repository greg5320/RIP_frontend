import { mockMaps } from './mockData';
// import axios from 'axios';
import axiosInstance from '../modules/axios'; 
export interface Map {
  id: number;
  title: string;
  description: string;
  status: string;
  image_url: string;
  players: string;
  tileset: string;
  overview: string;
}

export interface MapPool {
  id: number;
  status: string;
  player_login: string;
  creation_date: string;
  submit_date?: string;
  complete_date?: string;
  popularity?: number;
  maps: Map[];
}

// const BASE_URL = 'http://localhost:8000';


export const fetchMapById = async (id: number): Promise<Map> => {
  try {
    const response = await axiosInstance.get(`/api/maps/${id}/`);
    return response.data;
  } catch (error) {
    console.warn('Ошибка при получении карты, используем моковые данные:', error);
    return mockMaps.find(map => map.id === id) || mockMaps[0];  
  }
};