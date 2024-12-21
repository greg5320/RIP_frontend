import React, { useEffect, useState } from 'react';
import { Button, Container, Row, Col, FormControl } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm } from '../store/searchMapsSlice';
import { fetchMaps, addNewMap, removeMap } from '../store/mapSlice';
import './styles/EditMapList.css';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { RootState } from '../store';
import { AppDispatch } from '../store';


const EditMapList: React.FC = () => {
  const [localSearchTerm, setLocalSearchTerm] = useState<string>('');
  const maps = useSelector((state: RootState) => state.maps.maps);
  const loading = useSelector((state: RootState) => state.maps.loading);
  const error = useSelector((state: RootState) => state.maps.error);
  const searchTerm = useSelector((state: RootState) => state.searchMap.searchTerm);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(setSearchTerm(localSearchTerm));
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(event.target.value);
  };
  const handleEdit = (mapId: number) => {
    navigate(`/maps/edit/${mapId}`);
  };
  const handleDelete = (mapId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту карту?')) {
      dispatch(removeMap(mapId));
    }
  };

  const handleAddMap = () => {
    const newMap = {
      title: 'Новая карта',
      players: '',
      tileset: '',
      status: 'active',
      description: '',
      overview: '',
      image_url: 'http://127.0.0.1:9000/mybucket/map_not_found.png',
    };

    dispatch(addNewMap(newMap));
  };

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
    dispatch(fetchMaps(searchTerm));
  }, [searchTerm, dispatch]);

  const breadcrumbs = [{ label: 'Список карт', path: '/edit' }];

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
                value={localSearchTerm}
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
          {loading ? (
            <p>Загрузка...</p>
          ) : error ? (
            <p>Ошибка: {error}</p>
          ) : maps.length > 0 ? (
            maps.map((map) => (
              <div key={map.id} className="map-row1">
                <img src={map.image_url} alt={map.title} className="map-image1" />
                <div className="map-details1">
                  <h5>{map.title}</h5>
                </div>
                <div className="map-actions1">
                  <Button variant="primary" size="sm" onClick={() => handleEdit(map.id)}>
                    Редактировать
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(map.id)}>
                    Удалить
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>Нет доступных карт для редактирования.</p>
          )}
        </Row>

        <div className="text-center mt-4">
          <Button variant="success" onClick={handleAddMap}>
            Добавить карту
          </Button>
        </div>
      </Container>
    </>
  );
};

export default EditMapList;
