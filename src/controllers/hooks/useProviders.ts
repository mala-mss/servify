import { useState, useEffect, useCallback } from 'react';
import { providerService } from '../services';
import { ServiceProvider, Service, ProviderAvailability } from '../models';

interface UseProvidersResult {
  providers: ServiceProvider[];
  isLoading: boolean;
  error: string | null;
  search: (filters?: { service_id?: string; min_price?: number; max_price?: number; min_rating?: number }) => Promise<void>;
  getProviderById: (id: string) => Promise<ServiceProvider | null>;
  checkAvailability: (providerId: string, date: string, time: string) => Promise<boolean>;
}

export const useProviders = (): UseProvidersResult => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (filters?: { service_id?: string; min_price?: number; max_price?: number; min_rating?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await providerService.search(filters);
      setProviders(response.providers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search providers');
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    / Initial load - fetch all providers
    search();
  }, [search]);

  const getProviderById = useCallback(async (id: string): Promise<ServiceProvider | null> => {
    try {
      const response = await providerService.getById(id);
      return response.provider;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load provider');
      return null;
    }
  }, []);

  const checkAvailability = useCallback(async (providerId: string, date: string, time: string): Promise<boolean> => {
    try {
      const response = await providerService.checkAvailability(providerId, date, time);
      return response.available;
    } catch (err: any) {
      return false;
    }
  }, []);

  return {
    providers,
    isLoading,
    error,
    search,
    getProviderById,
    checkAvailability,
  };
};












