import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, FormControl } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; 
import { setSearchTerm } from '../store/searchMapsSlice';  
import axiosInstance from '../modules/axios';
import './styles/EditMapList.css';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';

interface Map {
  id: number;
  title: string;
  image_url: string;
}

const EditMapList: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const searchTerm = useSelector((state: any) => state.searchMap.searchTerm); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchMaps = async (title: string = '') => {
    try {
      const response = await axiosInstance.get('/api/maps/', {
        params: { title },
      });
      setMaps(response.data.maps || []);
    } catch (error) {
      console.error('Ошибка при загрузке карт', error);
    }
  };

  const handleEdit = (mapId: number) => {
    navigate(`/maps/edit/${mapId}`);
  };

  const handleDelete = async (mapId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту карту?')) {
      try {
        await axiosInstance.delete(`/api/maps/${mapId}/`);
        setMaps((prevMaps) => prevMaps.filter((map) => map.id !== mapId));
      } catch (error) {
        console.error('Ошибка при удалении карты', error);
      }
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchMaps(searchTerm); 
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  useEffect(() => {
    fetchMaps(searchTerm);  
  }, [searchTerm]); 

  const breadcrumbs = [
    { label: 'Карты', path: '/maps' },
    { label: 'Список карт', path: '/edit' },
  ];

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={breadcrumbs} />
      <Container className="edit-map-list1">
        <form onSubmit={handleSearch} className="search-form1">
          <Row className="justify-content-center align-items-center">
            <Col xs={12} sm={8} md={6} lg={4} className="search-field1">
              <FormControl
                type="text"
                placeholder="Поиск по названию"
                value={searchTerm}
                onChange={handleInputChange}  
                className="mb-2"
              />
            </Col>
            <Col xs="auto">
              <Button type="submit" variant="primary" className="search-button1">
                Поиск
              </Button>
            </Col>
          </Row>
        </form>

        <Row className="map-container1 mt-4">
          {maps.length > 0 ? (
            maps.map((map) => (
              <div key={map.id} className="map-row1">
                <img
                  src={map.image_url}
                  alt={map.title}
                  className="map-image1"
                />
                <div className="map-details1">
                  <h5>{map.title}</h5>
                </div>
                <div className="map-actions1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEdit(map.id)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(map.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>Нет доступных карт для редактирования.</p>
          )}
        </Row>
      </Container>
    </>
  );
};

export default EditMapList;
