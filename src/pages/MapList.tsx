import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, FormControl, Container, Row, Col, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MapList.css';
import { Map } from '../modules/mapApi';
import { mockMaps } from '../modules/mockData';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { RootState } from '../store';
import { setSearchTerm } from '../store/searchSlice';
import axios from 'axios';


const MapList: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [error, setError] = useState<string | null>(null);

  const defaultImageUrl = 'http://127.0.0.1:9000/mybucket/map_not_found.png';
  const navigate = useNavigate();

  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const dispatch = useDispatch();
  const filterMaps = (title: string) => {
    if (title) {
      return mockMaps.filter((map) =>
        map.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    return mockMaps;
  };
  const fetchMaps = async (title: string = '') => {
    try {
      const response = await axios.get(`/api/maps/`, {
        params: { title },
      });
      const data = response.data;
  
      if (data.maps) {
        setMaps(data.maps); // Устанавливаем карты
        setError(null); // Очищаем ошибки
      } else {
        setMaps([]);
        setError('Нет карт, соответствующих запросу');
      }
    } catch (error) {
      console.warn('Ошибка при загрузке карт, используем моковые данные');
      setMaps(filterMaps(title)); // Моковые данные
      setError('Ошибка при загрузке карт, используем моковые данные');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMaps(searchTerm); 
  }, [searchTerm]);

 
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/maps?title=${encodeURIComponent(searchTerm)}`); 
    fetchMaps(searchTerm);
  };


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={[{ label: 'Карты', path: '/maps' }]} />
      <Container>
        <h3>Список карт</h3>
        <form className="find-button" onSubmit={handleSearch}>
          <Row className="justify-content-center align-items-center">
            <Col xs={12} sm={8} md={6} lg={4} className="search-field">
              <FormControl
                type="text"
                placeholder="Поиск по названию"
                value={searchTerm} 
                onChange={handleInputChange}
                className="mb-2"
              />
            </Col>
            <Col xs="auto">
              <Button type="submit" variant="primary" className='search-button'>
                Поиск
              </Button>
            </Col>
          </Row>
        </form>
        <Row className="map-container mt-4">
          {maps.length > 0 ? (
            maps.map((map) => (
              <Col
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={map.id}
                className="map-item mb-4"
              >
                <Link to={`/maps/${map.id}`}>
                  <Image
                    src={map.image_url ? map.image_url : defaultImageUrl}
                    alt={map.title}
                    fluid
                    rounded
                    className="map-image"
                  />
                  <p>{map.title}</p>
                </Link>
              </Col>
            ))
          ) : (
            <p>{error || 'Нет доступных карт'}</p>
          )}
        </Row>
      </Container>
    </>
  );
};

export default MapList;
