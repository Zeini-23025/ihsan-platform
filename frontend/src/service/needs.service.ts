import api from './api';
import type { Need, NeedCreateRequest, PaginatedResponse, ApiResponse, NeedStatus } from '../types';

const NOUAKCHOTT_ZONES = [
  { name: 'Tevragh Zeina', lat: 18.094, lng: -15.977 },
  { name: 'El Mina', lat: 18.069, lng: -16.014 },
  { name: 'Dar Naim', lat: 18.116, lng: -15.966 },
  { name: 'Toujounine', lat: 18.139, lng: -15.920 },
  { name: 'Ksar', lat: 18.079, lng: -15.993 },
  { name: 'Sebkha', lat: 18.063, lng: -15.983 },
  { name: 'Riyadh', lat: 18.087, lng: -15.955 },
  { name: 'Riyad', lat: 18.087, lng: -15.955 }, // Alias for spelling
  { name: 'Arafat', lat: 18.049, lng: -15.957 },
];

export const getPublicNeeds = async (
  page = 1,
  limit = 12,
  city?: string,
  status?: string
): Promise<PaginatedResponse<Need>> => {
  // FIX: DO NOT send `city` or `status` to the backend!
  // The backend's Swagger specifies `?city=`, but since the backend database doesn't actually store the city name (only coords), 
  // asking the backend to filter by city makes it return an empty array [] every time!
  const params: Record<string, string | number> = { page: 1, limit: 100 }; // Fetch max to filter locally
  const response = await api.get('/public/needs', { params });
  
  let rawData: Need[] = [];
  const d = response.data;
  if (Array.isArray(d)) rawData = d;
  else if (d?.data && Array.isArray(d.data)) rawData = d.data;
  else if (d?.data?.data && Array.isArray(d.data.data)) rawData = d.data.data;

  // IMPORTANT: The backend uses a different Status Enum than the frontend expects.
  // Backend: PENDING, ACCEPTED, COMPLETED
  // Frontend: OPEN, FUNDED, CONFIRMED
  rawData = rawData.map(n => {
    const rawStatus = n.status as unknown as string;
    let mappedStatus = rawStatus;
    if (rawStatus === 'PENDING') mappedStatus = 'OPEN';
    if (rawStatus === 'ACCEPTED') mappedStatus = 'FUNDED';
    if (rawStatus === 'COMPLETED') mappedStatus = 'CONFIRMED';
    return { ...n, status: mappedStatus as NeedStatus };
  });

  // Apply strict LOCAL filtering to guarantee it works 100%
  if (city) {
    const cityLower = city.toLowerCase();
    rawData = rawData.filter(n => {
      // 1. Text checks (Title/Description/Partner Address)
      const t = (n.title || '').toLowerCase();
      const desc = (n.description || '').toLowerCase();
      const a = (n.partenaire?.address || '').toLowerCase();
      if (t.includes(cityLower) || desc.includes(cityLower) || a.includes(cityLower)) {
        return true;
      }
      
      // 2. Reverse-geocoding fallback via Euclidean distance to known zones
      if (n.approxLat && n.approxLng) {
        let closestZone = NOUAKCHOTT_ZONES[0];
        let minDist = Infinity;
        for (const z of NOUAKCHOTT_ZONES) {
          const dist = Math.pow(n.approxLat - z.lat, 2) + Math.pow(n.approxLng - z.lng, 2);
          if (dist < minDist) {
            minDist = dist;
            closestZone = z;
          }
        }
        if (closestZone.name.toLowerCase() === cityLower) return true;
      }
      return false;
    });
  }
  
  if (status) {
    rawData = rawData.filter(n => n.status === status);
  }

  // Handle local pagination after filtering
  const startIndex = (page - 1) * limit;
  const paginatedData = rawData.slice(startIndex, startIndex + limit);

  return { 
    data: paginatedData, 
    total: rawData.length, 
    page, 
    limit 
  };
};

export const getNeedById = async (id: string): Promise<Need> => {
  // Backend lacks /public/needs/:id, so fetch list and find locally
  const res = await getPublicNeeds(1, 100);
  const found = res.data.find((n: Need) => String(n.id) === String(id));
  if (found) return found;
  throw new Error('Besoin introuvable');
};

export const getValidatorNeeds = async (
  page = 1,
  limit = 12
): Promise<PaginatedResponse<Need>> => {
  const response = await api.get('/validateur/need/all', { params: { page, limit } });
  const d = response.data;
  if (Array.isArray(d)) return { data: d, total: d.length, page: 1, limit: d.length };
  if (d?.data && Array.isArray(d.data)) return d;
  if (d?.data?.data) return d.data;
  return { data: [], total: 0, page: 1, limit };
};

export const createNeed = async (data: NeedCreateRequest): Promise<ApiResponse<Need>> => {
  const response = await api.post('/validateur/need/add', data);
  return response.data;
};

export const completeNeed = async (needId: string, formData: FormData): Promise<ApiResponse<Need>> => {
  const response = await api.patch(`/validateur/need/${needId}/complete`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
