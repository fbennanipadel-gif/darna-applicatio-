import React from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const get = (url, config) => api.get(url, config).then((r) => r.data);

export function useRestaurants(params = {}) {
  return useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => get('/restaurants', { params }),
    placeholderData: keepPreviousData,
  });
}

export function useTrending(params = {}) {
  return useQuery({
    queryKey: ['trending', params],
    queryFn: () => get('/restaurants/trending', { params }),
  });
}

export function useRecommended(enabled) {
  return useQuery({
    queryKey: ['recommended'],
    queryFn: () => get('/restaurants/recommended'),
    enabled: !!enabled,
  });
}

export function useRestaurant(slug) {
  return useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => get(`/restaurants/${slug}`),
    enabled: !!slug,
  });
}

export function useFavorites(enabled) {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => get('/users/favorites'),
    enabled: !!enabled,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (restaurantId) => api.post('/users/favorites/toggle', { restaurantId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['recommended'] });
    },
  });
}

export function useSubmitReview(slug) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post(`/restaurants/${slug}/reviews`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurant', slug] });
      qc.invalidateQueries({ queryKey: ['trending'] });
    },
  });
}

export function useAskConcierge() {
  return useMutation({
    mutationFn: (payload) => api.post('/ai/chat', payload).then((r) => r.data),
  });
}

export function useLoyalty(enabled) {
  return useQuery({
    queryKey: ['loyalty'],
    queryFn: () => get('/users/me/loyalty'),
    enabled: !!enabled,
  });
}

export function useMyReviews(enabled) {
  return useQuery({
    queryKey: ['myReviews'],
    queryFn: () => get('/users/me/reviews'),
    enabled: !!enabled,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.patch('/users/me', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loyalty'] }),
  });
}

/** Real device location (GPS) with graceful denial. */
export function useGeolocation() {
  const [pos, setPos] = React.useState(null);
  const [status, setStatus] = React.useState('idle'); // idle · granted · denied
  const request = React.useCallback(() => {
    if (!navigator.geolocation) return setStatus('denied');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus('granted');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);
  React.useEffect(() => { request(); }, [request]);
  return { pos, status, request };
}

/** Whether the current user has favorited a given restaurant id (from /auth/me + favorites cache). */
export function useIsFavorite() {
  const { user } = useAuth();
  const favSet = new Set((user?.favorites || []).map(String));
  return (id) => favSet.has(String(id));
}
