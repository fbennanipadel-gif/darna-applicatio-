import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import MapPage from './pages/MapPage';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import RestaurantDetail from './pages/RestaurantDetail';
import Auth from './pages/Auth';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="map" element={<MapPage />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="profile" element={<Profile />} />
        <Route path="r/:slug" element={<RestaurantDetail />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
