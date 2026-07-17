import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import MapPage from './pages/MapPage';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import RestaurantDetail from './pages/RestaurantDetail';
import Onboarding from './pages/Onboarding';

export default function App() {
  const loc = useLocation();
  const onboarded = localStorage.getItem('darna_onboarded') === '1';

  // First launch → full onboarding experience (splash, welcome, language, signup).
  if (!onboarded && loc.pathname !== '/onboarding' && loc.pathname !== '/auth') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={<Onboarding initialStep="login" />} />
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
