import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import MapList from './pages/MapList';
import MapDetails from './pages/MapDetails';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import Page403 from './pages/403';
import Page404 from './pages/404';
import EditMapPage from './pages/EditMapList';
import EditMap from './pages/EditMapPage';
import MapPoolDetail from './pages/MapPoolDetails';
import MapPoolList from './pages/MapPoolList';
import ProfilePage from './pages/Profile';
import RegistrationPage from './pages/RegistrationPage';
import { fetchCurrentUser } from './store/authSlice';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from './store/index';
import { RootState } from './store';

const ProtectedRoute: React.FC<{ children: React.ReactNode; is_staff?: boolean }> = ({
  children,
  is_staff,
}) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isStaff = useSelector((state: RootState) => state.auth.is_staff);

  if (!isAuthenticated) {
    return <Navigate to="/403" />;
  }

  if (is_staff && isStaff !== is_staff) {
    return <Navigate to="/403" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter basename="/Starcraft-map-picker-frontend">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/maps" element={<MapList />} />
        <Route path="/maps/:id" element={<MapDetails />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/map_pools" element={<MapPoolList />} />
        <Route path="/map_pools/:id" element={<MapPoolDetail />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/403" element={<Page403 />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maps/edit"
          element={
            <ProtectedRoute is_staff={true}>
              <EditMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maps/edit/:id"
          element={
            <ProtectedRoute is_staff={true}>
              <EditMap />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
