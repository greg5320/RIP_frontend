import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMapById, Map } from '../modules/mapApi';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/MapDetails.css';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs'; 

const MapDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [map, setMap] = useState<Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        if (id) {
          const fetchedMap = await fetchMapById(parseInt(id));
          setMap(fetchedMap);
        }
      } catch (error) {
        setError('Не удалось загрузить карту');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadMap();
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;
  if (!map) return <p>Карта не найдена</p>;

  const crumbs = [
    { label: 'Карты', path: '/maps' },
    { label: map.title }
  ];

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={crumbs} /> 
      <Container>
        <Row>
          <Col>
            <h1>{map.title}</h1>
          </Col>
        </Row>
        <Row className="map-content">
          <Col xs={12} md={4}>
            <Card className="map-card">
              <Card.Header className="map-title">{map.title}</Card.Header>
              <Card.Body>
                <Image
                  src={map.image_url || 'http://127.0.0.1:9000/mybucket/map_not_found.png'}
                  alt={map.title}
                  fluid
                  className="map-card-image"
                />
                <GeneralInfo map={map} />
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={8}>
            <MapDescription map={map} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

const GeneralInfo: React.FC<{ map: Map }> = ({ map }) => (
  <div className="general-info">
    <h3>Общая информация</h3>
    <div className="info-row">
      <span className="info-label">Количество игроков</span>
      <span className="info-value">{map.players}</span>
    </div>
    <div className="info-row">
      <span className="info-label">Местность</span>
      <span className="info-value">{map.tileset}</span>
    </div>
  </div>
);

const MapDescription: React.FC<{ map: Map }> = ({ map }) => (
  <div className="map-description">
    <p>{map.description}</p>
    <h2>Обзор</h2>
    <p>{map.overview}</p>
  </div>
);

export default MapDetails;
