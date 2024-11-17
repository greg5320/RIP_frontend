import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, FormControl, Container, Row, Col, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MapList.css';
import { Map } from '../modules/mapApi';
import { mockMaps } from '../modules/mockData';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';
const MapList: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const defaultImageUrl = 'http://127.0.0.1:9000/mybucket/map_not_found.png';
  const filterMaps = (title: string) => {
    if (title) {
      return mockMaps.filter(map =>
        map.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    return mockMaps;
  };

  const fetchMaps = async (title: string = '') => {
    try {
      const response = await fetch(`/maps/?title=${title}`);
      if (!response.ok) {
        throw new Error('Ошибка в получении карт');
      }
      const data = await response.json();
      if (data.maps) {
        setMaps(data.maps);
        setError(null);
      } else {
        setMaps([]);
        setError('Нет карт, соответствующих запросу');
      }
    } catch (error) {
      console.warn('Ошибка при загрузке карт, используем моковые данные');
      setMaps(filterMaps(title));
      setError('Ошибка при загрузке карт, используем моковые данные');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchTerm(query);
    fetchMaps(query);
  };

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={[{ label: "Карты", path: "/maps" }]} /> 
      <Container >
        <h3>Список карт</h3>
        <form className="find-button" onSubmit={(e) => e.preventDefault()}>
          <Row className="justify-content-center align-items-center">
            <Col xs={12} sm={8} md={6} lg={4} className="search-field">
              <FormControl
                type="text"
                placeholder="Поиск по названию"
                value={searchTerm}
                onChange={handleSearch}
                className="mb-2"
              />
            </Col>
            <Col xs="auto">
              <Button type="submit" variant="primary">
                Поиск
              </Button>
            </Col>
          </Row>
        </form>
        <Row className="map-container mt-4">
          {maps.length > 0 ? (
            maps.map((map) => (
              <Col xs={12} sm={6} md={4} lg={3} key={map.id} className="map-item mb-4">
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
