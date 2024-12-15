import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Container, Alert, Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './styles/MapPoolList.css';
import { RootState } from '../store';
import axiosInstance from '../modules/axios';
import Header from '../components/Header';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { setFilters } from '../store/filterSlice';
import { AppDispatch } from '../store';
import { setAuthenticated, fetchCurrentUser } from '../store/authSlice';

interface MapPool {
  id: number;
  status: string;
  creation_date: string;
  submit_date: string | null;
  complete_date: string | null;
  player_login: string;
}

const MapPoolList: React.FC = () => {
  const [mapPools, setMapPools] = useState<MapPool[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { status, startDate, endDate, creator } = useSelector((state: RootState) => state.filters);
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

  const fetchMapPools = async (filters?: { start_date?: string; end_date?: string; status_query?: string; }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status_query) params.append('status_query', filters.status_query);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await axiosInstance.get(`/api/map_pools/?${params.toString()}`, { withCredentials: true });

      const sortedData = response.data.sort((a: MapPool, b: MapPool) => {
        if (a.status === 'draft' && b.status !== 'draft') return -1;
        if (a.status !== 'draft' && b.status === 'draft') return 1;
        if (a.status === 'submitted' && b.status !== 'submitted') return -1;
        if (a.status !== 'submitted' && b.status === 'submitted') return 1;
        return new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime();
      });

      setMapPools(sortedData);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки пулов карт:', error);
      setError('Не удалось загрузить пулы карт.');
    }
  };

  useEffect(() => {
    fetchMapPools({
      status_query: status,
      start_date: startDate ? startDate : undefined,
      end_date: endDate ? endDate : undefined,
    });

    const intervalId = setInterval(() => {
      fetchMapPools({
        status_query: status,
        start_date: startDate ? startDate : undefined,
        end_date: endDate ? endDate : undefined,
      });
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

  const handleSearch = () => {
    console.log('Filters before search', { status, startDate, endDate, creator });
    const filters = {
      status_query: status,
      start_date: startDate ? new Date(startDate).toISOString().split('T')[0] : undefined,
      end_date: endDate ? new Date(endDate).toISOString().split('T')[0] : undefined,
      creator_query: creator || '',  // Убедитесь, что creator передается как строка
    };
    dispatch(
      setFilters({
        status: status,
        startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : null,
        endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
        creator: creator || '',  // Убедитесь, что creator передается как строка
      })
    );
    fetchMapPools(filters);
  };
  const filteredMapPools = mapPools.filter((pool) =>
    creator ? pool.player_login.toLowerCase().includes(creator.toLowerCase()) : true
  );

  const handleComplete = (id: number) => {
    axiosInstance.put(`/api/map_pools/${id}/complete/`, { action: 'complete' })
      .then(response => {
        console.log(response.data);
        fetchMapPools({
          status_query: status,
          start_date: startDate ? startDate : undefined,
          end_date: endDate ? endDate : undefined,
        });
      })
      .catch(error => console.error('Ошибка при завершении заявки:', error));
  };

  const handleReject = (id: number) => {
    axiosInstance.put(`/api/map_pools/${id}/complete/`, { action: 'reject' })
      .then(response => {
        console.log(response.data);
        fetchMapPools({
          status_query: status,
          start_date: startDate ? startDate : undefined,
          end_date: endDate ? endDate : undefined,
        });
      })
      .catch(error => console.error('Ошибка при отклонении заявки:', error));
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
                dispatch(
                  setFilters({
                    ...{
                      status,
                      startDate: date ? date.toISOString().split('T')[0] : null,
                      endDate,
                      creator,
                    },
                  })
                )
              }
              dateFormat="dd.MM.yyyy"
              className="filter-input"
            />
          </Form.Group>
          <Form.Group className="filter-group">
            <Form.Label>Дата оформления по</Form.Label>
            <DatePicker
              selected={endDate ? new Date(endDate) : null}
              onChange={(date) =>
                dispatch(
                  setFilters({
                    ...{
                      status,
                      startDate,
                      endDate: date ? date.toISOString().split('T')[0] : null,
                      creator,
                    },
                  }
                  )
                )}
              dateFormat="dd.MM.yyyy"
              className="filter-input"
            />
          </Form.Group>
          <Button className="search-button" onClick={handleSearch}>
            Показать
          </Button>
        </div>
        {filteredMapPools.length > 0 ? (
          <Table striped bordered hover variant="dark" responsive>
            <thead>
              <tr>
                <th>ID</th>
                {isStaff && <th>Создатель</th>}
                <th>Статус</th>
                <th>Дата создания</th>
                <th>Дата оформления</th>
                <th>Дата завершения</th>
                {isStaff && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMapPools.map((pool) => (
                <tr key={pool.id}>
                  <td className="id-index">
                    <button
                      onClick={() => navigate(`/map_pools/${pool.id}/`)}
                      className="map-pool-link"
                    >
                      {pool.id}
                    </button>
                  </td>
                  {isStaff && <td>{pool.player_login}</td>}
                  <td>{statusTranslations[pool.status] || pool.status}</td>
                  <td>{new Date(pool.creation_date).toLocaleString()}</td>
                  <td>{pool.submit_date ? new Date(pool.submit_date).toLocaleString() : '—'}</td>
                  <td>{pool.complete_date ? new Date(pool.complete_date).toLocaleString() : '—'}</td>

                  {isStaff && (
                    <td>
                      <Button className="search-button"
                        onClick={() => handleComplete(pool.id)}
                        disabled={pool.status === 'completed' || pool.status === 'rejected'}
                      >
                        Завершить
                      </Button>
                    </td>
                  )}
                  {isStaff && (
                    <td>
                      <Button className="search-button"
                        onClick={() => handleReject(pool.id)}
                        disabled={pool.status === 'completed' || pool.status === 'rejected'}
                      >
                        Отклонить
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>Нет доступных заявок.</p>
        )}
      </Container>
    </>
  );
};

export default MapPoolList;
