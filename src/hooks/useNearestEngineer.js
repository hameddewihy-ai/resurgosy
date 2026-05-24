import { useState, useCallback } from 'react';

// Mock registered engineers — replace with real API call
const MOCK_ENGINEERS = [
  { id: 'eng-001', full_name: 'أحمد الخطيب',    city: 'دمشق',   lat: 33.5102, lng: 36.2915, rating: 4.9, inspections: 142, license: 'ENG-2019-00441', specialty: 'سكني وتجاري' },
  { id: 'eng-002', full_name: 'ليلى إبراهيم',   city: 'حلب',    lat: 36.2021, lng: 37.1343, rating: 4.7, inspections: 98,  license: 'ENG-2020-00822', specialty: 'صناعي وتجاري' },
  { id: 'eng-003', full_name: 'طارق العمر',      city: 'حمص',    lat: 34.7304, lng: 36.7137, rating: 4.8, inspections: 76,  license: 'ENG-2021-01103', specialty: 'سكني' },
  { id: 'eng-004', full_name: 'رنا السيد',       city: 'اللاذقية',lat: 35.5253, lng: 35.7918, rating: 4.6, inspections: 54,  license: 'ENG-2022-01544', specialty: 'سياحي وسكني' },
  { id: 'eng-005', full_name: 'محمد الحلبي',     city: 'حماة',   lat: 35.1340, lng: 36.7572, rating: 4.5, inspections: 33,  license: 'ENG-2023-01891', specialty: 'صناعي' },
];

// Haversine formula — returns distance in km
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useNearestEngineer() {
  const [state, setState] = useState({ engineers: [], loading: false, error: null, userCoords: null });

  const findNearest = useCallback(async (propertyLat, propertyLng) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Simulate API latency
      await new Promise((r) => setTimeout(r, 600));
      const ranked = MOCK_ENGINEERS
        .map((eng) => ({ ...eng, distanceKm: Math.round(haversine(propertyLat, propertyLng, eng.lat, eng.lng)) }))
        .sort((a, b) => a.distanceKm - b.distanceKm);
      setState({ engineers: ranked, loading: false, error: null, userCoords: { lat: propertyLat, lng: propertyLng } });
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'تعذّر تحميل قائمة المهندسين' }));
    }
  }, []);

  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('الجهاز لا يدعم تحديد الموقع')); return; }
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
        () => resolve({ lat: 33.5138, lng: 36.2765 }) // fallback: Damascus
      );
    });
  }, []);

  return { ...state, findNearest, getUserLocation };
}
