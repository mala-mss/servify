import { useState, useEffect, useCallback } from 'react';
import { serviceService } from '../services';
import { Service, ServiceCategory } from '../models';

interface UseServicesResult {
  services: Service[];
  categories: ServiceCategory[];
  isLoading: boolean;
  error: string | null;
  getServiceById: (id: string) => Promise<Service | null>;
  createService: (data: { name: string; description: string; base_price: number; category_id_fk: string }) => Promise<void>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

export const useServices = (): UseServicesResult => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [servicesRes, categoriesRes] = await Promise.all([
        serviceService.getAll(),
        serviceService.getCategories(),
      ]);
      setServices(servicesRes.services);
      setCategories(categoriesRes.categories);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const getServiceById = useCallback(async (id: string): Promise<Service | null> => {
    try {
      const response = await serviceService.getById(id);
      return response.service;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load service');
      return null;
    }
  }, []);

  const createService = useCallback(async (data: { name: string; description: string; base_price: number; category_id_fk: string }) => {
    const response = await serviceService.create(data);
    setServices(prev => [...prev, response.service]);
  }, []);

  const updateService = useCallback(async (id: string, data: Partial<Service>) => {
    const response = await serviceService.update(id, data);
    setServices(prev => prev.map(s => s.id === id ? response.service : s));
  }, []);

  const deleteService = useCallback(async (id: string) => {
    await serviceService.delete(id);
    setServices(prev => prev.filter(s => s.id !== id));
  }, []);

  return {
    services,
    categories,
    isLoading,
    error,
    getServiceById,
    createService,
    updateService,
    deleteService,
  };
};












