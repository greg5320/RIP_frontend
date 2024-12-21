import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Alert, Form, Button } from 'react-bootstrap';
import DatePicker,{ registerLocale }  from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles/MapPoolList.css';
import { RootState } from '../store';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { setFilters } from '../store/filterSlice';
import { AppDispatch } from '../store';
import { setAuthenticated, fetchCurrentUser } from '../store/authSlice';
import { fetchMapPools, completeMapPool, rejectMapPool } from '../store/mapPoolSlice';
import {ru} from 'date-fns/locale/ru'; 

const MapPoolList: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const mapPools = useSelector((state: RootState) => state.mapPools.mapPools);
  const {status, startDate, endDate, creator } = useSelector((state: RootState) => state.filters);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isStaff = useSelector((state: RootState) => state.auth.is_staff);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const statusTranslations: { [key: string]: string } = {
    completed: 'Завершено',
    rejected: 'Отклонено',
    draft: 'Черновик',
    submitted: 'Отправлено',
  };

  const handleSearch = () => {
    const start = startDate ? new Date(startDate).toISOString().split('T')[0] : undefined;
    const end = endDate
      ? new Date(new Date(endDate).setHours(23, 59, 59)).toISOString().split('T')[0]
      : undefined;

    const filters = {
      status_query: status,
      start_date: start,
      end_date: end,
      creator_query: creator || '',
    };

    dispatch(
      setFilters({
        status,
        startDate: start || null,
        endDate: end || null,
        creator: creator || '',
      })
    );
    dispatch(fetchMapPools(filters)).catch(() => setError('Не удалось загрузить пулы карт.'));
  };

  useEffect(() => {
    registerLocale('ru', ru);
    handleSearch();

    const intervalId = setInterval(() => {
      handleSearch();
    }, 2000);

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

    return () => clearInterval(intervalId);
  }, [status, startDate, endDate, isAuthenticated, dispatch]);

  const filteredMapPools = mapPools.filter((pool) =>
    creator ? pool.player_login.toLowerCase().includes(creator.toLowerCase()) : true
  );

  const handleComplete = (id: number) => {
    dispatch(completeMapPool(id))
      .then(() => handleSearch())
      .catch(() => console.error('Ошибка при завершении заявки.'));
  };

  const handleReject = (id: number) => {
    dispatch(rejectMapPool(id))
      .then(() => handleSearch())
      .catch(() => console.error('Ошибка при отклонении заявки.'));
  };

  const breadcrumbs = [
    { label: 'Карты', path: '/maps' },
    { label: 'Пул карт', path: '/map_pools' },
  ];

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={breadcrumbs} />
      <Container>
        <h3 className="mt-4">Список заявок</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="filters-bar">
          {isStaff && (
            <Form.Group className="filter-group">
              <Form.Label>Создатель</Form.Label>
              <Form.Control
                type="text"
                value={creator || ''}
                onChange={(e) => dispatch(setFilters({ status, startDate, endDate, creator: e.target.value }))}
                className="filter-input"
              />
            </Form.Group>
          )}
          <Form.Group className="filter-group">
            <Form.Label>Статус</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) =>
                dispatch(setFilters({ ...{ status: e.target.value }, startDate, endDate, creator }))
              }
              className="filter-input"
            >
              <option value="">Все</option>
              <option value="completed">Завершено</option>
              <option value="rejected">Отклонено</option>
              <option value="draft">Черновик</option>
              <option value="submitted">Отправлено</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="filter-group">
            <Form.Label>Дата оформления с</Form.Label>
            <DatePicker
              selected={startDate ? new Date(startDate) : null}
              onChange={(date) =>
                dispatch(setFilters({ status, startDate: date ? date.toISOString() : null, endDate, creator }))
              }
              dateFormat="dd.MM.yyyy"
              locale="ru"
              className="filter-input"
            />
          </Form.Group>
          <Form.Group className="filter-group">
            <Form.Label>Дата оформления по</Form.Label>
            <DatePicker
              selected={endDate ? new Date(endDate) : null}
              onChange={(date) =>
                dispatch(setFilters({ status, startDate, endDate: date ? date.toISOString() : null, creator }))
              }
              dateFormat="dd.MM.yyyy"
              locale="ru"
              className="filter-input"
            />
          </Form.Group>
          <Button className="search-button" onClick={handleSearch}>
            Показать
          </Button>
        </div>
        {filteredMapPools.length > 0 ? (
          <div className="map-pool-list">
            <div className="card card-body mb-1 mt-4 row g-0 custom-card">
              <div className="row g-0">
                <div className="col-md-1">
                  <h5 className="card-title">№</h5>
                </div>
                {isStaff && (
                  <div className="col-md-1">
                    <h5 className="card-title">Создатель</h5>
                  </div>
                )}
                <div className="col-md-1">
                  <h5 className="card-title">Статус</h5>
                </div>
                <div className="col-md-2">
                  <h5 className="card-title">Дата создания</h5>
                </div>
                <div className="col-md-2">
                  <h5 className="card-title">Дата оформления</h5>
                </div>
                <div className="col-md-2">
                  <h5 className="card-title">Дата завершения</h5>
                </div>
                {isStaff && (
                  <div className="col-md-1">
                    <h5 className="card-title">Завершить</h5>
                  </div>
                )}
                {isStaff && (
                  <div className="col-md-1">
                    <h5 className="card-title">Отклонить</h5>
                  </div>
                )}
              </div>
            </div>
            <div className="map-pool-list">
              {filteredMapPools.map((pool) => (
                <div key={pool.id} className="card card-body mb-1 mt-4 row g-0 custom-card">
                  <div className="row g-0">
                    <div className="col-md-1 d-flex align-items-center">
                      <button onClick={() => navigate(`/map_pools/${pool.id}/`)} className="button-id">
                        {pool.id}
                      </button>
                    </div>
                    {isStaff && (
                      <div className="col-md-1 d-flex align-items-center">
                        <span>{pool.player_login}</span>
                      </div>
                    )}
                    <div className="col-md-1 d-flex align-items-center">
                      <span>{statusTranslations[pool.status] || pool.status}</span>
                    </div>
                    <div className="col-md-2 d-flex align-items-center">
                      <span>{new Date(pool.creation_date).toLocaleString()}</span>
                    </div>
                    <div className="col-md-2 d-flex align-items-center">
                      <span>{pool.submit_date ? new Date(pool.submit_date).toLocaleString() : '—'}</span>
                    </div>
                    <div className="col-md-2 d-flex align-items-center">
                      <span>{pool.complete_date ? new Date(pool.complete_date).toLocaleString() : '—'}</span>
                    </div>
                    {isStaff && (
                      <div className="col-md-1 d-flex align-items-center">
                        <Button
                          className="custom-button-map-pool"
                          onClick={() => handleComplete(pool.id)}
                          disabled={pool.status === 'completed' || pool.status === 'rejected'}
                        >
                          Завершить
                        </Button>
                      </div>
                    )}
                    {isStaff && (
                      <div className="col-md-1 d-flex align-items-center">
                        <Button
                          className="custom-button-map-pool"
                          onClick={() => handleReject(pool.id)}
                          disabled={pool.status === 'completed' || pool.status === 'rejected'}
                        >
                          Отклонить
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Нет доступных заявок.</p>
        )}
      </Container>
    </>
  );
};

export default MapPoolList;
