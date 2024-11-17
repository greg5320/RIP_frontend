import React from 'react';
import { Carousel, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MainPage.css';
import Header from '../components/Header';
const MainPage: React.FC = () => {
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
              src="../../Starcraft-map-picker-frontend/Ephemeron.webp"
              alt="Первый слайд"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100 full-width-img"
              src="../../Starcraft-map-picker-frontend/Oxide.webp"
              alt="Второй слайд"
            />
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100 full-width-img"
              src="../../Starcraft-map-picker-frontend/Fortitude.webp"
              alt="Третий слайд"
            />
          </Carousel.Item>
        </Carousel>
      </Container>
    </>
  );
};

export default MainPage;
