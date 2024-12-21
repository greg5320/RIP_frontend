import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Profile.css';
import Header from '../components/Header';
import { AppDispatch } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthenticated, fetchCurrentUser, fetchProfile, resetPassword } from '../store/authSlice';
import { RootState } from '../store';
import { BreadCrumbs } from '../components/BreadCrumbs';

const ProfilePage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const profile = useSelector((state: RootState) => state.auth.profile);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split('; ');
      const sessionCookie = cookies.find((cookie) => cookie.startsWith('session_id='));

      if (sessionCookie) {
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setAuthenticated(false));
        navigate('/login');
      }
    };

    checkAuth();
  }, [isAuthenticated, dispatch, navigate]);

  const handleResetPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!password || !confirmPassword) {
      setMessage('Пароль и подтверждение пароля не могут быть пустыми.');
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Пароли не совпадают.');
      setIsError(true);
      return;
    }

    dispatch(resetPassword(password))
      .then(() => {
        setMessage('Пароль успешно сброшен.');
        setIsError(false);
        setPassword('');
        setConfirmPassword('');
      })
      .catch((error) => {
        console.error('Ошибка при сбросе пароля:', error);
        setMessage('Ошибка при сбросе пароля.');
        setIsError(true);
      });
  };

  const breadcrumbs = [
    { label: 'Карты', path: '/maps' },
    { label: 'Профиль', path: '/profile' },
  ];

  return (
    <>
      <Header />
      <BreadCrumbs crumbs={breadcrumbs} />
      <div className="profile-container">
        <h2 className="profile-title">Мой профиль</h2>
        <div className="profile-info">
          <div className="profile-item">
            <strong>Имя пользователя:</strong> {profile?.username}
          </div>
          <div className="profile-item">
            <strong>Электронная почта:</strong> {profile?.email}
          </div>
        </div>
        <div className="password-reset">
          <h3>Сброс пароля</h3>
          <input
            type="password"
            placeholder="Введите новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
          />
          <input
            type="password"
            placeholder="Подтвердите новый пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="password-input"
          />
          <button onClick={handleResetPassword} className="reset-password-button">
            Сбросить пароль
          </button>
          {message && (
            <div className={`message ${isError ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
