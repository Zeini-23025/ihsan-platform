import api from './api';

// ─── Validators ───────────────────────────────────────────────────────────────
export const getValidators = async () => {
  const r = await api.get('/admin/validateur/all-without-pagination');
  return extractList(r.data, 'validators');
};

export const createValidator = async (data: {
  nom: string; prenom: string; email: string; password: string; NNI: number;
}) => {
  const r = await api.post('/admin/validateur/add', data);
  return r.data;
};

export const deleteValidator = async (id: string) => {
  const r = await api.delete(`/admin/validateur/${id}`);
  return r.data;
};

// ─── Partners ─────────────────────────────────────────────────────────────────
export const getPartners = async () => {
  const r = await api.get('/admin/partenaire/all');
  return extractList(r.data, 'partners');
};

export const createPartner = async (data: {
  business_name: string; business_type: string; email: string;
  address: string; description: string; password: string;
}) => {
  const r = await api.post('/admin/partenaire/add', data);
  return r.data;
};

export const deletePartner = async (id: string) => {
  const r = await api.delete(`/admin/partenaire/${id}`);
  return r.data;
};

// ─── Donors ───────────────────────────────────────────────────────────────────
export const getDonors = async () => {
  const r = await api.get('/admin/donneur/all');
  return extractList(r.data, 'donors');
};

export const deleteDonor = async (id: string) => {
  const r = await api.delete(`/admin/donneur/${id}`);
  return r.data;
};

// ─── Needs ────────────────────────────────────────────────────────────────────
export const getAdminNeeds = async () => {
  const r = await api.get('/admin/need/all');
  return extractList(r.data, 'needs');
};

export const deleteNeed = async (id: string) => {
  const r = await api.delete(`/admin/need/${id}`);
  return r.data;
};

// ─── Proofs ───────────────────────────────────────────────────────────────────
export const getAdminProofs = async () => {
  const r = await api.get('/admin/proof/all');
  return extractList(r.data, 'proofs');
};

// ─── Helper ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractList = (d: any, label = ''): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;

  // named top-level arrays (backend-specific conventions)
  const topLevelKeys = ['donneurs', 'partenaires', 'validateurs', 'besoins', 'items', 'proofs', 'users', 'results'];
  for (const key of topLevelKeys) {
    if (Array.isArray(d[key])) {
      if (label) console.log(`[extractList:${label}] found key "${key}"`);
      return d[key];
    }
  }

  // d.data is an array
  if (d.data && Array.isArray(d.data)) return d.data;

  // d.data is an object containing items or data
  if (d.data && typeof d.data === 'object') {
    if (Array.isArray(d.data.items)) return d.data.items;
    if (Array.isArray(d.data.data))  return d.data.data;
    // Check all keys of d.data for arrays
    for (const key of Object.keys(d.data)) {
      if (Array.isArray(d.data[key])) {
        if (label) console.log(`[extractList:${label}] found nested key "data.${key}"`);
        return d.data[key];
      }
    }
  }

  // Last resort: any top-level key that is an array
  for (const key of Object.keys(d)) {
    if (Array.isArray(d[key])) {
      if (label) console.log(`[extractList:${label}] fallback key "${key}"`);
      return d[key];
    }
  }

  if (label) console.warn(`[extractList:${label}] could not find array in:`, d);
  return [];
};

