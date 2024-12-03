import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, resetAuthStatus, setAuthenticated } from '../store/authSlice';
import Header from '../components/Header';
import './styles/AuthPage.css';

const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const authStatus = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);
  const user = useAppSelector((state) => state.auth.user);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(resetAuthStatus());
    dispatch(loginUser({ username: login, password }));
  };
  useEffect(() => {
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
  }, [dispatch]);
  
  useEffect(() => {
    if (authStatus === 'succeeded' && user) {
      navigate('/maps');
    }
  }, [authStatus, user, navigate]);

  return (
    <>
      <Header />
      <div className="auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} className="auth-form-container">
              <h2>Авторизация</h2>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formLogin">
                  <Form.Label>Логин</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Введите ваш логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formPassword">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Введите ваш пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="enter-button-margin">
                  Войти
                </Button>
              </Form>

              {authStatus === 'loading' && <p>Загрузка...</p>}
              {authError && <p style={{ color: 'red' }}>{authError}</p>}

              <div className="mt-3 text-center">
                <p>
                  Нет аккаунта?{' '}
                  <Link to="/register" className="text-white">
                    Зарегистрируйтесь
                  </Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default AuthPage;
