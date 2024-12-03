import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MapPoolList.css';
import { RootState } from '../store';
import axiosInstance from '../modules/axios';
import { Map } from '../modules/mapApi';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';

interface MapPool {
  id: number;
  status: string;
  player_login: string | null;
  popularity: number | null;
  creation_date: string;
  submit_date: string | null;
  complete_date: string | null;
  user_login: string;
  moderator_login: string | null;
  maps: Array<{
    map: Map;
    position: number;
  }>;
}

const MapPoolList: React.FC = () => {
  const [mapPools, setMapPools] = useState<MapPool[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [playerLogin, setPlayerLogin] = useState<string>(''); 
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const fetchMapPools = async () => {
    try {
      const response = await axiosInstance.get('/api/map_pools/', { withCredentials: true });
      setMapPools(response.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки пулов карт:', error);
      setError('Не удалось загрузить пулы карт.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMapPools();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const deleteMapFromDraft = async (mapId: number, poolId: number) => {
    try {
      await axiosInstance.delete(`/api/map_pools/${poolId}/map/${mapId}/`);
      fetchMapPools();
    } catch (error) {
      console.error('Ошибка при удалении карты:', error);
    }
  };

  const savePlayerLogin = async (poolId: number) => {
    try {
      await axiosInstance.put(`/api/map_pools/${poolId}/`, {
        player_login: playerLogin,
      });
      fetchMapPools();
      setSuccessMessage('Логин игрока успешно сохранен!');
      setError(null);
    } catch (error) {
      console.error('Ошибка при сохранении логина игрока:', error);
      setError('Не удалось сохранить логин игрока.');
      setSuccessMessage(null);
    }
  };

  const submitMapPool = async (poolId: number) => {
    try {
      await axiosInstance.put(`/api/map_pools/${poolId}/submit/`, {}, { withCredentials: true });
      fetchMapPools();
      setSuccessMessage('Заявка успешно подтверждена!');
      setError(null);
    } catch (error) {
      console.error('Ошибка при подтверждении заявки:', error);
      setError('Не удалось подтвердить заявку.');
      setSuccessMessage(null);
    }
  };

  const sortedMapPools = [...mapPools].sort((a, b) => {
    if (a.status === 'draft') return -1;
    if (b.status === 'draft') return 1;
    return 0;
  });

  const breadcrumbs = [
    { label: 'Карты', path: '/maps' },
    { label: 'Пул карт', path: '/map_pools' },
  ];

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={breadcrumbs} />
      <Container>
        <h3>Ваш пул карт</h3>

        {error && <p className="text-danger">{error}</p>}
        {successMessage && <p className="text-success">{successMessage}</p>}

        <Row>
          {sortedMapPools.length > 0 ? (
            sortedMapPools.map((pool) => (
              <Col key={pool.id} xs={12} className="mb-4">
                {pool.status === 'draft' && (
                  <>
                    <h4>Черновая заявка</h4>
                    <Form>
                      <Form.Group controlId="playerLogin">
                        <Form.Label>Введите логин игрока:</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Введите логин игрока"
                          value={playerLogin}
                          onChange={(e) => setPlayerLogin(e.target.value)}
                          className="custom-input"
                        />
                      </Form.Group>
                      <Button 
                        className="custom-button"
                        onClick={() => savePlayerLogin(pool.id)} 
                        variant="danger"
                      >
                        Сохранить
                      </Button>
                    </Form>
                    <Button
                      className="custom-button"
                      onClick={() => submitMapPool(pool.id)} 
                      variant="success"
                    >
                      Подтвердить пул карт
                    </Button>
                    <Row>
                      {pool.maps.map((mapEntry) => (
                        <Col key={mapEntry.map.id} xs={12} sm={6} md={4} lg={3}>
                          <div className="map-item">
                            <Image
                              src={mapEntry.map.image_url}
                              alt={mapEntry.map.title}
                              fluid
                              rounded
                              className="map-pool-image"
                            />
                            <p>{mapEntry.map.title}</p>
                            <Button
                              className="custom-button"
                              onClick={() => deleteMapFromDraft(mapEntry.map.id, pool.id)}
                            >
                              Удалить карту
                            </Button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}

                {pool.status !== 'draft' && (
                  <div className="map-pool-item">
                    <h5>Заявка #{pool.id} - {pool.status}</h5>
                    {pool.player_login && <p>Игрок: {pool.player_login}</p>}
                    <Row>
                      {pool.maps.map((mapEntry) => (
                        <Col key={mapEntry.map.id} xs={12} sm={6} md={4} lg={3}>
                          <div className="map-item">
                            <Image
                              src={mapEntry.map.image_url}
                              alt={mapEntry.map.title}
                              fluid
                              rounded
                              className="map-pool-image"
                            />
                            <p>{mapEntry.map.title}</p>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Col>
            ))
          ) : (
            <p>Нет доступных заявок.</p>
          )}
        </Row>
      </Container>
    </>
  );
};

export default MapPoolList;
