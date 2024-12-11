import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MapPoolList.css';
import axiosInstance from '../modules/axios';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { Map } from '../modules/mapApi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AppDispatch } from '../store';
import { useDispatch,useSelector } from 'react-redux';
import { setAuthenticated } from '../store/authSlice';
import { fetchCurrentUser } from '../store/authSlice';
import { RootState } from '../store';

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
  const { id } = useParams<{ id: string }>(); 
  const [mapPool, setMapPool] = useState<MapPool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [playerLogin, setPlayerLogin] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  // const isStaff = useSelector((state: RootState) => state.auth.is_staff);
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
    dispatch(fetchCurrentUser());
    const checkAuth = () => {
      const cookies = document.cookie.split('; ');
      const sessionCookie = cookies.find((cookie) => cookie.startsWith('session_id='));
  
      if (sessionCookie) {
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setAuthenticated(false));
      }
    };
  
    checkAuth();
  }, [isAuthenticated, dispatch,id]);

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
    { label: `Заявка №${id}`, path: `/map_pools/${id}` },
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

  const sortedMaps = [...mapPool.maps].sort((a, b) => a.position - b.position);

  const onDragEnd = async (result: any) => {
    const { destination, source } = result;
  
    if (!destination) return; 
  
    if (destination.index !== source.index) {
      const updatedMaps = Array.from(mapPool.maps);
      const [movedMap] = updatedMaps.splice(source.index, 1);
      updatedMaps.splice(destination.index, 0, movedMap); 
  
      const newPositionData = updatedMaps.map((mapEntry, index) => ({
        id: mapEntry.map.id,
        position: index + 1, 
      }));
  
      try {
        await axiosInstance.put(`/api/map_pools/${mapPool.id}/update_positions/`, {
          positions: newPositionData,
        });
  
        setMapPool((prev) =>
          prev
            ? {
                ...prev,
                maps: updatedMaps.map((mapEntry, index) => ({
                  ...mapEntry,
                  position: index + 1,
                })),
              }
            : null
        );
      } catch (error) {
        console.error('Ошибка при обновлении позиций карт:', error);
      }
    }
  };

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={breadcrumbs} />
      <Container>
        <h3>Заявка №{mapPool.id}</h3>
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

        {mapPool.status !== 'draft' && (
          <div className="player-login-info">
            <h5>Логин игрока: {mapPool.player_login}</h5>
          </div>
        )}

        {mapPool.status === 'draft' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="maps" direction="vertical">
              {(provided) => (
                <Row
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="map-pool-list"
                >
                  {sortedMaps.map((mapEntry, index) => (
                    <Draggable key={mapEntry.map.id} draggableId={mapEntry.map.id.toString()} index={index}>
                      {(provided) => (
                        <Col
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="map-item-container">
                            <p className="map-index-draft">{index + 1}</p> 
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
                                onClick={() => deleteMapFromDraft(mapEntry.map.id)}
                              >
                                Удалить карту
                              </Button>
                            </div>
                          </div>
                        </Col>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Row>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <Row className="map-pool-list">
            {sortedMaps.map((mapEntry, index) => (
              <Col
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={mapEntry.map.id}
              >
                <div className="map-item-container">
                  <p className="map-index">{index + 1}</p> 
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
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};



export default MapPoolDetails;
