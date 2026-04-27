import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services';
import { Dependant, MedicalInfo, AuthorizedPerson } from '../models';

interface UseDependantsResult {
  dependants: Dependant[];
  authorizedPeople: AuthorizedPerson[];
  isLoading: boolean;
  error: string | null;
  addDependant: (data: { first_name: string; last_name: string; date_of_birth: string; relationship: string }) => Promise<void>;
  updateDependant: (id: string, data: Partial<Dependant>) => Promise<void>;
  deleteDependant: (id: string) => Promise<void>;
  getMedicalInfo: (dependantId: string) => Promise<MedicalInfo | null>;
  updateMedicalInfo: (dependantId: string, data: Partial<MedicalInfo>) => Promise<void>;
  addAuthorizedPerson: (data: { first_name: string; last_name: string; phone: string; email?: string; relationship: string }) => Promise<void>;
  updateAuthorizedPerson: (id: string, data: Partial<AuthorizedPerson>) => Promise<void>;
  removeAuthorizedPerson: (id: string) => Promise<void>;
}

export const useDependants = (): UseDependantsResult => {
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [authorizedPeople, setAuthorizedPeople] = useState<AuthorizedPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [dependantsRes, authorizedRes] = await Promise.all([
        userService.getDependants(),
        userService.getAuthorizedPeople(),
      ]);
      setDependants(dependantsRes.dependants);
      setAuthorizedPeople(authorizedRes.authorizedPeople);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addDependant = useCallback(async (data: { first_name: string; last_name: string; date_of_birth: string; relationship: string }) => {
    const response = await userService.addDependant(data);
    setDependants(prev => [...prev, response.dependant]);
  }, []);

  const updateDependant = useCallback(async (id: string, data: Partial<Dependant>) => {
    const response = await userService.updateDependant(id, data);
    setDependants(prev => prev.map(d => d.id === id ? response.dependant : d));
  }, []);

  const deleteDependant = useCallback(async (id: string) => {
    await userService.deleteDependant(id);
    setDependants(prev => prev.filter(d => d.id !== id));
  }, []);

  const getMedicalInfo = useCallback(async (dependantId: string): Promise<MedicalInfo | null> => {
    try {
      const response = await userService.getMedicalInfo(dependantId);
      return response.medicalInfo;
    } catch (err: any) {
      return null;
    }
  }, []);

  const updateMedicalInfo = useCallback(async (dependantId: string, data: Partial<MedicalInfo>) => {
    const response = await userService.updateMedicalInfo(dependantId, data);
    / Update is handled via getMedicalInfo refetch if needed
  }, []);

  const addAuthorizedPerson = useCallback(async (data: { first_name: string; last_name: string; phone: string; email?: string; relationship: string }) => {
    const response = await userService.addAuthorizedPerson(data);
    setAuthorizedPeople(prev => [...prev, response.authorizedPerson]);
  }, []);

  const updateAuthorizedPerson = useCallback(async (id: string, data: Partial<AuthorizedPerson>) => {
    const response = await userService.updateAuthorizedPerson(id, data);
    setAuthorizedPeople(prev => prev.map(a => a.id === id ? response.authorizedPerson : a));
  }, []);

  const removeAuthorizedPerson = useCallback(async (id: string) => {
    await userService.removeAuthorizedPerson(id);
    setAuthorizedPeople(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    dependants,
    authorizedPeople,
    isLoading,
    error,
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












