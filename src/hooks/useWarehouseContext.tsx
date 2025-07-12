
import { useLocation } from 'react-router-dom';
import { useSouthWarehouse } from '@/contexts/SouthWarehouseContext';
import { useEastWarehouse } from '@/contexts/EastWarehouseContext';

export const useWarehouseContext = () => {
  const location = useLocation();
  
  try {
    if (location.pathname.includes('/south')) {
      return useSouthWarehouse();
    } else if (location.pathname.includes('/east')) {
      return useEastWarehouse();
    }
    
    // Fallback to South if route doesn't specify
    return useSouthWarehouse();
  } catch (error) {
    // If no context is available, return null or throw a more descriptive error
    throw new Error(`Warehouse context not available for route: ${location.pathname}`);
  }
};
