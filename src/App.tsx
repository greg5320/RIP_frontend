import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MapList from './pages/MapList';
import MapDetails from './pages/MapDetails';
import MainPage from './pages/MainPage';
import AuthPage from './pages/AuthPage';
import Page403 from './pages/403';
import Page404 from './pages/404';
import EditMapPage from './pages/EditMapPage';
import MapListTable from './pages/MapListTable';
import MapPoolDetail from './pages/MapPoolDetails';
import MapPoolListPage from './pages/MapPoolList';
import ProfilePage from './pages/Profile';
import RegistrationPage from './pages/Registration';

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/Starcraft-map-picker-frontend">
      <Routes>
        <Route path="/maps/:id" element={<MapDetails />} />
        <Route path="/maps" element={<MapList />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/users/login" element={<AuthPage />} />
        <Route path="/users/register" element={<RegistrationPage />} />
        <Route path="/users/profile" element={<ProfilePage />} />
        <Route path="/maps/table" element={<MapListTable />} />
        <Route path="/maps/edit" element={<EditMapPage />} />
        <Route path="/404" element={<Page404 />} />
        <Route path="/403" element={<Page403 />} />
        <Route path="/map_pools" element={<MapPoolListPage />} />
        <Route path="/map_pools/1" element={<MapPoolDetail />} />
      </Routes>
      </BrowserRouter>
  );
};

export default App;
