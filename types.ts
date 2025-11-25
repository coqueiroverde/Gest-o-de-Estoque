
export interface PriceHistoryEntry {
  date: string;
  price: number;
}

export interface InventoryItem {
  id: string;
  unitId: string; // Links item to specific branch
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  description: string;
  minStock: number;
  lastUpdated: string;
  priceHistory: PriceHistoryEntry[];
}

export interface AIItemSuggestion {
  category: string;
  description: string;
  suggestedPrice: number;
  minStockRecommendation: number;
  unitSuggestion: string;
}

export interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  categoriesCount: number;
}

// --- NEW TYPES FOR MOVEMENTS & REQUESTS ---

export type RestaurantUnit = 'P10' | 'P14' | 'AMS';

export const UNITS: { id: RestaurantUnit; label: string }[] = [
  { id: 'P10', label: 'Coqueiro Verde - Parque 10' },
  { id: 'P14', label: 'Coqueiro Verde - Praça 14' },
  { id: 'AMS', label: 'Coqueiro Verde - Amazonas Shopping' },
];

export type MovementType = 'ENTRY_PURCHASE' | 'EXIT_PRODUCTION' | 'EXIT_LOSS' | 'ENTRY_ADJUSTMENT' | 'EXIT_ADJUSTMENT';

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  unitId: string;
  type: MovementType;
  quantity: number;
  cost?: number; // Only relevant for entries
  reason?: string; // e.g. "Spoiled", "Event XYZ"
  date: string;
  user: string; // e.g., "Gerente", "Cozinha"
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Sector = 'COZINHA' | 'BAR' | 'SALAO' | 'ADMIN';

export interface MaterialRequest {
  id: string;
  unitId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  sector: Sector;
  status: RequestStatus;
  requestedAt: string;
  requesterName?: string; // Added to track who made the request
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'staff';
}

export interface PurchaseRecommendation {
  item: InventoryItem;
  shortfall: number; // How much is needed to reach minStock
}
