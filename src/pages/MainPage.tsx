import React from 'react';
import { Carousel, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MainPage.css';
import Header from '../components/Header';
import { useEffect } from 'react';
import { fetchCurrentUser } from '../store/authSlice';
import type { AppDispatch } from '../store/index';
import { setAuthenticated } from '../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
const MainPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
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
  }, [isAuthenticated, dispatch]);
  return (
    <>
      <Header />
      <Container fluid className="main-page-container position-relative">
        <div className="main-text">
          <h1>Добро пожаловать в систему для подбора карт</h1>
          <p>
            В данной системе игроки могут выбирать для себя подходящие карты и формировать свои пулы карт, которые затем будут обработаны картмейсетром
          </p>
        </div>
        <Carousel>
          <Carousel.Item>
            <img
              className="d-block w-100 full-width-img"
              src="../../Ephemeron.webp"
              alt="Первый слайд"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100 full-width-img"
              src="../../Oxide.webp"
              alt="Второй слайд"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100 full-width-img"
              src="../../Fortitude.webp"
              alt="Третий слайд"
            />
          </Carousel.Item>
        </Carousel>
      </Container>
    </>
  );
};

export default MainPage;
