import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, FormControl, Container, Row, Col, Image } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MapList.css';
import { RootState } from '../store';
import { setSearchTerm } from '../store/searchSlice';
import { fetchMaps, fetchDraftPoolInfo, addToDraftPool,fetchDraftPoolInfoId } from '../store/mapSlice';
import { fetchCurrentUser } from '../store/authSlice';
import type { AppDispatch } from '../store/index';
import { setAuthenticated } from '../store/authSlice';
import Timer from '../components/Timer';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';

const MapList: React.FC = () => {
  const [localSearchTerm, setLocalSearchTerm] = useState<string>('');
  const searchTerm = useSelector((state: RootState) => state.search.searchTerm);
  const maps = useSelector((state: RootState) => state.maps.maps);
  const error = useSelector((state: RootState) => state.maps.error);
  const draftPoolCount = useSelector((state: RootState) => state.maps.draftPoolCount);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const sortedMaps = [...maps].sort((a, b) => a.title.localeCompare(b.title));

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
    dispatch(fetchMaps(searchTerm));
    setRefreshKey((prevKey) => prevKey + 1); 
  }, [searchTerm, dispatch]);

  useEffect(() => {
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
    if (isAuthenticated) {
      dispatch(fetchDraftPoolInfo());
    }
    setRefreshKey((prevKey) => prevKey + 1); 
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAuthenticated) {
        dispatch(fetchDraftPoolInfo());
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, dispatch]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(setSearchTerm(localSearchTerm));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(event.target.value);
  };

  const handleCartClick = async () => {
    try {
      const id = await dispatch(fetchDraftPoolInfoId()).unwrap();
      const count = await dispatch(fetchDraftPoolInfo()).unwrap();

      if (count == null) {
        alert("Добавьте карту в черновую заявку для просмотра своей корзины!");
        return; 
      }

      if (isAuthenticated) {
        if (id == null) { 
          alert("Не удалось найти черновую заявку. Пожалуйста, попробуйте снова.");
          return;
        }
        navigate(`/map_pools/${id}`);
      } else {
        alert('Пожалуйста, авторизуйтесь, чтобы получить доступ к пулу карт.');
      }
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      alert("Произошла ошибка при попытке открыть черновую заявку. Попробуйте позже.");
    }
  };

  const addToDraft = (mapId: number) => {
    dispatch(addToDraftPool(mapId));
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={[{ label: 'Карты', path: '/maps' }]} />
      <Timer refreshKey={refreshKey} />
      <div className="cart-icon-container">
        <FaShoppingCart
          size={30}
          onClick={handleCartClick}
          className="cart-icon"
          style={{ cursor: isAuthenticated ? 'pointer' : 'not-allowed' }}
        />
        {isAuthenticated && draftPoolCount > 0 && (
          <span className="cart-count">{draftPoolCount}</span>
        )}
      </div>
      <Container>
        <form className="find-button" onSubmit={handleSearch}>
          <Row className="justify-content-center align-items-center">
            <Col xs={12} sm={8} md={6} lg={4} className="search-field">
              <FormControl
                type="text"
                placeholder="Поиск по названию"
                value={localSearchTerm}
                onChange={handleInputChange}
                className="mb-2"
              />
            </Col>
            <Col xs="auto">
              <Button type="submit" variant="primary" className="search-button">
                Поиск
              </Button>
            </Col>
          </Row>
        </form>
        <Row className="map-container mt-4">
          {sortedMaps.length > 0 ? (
            sortedMaps.map((map) => (
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
                    src={map.image_url || 'http://127.0.0.1:9000/mybucket/map_not_found.png'}
                    alt={map.title}
                    fluid
                    rounded
                    className="map-image"
                  />
                  <p>{map.title}</p>
                </Link>
                {isAuthenticated && (
                  <Button
                    variant="success"
                    onClick={() => addToDraft(map.id)}
                    className="mt-2"
                  >
                    Добавить в пул карт
                  </Button>
                )}
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
