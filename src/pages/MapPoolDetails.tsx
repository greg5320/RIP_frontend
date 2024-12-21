import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Image, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MapPoolDetails.css';
import axiosInstance from '../modules/axios';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { Map } from '../modules/mapApi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AppDispatch } from '../store';
import { useDispatch, useSelector } from 'react-redux';
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
  const navigate = useNavigate();

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
  }, [isAuthenticated, dispatch, id]);

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
  const deleteMapPool = async () => {
    try {
      if (!id) return;
      await axiosInstance.delete(`/api/map_pools/${id}/`);
      alert("Заявка успешно удалена!");
      setSuccessMessage('Пул карт успешно удален!');
      navigate('/maps');
    } catch (error) {
      console.error('Ошибка при удалении пула карт:', error);
      setError('Не удалось удалить пул карт.');
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

      try {
        await axiosInstance.put(
          `/api/map_pools/${mapPool.id}/map/${movedMap.map.id}/position/`,
          { position: destination.index + 1 }
        );

        const replacedMap = mapPool.maps[destination.index];
        if (replacedMap) {
          await axiosInstance.put(
            `/api/map_pools/${mapPool.id}/map/${replacedMap.map.id}/position/`,
            { position: source.index + 1 }
          );
        }

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
        console.error("Ошибка при обновлении позиций карт:", error);
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

        {mapPool.status === 'completed' && mapPool.popularity !== null && (
          <div className="popularity-info">
            <h5>Популярность: {mapPool.popularity}</h5>
          </div>
        )}

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
            <div className="delete-pool-container">
              <Button
                className="custom-button"
                variant="danger"
                onClick={deleteMapPool}
              >
                Удалить пул карт
              </Button>
            </div>
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
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="map-pool-list"
                >
                  {sortedMaps.map((mapEntry, index) => (
                    <Draggable key={mapEntry.map.id} draggableId={mapEntry.map.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="card card-body mb-3 mt-4 row g-0 custom-card"
                        >
                          <div className="row g-0">
                            <div className="col-md-2">
                              <h5 className="card-title">{index + 1}. {mapEntry.map.title}</h5>
                            </div>
                            <div className="col-md-6">
                              <Image
                                src={mapEntry.map.image_url}
                                alt={mapEntry.map.title}
                                fluid
                                rounded
                                className="map-pool-image"
                              />
                            </div>
                            <div className="col-md-4 d-flex align-items-center">
                              <Button
                                className="custom-button"
                                onClick={() => deleteMapFromDraft(mapEntry.map.id)}
                              >
                                Удалить карту
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <Row className="map-pool-list">
            {sortedMaps.map((mapEntry, index) => (
              <div
                key={mapEntry.map.id}
                className="card card-body mb-3 mt-4 row g-0 custom-card"
              >
                <div className="row g-0">
                  <div className="col-md-2">
                    <h5 className="card-title">{index + 1}. {mapEntry.map.title}</h5>
                  </div>
                  <div className="col-md-6">
                    <Image
                      src={mapEntry.map.image_url}
                      alt={mapEntry.map.title}
                      fluid
                      rounded
                      className="map-pool-image"
                    />
                  </div>
                </div>
              </div>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default MapPoolDetails;
