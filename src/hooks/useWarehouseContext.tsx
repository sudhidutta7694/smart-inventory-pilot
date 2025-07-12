
import { useLocation } from 'react-router-dom';
import { useSouthWarehouse } from '@/contexts/SouthWarehouseContext';
import { useEastWarehouse } from '@/contexts/EastWarehouseContext';

export const useWarehouseContext = () => {
  const location = useLocation();
  
  if (location.pathname.includes('/south')) {
    return useSouthWarehouse();
  } else if (location.pathname.includes('/east')) {
    return useEastWarehouse();
  }
  
  // Fallback to South if route doesn't specify
  return useSouthWarehouse();
};
