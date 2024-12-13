import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../modules/axios';
import './styles/EditMap.css';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';

import { fetchCurrentUser } from '../store/authSlice';
import type { AppDispatch } from '../store/index';
import { setAuthenticated } from '../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';

interface Map {
    id: number;
    title: string;
    description: string;
    status: string;
    image_url: string;
    players: string;
    tileset: string;
    overview: string;
}

const EditMap: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [map, setMap] = useState<Map | null>(null);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState<File | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const breadcrumbs = [
        { label: 'Список карт', path: '/maps/edit' },
        { label: 'Редактирование карты', path: `/maps/edit/${id}` },
    ];

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

    useEffect(() => {
        const fetchMap = async () => {
            try {
                const response = await axiosInstance.get(`/api/maps/${id}/`);
                setMap(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке карты', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMap();
    }, [id]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setMap((prevMap) => (prevMap ? { ...prevMap, [name]: value } : null));
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    const handleSave = async () => {
        if (!map || !map.title || !map.players || !map.tileset || !map.status || !map.description || !map.overview) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }
        try {
            await axiosInstance.put(`/api/maps/${id}/`, map);
            if (image) {
                const formData = new FormData();
                formData.append('image', image);
                await axiosInstance.post(`/api/maps/${id}/image/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }
            alert('Карта успешно обновлена!');
            navigate('/maps/edit');
        } catch (error) {
            console.error('Ошибка при обновлении карты', error);
            alert('Ошибка при сохранении карты.');
        }
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (!map) {
        return <p>Карта не найдена.</p>;
    }

    return (
        <>
            <Header />
            <BreadCrumbs crumbs={breadcrumbs} />
            <Container className="edit-map">
                <h3>Редактировать карту</h3>
                <Row>
                    <Col xs={12} md={6}>
                        <Form>
                            <Form.Group controlId="mapTitle" className="mb-3">
                                <Form.Label>Название</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={map.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="mapPlayers" className="mb-3">
                                <Form.Label>Игроки</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="players"
                                    value={map.players}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="mapTileset" className="mb-3">
                                <Form.Label>Тайлсет</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="tileset"
                                    value={map.tileset}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="mapStatus" className="mb-3">
                                <Form.Label>Статус</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="status"
                                    value={map.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="active">Действует</option>
                                    <option value="deleted">Удалён</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="mapImage" className="mb-3">
                                <Form.Label>Изображение</Form.Label>
                                <Form.Control type="file" onChange={handleImageChange} />
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col xs={12} md={6} className="d-flex justify-content-center align-items-center">
                        <div className="map-image-container">
                            {map.image_url ? (
                                <img src={map.image_url} alt="Изображение карты" className="map-image" />
                            ) : (
                                <p>Изображение отсутствует</p>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="mapDescription" className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={map.description}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="mapOverview" className="mb-3">
                            <Form.Label>Обзор</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="overview"
                                value={map.overview}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <div className="text-center">
                            <Button variant="primary" className="me-2" onClick={handleSave}>
                                Сохранить
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/maps/edit')}>
                                Отмена
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default EditMap;
