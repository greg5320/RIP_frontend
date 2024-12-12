import React, { useEffect, useState } from 'react';
import axiosInstance from '../modules/axios';
import { useNavigate } from 'react-router-dom';
import './styles/Profile.css';
import Header from '../components/Header';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.put('api/users/profile/');
        setProfile(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleResetPassword = async (event: React.MouseEvent<HTMLButtonElement>) => {
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

    try {
      await axiosInstance.put('/api/users/reset-password/', { password });
      setMessage('Пароль успешно сброшен.');
      setIsError(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
      setMessage('Ошибка при сбросе пароля.');
      setIsError(true);
    }
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <h2 className="profile-title">Мой профиль</h2>
        <div className="profile-info">
          <div className="profile-item">
            <strong>Имя пользователя:</strong> {profile.username}
          </div>
          <div className="profile-item">
            <strong>Электронная почта:</strong> {profile.email}
          </div>
          <div className="profile-item">
            <strong>Имя:</strong> {profile.first_name}
          </div>
          <div className="profile-item">
            <strong>Фамилия:</strong> {profile.last_name}
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
