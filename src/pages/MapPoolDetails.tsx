import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MapPoolList.css'; // Используем существующие стили
import axiosInstance from '../modules/axios';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { Map } from '../modules/mapApi';

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

const MapPoolDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Получаем ID из маршрута
  const [mapPool, setMapPool] = useState<MapPool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [playerLogin, setPlayerLogin] = useState<string>(''); 
//   const navigate = useNavigate();

  const fetchMapPool = async () => {
    try {
      const response = await axiosInstance.get(`/api/map_pools/${id}/`, { withCredentials: true });
      setMapPool(response.data);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки заявки:', error);
      setError('Не удалось загрузить заявку.');
    }
  };

  useEffect(() => {
    fetchMapPool();
  }, [id]);

  const deleteMapFromDraft = async (mapId: number) => {
    try {
      if (!mapPool) return;
      await axiosInstance.delete(`/api/map_pools/${mapPool.id}/map/${mapId}/`);
      fetchMapPool();
    } catch (error) {
      console.error('Ошибка при удалении карты:', error);
    }
  };

  const savePlayerLogin = async () => {
    try {
      if (!mapPool) return;
      await axiosInstance.put(`/api/map_pools/${mapPool.id}/`, {
        player_login: playerLogin,
      });
      fetchMapPool();
      setSuccessMessage('Логин игрока успешно сохранен!');
      setError(null);
    } catch (error) {
      console.error('Ошибка при сохранении логина игрока:', error);
      setError('Не удалось сохранить логин игрока.');
      setSuccessMessage(null);
    }
  };

  const submitMapPool = async () => {
    try {
      if (!mapPool) return;
      await axiosInstance.put(`/api/map_pools/${mapPool.id}/submit/`, {}, { withCredentials: true });
      fetchMapPool();
      setSuccessMessage('Заявка успешно подтверждена!');
      setError(null);
    } catch (error) {
      console.error('Ошибка при подтверждении заявки:', error);
      setError('Не удалось подтвердить заявку.');
      setSuccessMessage(null);
    }
  };

  const breadcrumbs = [
    { label: 'Карты', path: '/maps' },
    { label: 'Пул карт', path: '/map_pools' },
    { label: `Заявка #${id}`, path: `/map_pools/${id}` },
  ];

  if (error) {
    return (
      <Container>
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  if (!mapPool) {
    return (
      <Container>
        <p>Загрузка...</p>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={breadcrumbs} />
      <Container>
        <h3>Заявка #{mapPool.id}</h3>
        {successMessage && <p className="text-success">{successMessage}</p>}

        {mapPool.status === 'draft' && (
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
              <Button className="custom-button" onClick={savePlayerLogin} variant="danger">
                Сохранить
              </Button>
            </Form>
            <Button className="custom-button" onClick={submitMapPool} variant="success">
              Подтвердить пул карт
            </Button>
          </>
        )}

        <Row>
          {mapPool.maps.map((mapEntry) => (
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
                {mapPool.status === 'draft' && (
                  <Button
                    className="custom-button"
                    onClick={() => deleteMapFromDraft(mapEntry.map.id)}
                  >
                    Удалить карту
                  </Button>
                )}
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default MapPoolDetails;
