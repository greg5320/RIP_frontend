import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/AuthPage.css';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser } from '../store/authSlice';
import Header from '../components/Header';

const RegistrationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    const email = `${login}@example.com`; 
    dispatch(registerUser({ username: login, password, email }));
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} className="auth-form-container">
              <h2>Регистрация</h2>
              <Form onSubmit={handleRegister}>
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

                <Form.Group controlId="formConfirmPassword">
                  <Form.Label>Подтвердите пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Подтвердите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="enter-button-margin">
                  Зарегистрироваться
                </Button>
              </Form>

              {authStatus === 'loading' && <p>Загрузка...</p>}
              {authError && <p style={{ color: 'red' }}>{authError}</p>}

              <div className="mt-3 text-center">
                <p>
                  Уже есть аккаунт?{' '}
                  <Link to="/login" className="text-white">
                    Войдите
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

export default RegistrationPage;
