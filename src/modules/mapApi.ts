import { mockMaps } from './mockData';

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

const BASE_URL = 'http://localhost:8000';


export const fetchMaps = async (): Promise<Map[]> => {
  try {
    const response = await fetch(`${BASE_URL}/maps/`);
    if (!response.ok) {
      throw new Error('Ошибка в получении карт');
    }
    const data = await response.json();
    if (data.maps) {
      return data.maps;
    } else {
      throw new Error('Нет карт в ответе');
    }
  } catch (error) {
    console.warn('Не удалось получить карты с бекенда, используем моковые данные:', error);
    return mockMaps;
  }
};

export const fetchMapById = async (id: number): Promise<Map> => {
  const url = `${BASE_URL}/maps/${id}/`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка в получении карты');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    console.warn('Ошибка при получении карты, используем моковые данные:', error);
    return mockMaps.find(map => map.id === id) || mockMaps[0];  
  }
};
