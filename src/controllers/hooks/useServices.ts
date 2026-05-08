import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/controllers/api/axiosInstance';
import type { Service, ServiceCategory } from '@/models';

// DB: service(id_s, name, description, base_price, id_c)
// DB: service_category(id_c, name, target_demographics, policies, icon)

interface UseServicesResult {
  services: Service[];
  categories: ServiceCategory[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getServiceById: (id_s: number) => Promise<Service | null>;
  createService: (data: { name: string; description?: string; base_price?: number; id_c?: number }) => Promise<void>;
  updateService: (id_s: number, data: Partial<Service>) => Promise<void>;
  deleteService: (id_s: number) => Promise<void>;
}

export const useServices = (): UseServicesResult => {
  const [services, setServices]     = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/services'),
        axiosInstance.get('/services/categories'),
      ]);
      setServices(servicesRes.data.services       ?? []);
      setCategories(categoriesRes.data.categories ?? []);
    } catch (err: any) {
      console.error('Load services error:', err);
      setError(err.response?.data?.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  // id_s is integer PK on service table
  const getServiceById = useCallback(async (id_s: number): Promise<Service | null> => {
    try {
      const res = await axiosInstance.get(`/services/${id_s}`);
      return res.data.service ?? null;
    } catch (err: any) {
      console.error('Get service error:', err);
      setError(err.response?.data?.message || 'Failed to load service');
      return null;
    }
  }, []);

  const createService = useCallback(async (data: {
    name: string;
    description?: string;
    base_price?: number;
    id_c?: number;        // FK → service_category.id_c (not category_id_fk)
  }) => {
    const res = await axiosInstance.post('/services', data);
    setServices(prev => [...prev, res.data.service]);
  }, []);

  const updateService = useCallback(async (id_s: number, data: Partial<Service>) => {
    const res = await axiosInstance.patch(`/services/${id_s}`, data);
    setServices(prev => prev.map(s => s.id_s === id_s ? res.data.service : s));
  }, []);

  const deleteService = useCallback(async (id_s: number) => {
    await axiosInstance.delete(`/services/${id_s}`);
    setServices(prev => prev.filter(s => s.id_s !== id_s));
  }, []);

  return {
    services,
    categories,
    isLoading,
    error,
    refresh: loadServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
  };
};