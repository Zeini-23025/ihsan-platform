import api from './api';

// ─── Validators ───────────────────────────────────────────────────────────────
export const getValidators = async () => {
  const r = await api.get('/admin/validateurs');
  return extractList(r.data);
};

export const createValidator = async (data: {
  nom: string; prenom: string; email: string; password: string; NNI: string;
}) => {
  const r = await api.post('/admin/validateurs/create', data);
  return r.data;
};

export const deleteValidator = async (id: string) => {
  const r = await api.delete(`/admin/validateurs/${id}`);
  return r.data;
};

// ─── Partners ─────────────────────────────────────────────────────────────────
export const getPartners = async () => {
  const r = await api.get('/admin/partenaires');
  return extractList(r.data);
};

export const createPartner = async (data: {
  business_name: string; business_type: string; email: string;
  address: string; description: string; password: string;
}) => {
  const r = await api.post('/admin/partenaires/create', data);
  return r.data;
};

export const deletePartner = async (id: string) => {
  const r = await api.delete(`/admin/partenaires/${id}`);
  return r.data;
};

// ─── Donors ───────────────────────────────────────────────────────────────────
export const getDonors = async () => {
  const r = await api.get('/admin/donneurs');
  return extractList(r.data);
};

export const deleteDonor = async (id: string) => {
  const r = await api.delete(`/admin/donneurs/${id}`);
  return r.data;
};

// ─── Needs ────────────────────────────────────────────────────────────────────
export const getAdminNeeds = async () => {
  const r = await api.get('/admin/besoins');
  return extractList(r.data);
};

export const deleteNeed = async (id: string) => {
  const r = await api.delete(`/admin/besoins/${id}`);
  return r.data;
};

// ─── Proofs ───────────────────────────────────────────────────────────────────
export const getAdminProofs = async () => {
  const r = await api.get('/admin/preuves');
  return extractList(r.data);
};

// ─── Helper ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractList = (d: any): any[] => {
  if (Array.isArray(d)) return d;
  if (d?.data && Array.isArray(d.data)) return d.data;
  if (d?.data?.data && Array.isArray(d.data.data)) return d.data.data;
  return [];
};
