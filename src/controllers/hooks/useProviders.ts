import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/controllers/api/axiosInstance';
import type { ServiceProvider } from '@/models';

// Search filters map to DB columns on service_provider table:
// price_per_hour, rating, idu_sp (via providing → service)
interface ProviderFilters {
  service_id?  : number;   // FK → service.id_s
  min_price?   : number;   // service_provider.price_per_hour
  max_price?   : number;
  min_rating?  : number;   // service_provider.rating
  work_late?   : boolean;  // service_provider.work_late
  work_outside_city?: boolean; // service_provider.work_outside_city
}

interface UseProvidersResult {
  providers: ServiceProvider[];
  isLoading: boolean;
  error: string | null;
  search: (filters?: ProviderFilters) => Promise<void>;
  getProviderById: (idu_sp: number) => Promise<ServiceProvider | null>;
  checkAvailability: (idu_sp: number, date: string, time: string) => Promise<boolean>;
}

export const useProviders = (): UseProvidersResult => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const search = useCallback(async (filters?: ProviderFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/providers', { params: filters });
      setProviders(res.data.providers ?? []);
    } catch (err: any) {
      console.error('Search providers error:', err);
      setError(err.response?.data?.message || 'Failed to search providers');
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { search(); }, [search]);

  // idu_sp is the integer PK on service_provider (FK → user.id)
  const getProviderById = useCallback(async (idu_sp: number): Promise<ServiceProvider | null> => {
    try {
      const res = await axiosInstance.get(`/providers/${idu_sp}`);
      return res.data.provider ?? null;
    } catch (err: any) {
      console.error('Get provider error:', err);
      setError(err.response?.data?.message || 'Failed to load provider');
      return null;
    }
  }, []);

  // Checks against service_provider.day_of_week / start_time / end_time
  const checkAvailability = useCallback(async (
    idu_sp: number,
    date: string,   // DATE string e.g. "2024-06-15"
    time: string    // TIME string e.g. "09:00"
  ): Promise<boolean> => {
    try {
      const res = await axiosInstance.get(`/providers/${idu_sp}/availability`, {
        params: { date, time }
      });
      return res.data.available ?? false;
    } catch (err: any) {
      console.error('Check availability error:', err);
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