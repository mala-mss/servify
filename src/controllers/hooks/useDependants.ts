import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/controllers/api/axiosInstance';
import type { Dependant, MedicalInfo, AuthorizedPerson } from '@/models';

// DB: dependant(id_dep, name, date_of_birth, relationship, id_u_cl)
// DB: medical_info(id_dep, blood_type, allergies, medications, conditions)
// DB: authorized_person(id_ap, name, phone_number, national_id, id_u_cl)

interface UseDependantsResult {
  dependants: Dependant[];
  authorizedPeople: AuthorizedPerson[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addDependant: (data: { name: string; date_of_birth: string; relationship: string }) => Promise<void>;
  updateDependant: (id_dep: number, data: Partial<Dependant>) => Promise<void>;
  deleteDependant: (id_dep: number) => Promise<void>;
  getMedicalInfo: (id_dep: number) => Promise<MedicalInfo | null>;
  updateMedicalInfo: (id_dep: number, data: Partial<MedicalInfo>) => Promise<void>;
  addAuthorizedPerson: (data: { name: string; phone_number: string; national_id?: string }) => Promise<void>;
  updateAuthorizedPerson: (id_ap: number, data: Partial<AuthorizedPerson>) => Promise<void>;
  removeAuthorizedPerson: (id_ap: number) => Promise<void>;
}

export const useDependants = (): UseDependantsResult => {
  const [dependants, setDependants]         = useState<Dependant[]>([]);
  const [authorizedPeople, setAuthorized]   = useState<AuthorizedPerson[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [depRes, authRes] = await Promise.all([
        axiosInstance.get('/dependants'),
        axiosInstance.get('/authorized-persons'),
      ]);
      setDependants(depRes.data.dependants         ?? []);
      setAuthorized(authRes.data.authorizedPeople  ?? []);
    } catch (err: any) {
      console.error('Load dependants error:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Dependants ──────────────────────────────────────────────

  const addDependant = useCallback(async (data: {
    name: string;           // DB has single "name" column, not first+last
    date_of_birth: string;
    relationship: string;
  }) => {
    const res = await axiosInstance.post('/dependants', data);
    setDependants(prev => [...prev, res.data.dependant]);
  }, []);

  const updateDependant = useCallback(async (id_dep: number, data: Partial<Dependant>) => {
    const res = await axiosInstance.patch(`/dependants/${id_dep}`, data);
    setDependants(prev => prev.map(d => d.id_dep === id_dep ? res.data.dependant : d));
  }, []);

  const deleteDependant = useCallback(async (id_dep: number) => {
    await axiosInstance.delete(`/dependants/${id_dep}`);
    setDependants(prev => prev.filter(d => d.id_dep !== id_dep));
  }, []);

  // ── Medical Info ────────────────────────────────────────────

  const getMedicalInfo = useCallback(async (id_dep: number): Promise<MedicalInfo | null> => {
    try {
      const res = await axiosInstance.get(`/dependants/${id_dep}/medical`);
      return res.data.medicalInfo ?? null;
    } catch (err: any) {
      console.error('Get medical info error:', err);
      return null;
    }
  }, []);

  const updateMedicalInfo = useCallback(async (id_dep: number, data: Partial<MedicalInfo>) => {
    // DB columns: blood_type, allergies, medications, conditions
    await axiosInstance.patch(`/dependants/${id_dep}/medical`, data);
  }, []);

  // ── Authorized Persons ──────────────────────────────────────

  const addAuthorizedPerson = useCallback(async (data: {
    name: string;           // DB has single "name" column
    phone_number: string;   // DB column is phone_number, not phone
    national_id?: string;
  }) => {
    const res = await axiosInstance.post('/authorized-persons', data);
    setAuthorized(prev => [...prev, res.data.authorizedPerson]);
  }, []);

  const updateAuthorizedPerson = useCallback(async (id_ap: number, data: Partial<AuthorizedPerson>) => {
    const res = await axiosInstance.patch(`/authorized-persons/${id_ap}`, data);
    setAuthorized(prev => prev.map(a => a.id_ap === id_ap ? res.data.authorizedPerson : a));
  }, []);

  const removeAuthorizedPerson = useCallback(async (id_ap: number) => {
    await axiosInstance.delete(`/authorized-persons/${id_ap}`);
    setAuthorized(prev => prev.filter(a => a.id_ap !== id_ap));
  }, []);

  return {
    dependants,
    authorizedPeople,
    isLoading,
    error,
    refresh: loadData,
    addDependant,
    updateDependant,
    deleteDependant,
    getMedicalInfo,
    updateMedicalInfo,
    addAuthorizedPerson,
    updateAuthorizedPerson,
    removeAuthorizedPerson,
  };
};