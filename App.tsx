
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ChefHat,
  Trash2,
  Edit2,
  BrainCircuit,
  RefreshCw,
  Utensils,
  Filter,
  Sparkles,
  AlertCircle,
  ArrowRightLeft,
  Building2,
  History,
  ClipboardList,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  Menu,
  Layers,
  ClipboardCheck,
  ShoppingCart,
  XOctagon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { 
  InventoryItem, 
  DashboardStats, 
  RestaurantUnit, 
  UNITS, 
  StockTransaction, 
  MovementType,
  MaterialRequest,
  Sector,
  User,
  PriceHistoryEntry
} from './types';
import { generateInventoryInsights } from './services/geminiService';
import { InventoryForm } from './components/InventoryForm';
import { StockMovementModal } from './components/StockMovementModal';
import { MaterialRequestModal } from './components/MaterialRequestModal';
import { BulkMovementModal } from './components/BulkMovementModal';
import { BulkRequestModal } from './components/BulkRequestModal';
import { StockCountModal } from './components/StockCountModal';
import { PurchaseOrderModal } from './components/PurchaseOrderModal';
import { StatsCard } from './components/StatsCard';
import { InventoryChart } from './components/InventoryChart';
import { LoginScreen } from './components/LoginScreen';

// Helper to generate initial data
const createItem = (id: string, unitId: string, name: string, cat: string, min: number, unit: string, price: number = 0): InventoryItem => ({
  id: `${id}-${unitId}`,
  unitId,
  name,
  category: cat,
  quantity: min + (min > 0 ? Math.ceil(min * 0.2) : 0), // Start slightly above min
  unit,
  price,
  minStock: min,
  description: 'Carga Inicial',
  lastUpdated: new Date().toISOString(),
  priceHistory: [{ date: new Date().toISOString(), price }]
});

const RAW_DATA = [
  // Mercearia
  { name: 'MARGARINA BALDE 15KG', cat: 'Mercearia', unit: 'un', p14: 2, p10: 2 },
  { name: 'ÓLEO CX 20', cat: 'Mercearia', unit: 'cx', p14: 5, p10: 5 },
  { name: 'QUEIJO RALADO PC 50GR', cat: 'Mercearia', unit: 'pct', p14: 1, p10: 1 },
  { name: 'SAL COMUM FD 30', cat: 'Mercearia', unit: 'pct', p14: 1, p10: 1 },
  { name: 'SAL REFINADO FD 10 LEBR', cat: 'Mercearia', unit: 'pct', p14: 3, p10: 0 },
  { name: 'SAL SACHÊ CX 2000', cat: 'Mercearia', unit: 'cx', p14: 1, p10: 1 },
  { name: 'SAZON FEIJÃO PC 12 SACH', cat: 'Mercearia', unit: 'pct', p14: 15, p10: 15 },
  { name: 'TRIGO KG', cat: 'Mercearia', unit: 'kg', p14: 1, p10: 1 },
  { name: 'VINAGRE BRANCO 750ML', cat: 'Mercearia', unit: 'un', p14: 24, p10: 24 },
  { name: 'SAL GROSSO KG', cat: 'Mercearia', unit: 'kg', p14: 3, p10: 3 },
  
  // Limpeza
  { name: 'ÁGUA SANITÁRIA 5L', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'ALCOOL 5L', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'BOMBRIL PCT 14', cat: 'Limpeza', unit: 'pct', p14: 1, p10: 1 },
  { name: 'CERA 5L', cat: 'Limpeza', unit: 'L', p14: 0, p10: 0 },
  { name: 'DESENGORDURANTE/DES', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'DESINFETANTE 5L', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'DETERGENTE MÁQUINA 5', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'DETERGENTE NEUTRO 5L', cat: 'Limpeza', unit: 'L', p14: 2, p10: 2 },
  { name: 'DETERGERTE ÁREA EXTER', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'ESPONJA PCT 4', cat: 'Limpeza', unit: 'pct', p14: 1, p10: 1 },
  { name: 'FIBRA DE LIMPEZA PESAD', cat: 'Limpeza', unit: 'un', p14: 1, p10: 1 },
  { name: 'LIMPA ALUMÍNIO 5L', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'LIMPA FORNO UN', cat: 'Limpeza', unit: 'un', p14: 0, p10: 0 },
  { name: 'PANO DE CHÃO', cat: 'Limpeza', unit: 'un', p14: 4, p10: 4 },
  { name: 'PANO MULTI USO BRANCO', cat: 'Limpeza', unit: 'un', p14: 1, p10: 1 },
  { name: 'PANO MULTI USO VERDE', cat: 'Limpeza', unit: 'un', p14: 1, p10: 1 },
  { name: 'PASTILHA DE CLORO', cat: 'Limpeza', unit: 'un', p14: 2, p10: 2 },
  { name: 'PROTETOR DE ASSENTO C', cat: 'Limpeza', unit: 'cx', p14: 2, p10: 2 },
  { name: 'RODO', cat: 'Limpeza', unit: 'un', p14: 0, p10: 0 },
  { name: 'SABONETE LÍQUIDO 5L', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'SECANTE MÁQUINA 5L', cat: 'Limpeza', unit: 'L', p14: 1, p10: 1 },
  { name: 'VASSOURA', cat: 'Limpeza', unit: 'un', p14: 0, p10: 0 },
  { name: 'LUVA LIMPEZA PESADA', cat: 'Limpeza', unit: 'un', p14: 0, p10: 0 },

  // Material de Expediente
  { name: 'BOBINA AMARELA CX', cat: 'Expediente', unit: 'cx', p14: 2, p10: 2 },
  { name: 'BOBINA BRANCA CX', cat: 'Expediente', unit: 'cx', p14: 0, p10: 0 },
  { name: 'BOBINA ROSA CX', cat: 'Expediente', unit: 'cx', p14: 0, p10: 0 },
  { name: 'CLIPS TAMANHO 4 CX', cat: 'Expediente', unit: 'cx', p14: 1, p10: 1 },
  { name: 'GRAMPO 26/6 CX', cat: 'Expediente', unit: 'cx', p14: 1, p10: 1 },
  { name: 'LACRE DELIVERY MILHEIRO', cat: 'Expediente', unit: 'un', p14: 5, p10: 5 },
  { name: 'LIGA ELÁSTICA PCT C/50', cat: 'Expediente', unit: 'pct', p14: 1, p10: 1 },
  { name: 'PAPEL CHAMBRIL PCT 500', cat: 'Expediente', unit: 'pct', p14: 2, p10: 2 },
  { name: 'PAPEL A4 RESMA', cat: 'Expediente', unit: 'pct', p14: 2, p10: 2 },
  { name: 'BLOCO DE VALE', cat: 'Expediente', unit: 'un', p14: 1, p10: 1 },

  // Outros
  { name: 'VENENO DE BARATA GEL', cat: 'Outros', unit: 'un', p14: 0, p10: 0 },
  { name: 'VENENO DE BARATA LÍQU', cat: 'Outros', unit: 'L', p14: 0, p10: 0 },

  // Carnes / Proteínas
  { name: 'PICADINHO 1 KG', cat: 'Carnes', unit: 'kg', p14: 5, p10: 0 },
  { name: 'ISCA DE CARNE 1 KG', cat: 'Carnes', unit: 'kg', p14: 5, p10: 0 },
  { name: 'BIFE 1 KG', cat: 'Carnes', unit: 'kg', p14: 5, p10: 0 },
  { name: 'LINGUIÇA DE FRANGO PCT', cat: 'Carnes', unit: 'pct', p14: 5, p10: 0 },
  { name: 'ACEM 5 KG', cat: 'Carnes', unit: 'kg', p14: 5, p10: 0 },
  { name: 'FRANGO CX', cat: 'Carnes', unit: 'cx', p14: 1, p10: 0 },
  { name: 'QUEIJO ESPETO PCT', cat: 'Carnes', unit: 'pct', p14: 20, p10: 10 },
  { name: 'ANEIS DE CEBOLA PCT', cat: 'Carnes', unit: 'pct', p14: 3, p10: 0 },
  { name: 'BACON PC', cat: 'Carnes', unit: 'pct', p14: 2, p10: 3 },
  { name: 'CORAÇÃO DE FRANGO PCT', cat: 'Carnes', unit: 'pct', p14: 2, p10: 1 },
  { name: 'LINGUIÇA TOSCANA PCT', cat: 'Carnes', unit: 'pct', p14: 5, p10: 2 },

  // Descartáveis
  { name: 'CANUDO BIODEGRADÁVEL PC 100', cat: 'Descartáveis', unit: 'pct', p14: 2, p10: 0 },
  { name: 'CANUDO DRINKS PC 100', cat: 'Descartáveis', unit: 'pct', p14: 1, p10: 0 },
  { name: 'COPO 180ML PC', cat: 'Descartáveis', unit: 'pct', p14: 1, p10: 3 },
  { name: 'DUREX FINO PC 16', cat: 'Descartáveis', unit: 'pct', p14: 0, p10: 5 },
  { name: 'DUREX GROSSO UN', cat: 'Descartáveis', unit: 'un', p14: 0, p10: 5 },
  { name: 'EMBALAGEM AG50 CX 4X125', cat: 'Descartáveis', unit: 'cx', p14: 9, p10: 9 },
  { name: 'EMBALAGEM D7 PC 100', cat: 'Descartáveis', unit: 'pct', p14: 1, p10: 1 },
  { name: 'EMBALAGEM G-302 CX C/100', cat: 'Descartáveis', unit: 'cx', p14: 6, p10: 6 },
  { name: 'EMBALAGEM G-645 CX C/100', cat: 'Descartáveis', unit: 'cx', p14: 6, p10: 2 },
  { name: 'EMBALAGEM G-742 CX C/200', cat: 'Descartáveis', unit: 'cx', p14: 3, p10: 2 },
  { name: 'FILME SELADORA GRANDE', cat: 'Descartáveis', unit: 'un', p14: 15, p10: 10 },
  { name: 'FILME SELADORA PEQUENO', cat: 'Descartáveis', unit: 'un', p14: 0, p10: 0 },
  { name: 'FILTRO DE CAFÉ 103 CX', cat: 'Descartáveis', unit: 'cx', p14: 0, p10: 3 },
  { name: 'GARRAFA PET 100ML PCT C/30', cat: 'Descartáveis', unit: 'pct', p14: 15, p10: 14 },
  { name: 'GARRAFA PET 1L PCT C/30', cat: 'Descartáveis', unit: 'pct', p14: 10, p10: 10 },
  { name: 'GARRAFA PET 300ML PCT C/30', cat: 'Descartáveis', unit: 'pct', p14: 10, p10: 10 },
  { name: 'GARRAFA PET 500ML PCT C/30', cat: 'Descartáveis', unit: 'pct', p14: 10, p10: 10 },
  { name: 'GUARDANAPO INTERFOLHADO CX C/6000', cat: 'Descartáveis', unit: 'cx', p14: 1, p10: 1 },
  { name: 'LUVAS DESCARTAVEIS CX', cat: 'Descartáveis', unit: 'cx', p14: 0, p10: 0 },
  { name: 'MEXEDOR DE CAFÉ PC 500', cat: 'Descartáveis', unit: 'pct', p14: 5, p10: 2 },
  { name: 'PAILITO DE DENTE EMBALADO CX 2000', cat: 'Descartáveis', unit: 'cx', p14: 0, p10: 2 },
  { name: 'PAPEL HIGIÊNICO ROLO PCT C/8 200 METR', cat: 'Descartáveis', unit: 'pct', p14: 3, p10: 2 },
  { name: 'PAPEL TOALHA ROLO 200MTS C/6', cat: 'Descartáveis', unit: 'un', p14: 0, p10: 4 },
  { name: 'PRATO DESCARTÁVEL 21 RASO PCT', cat: 'Descartáveis', unit: 'pct', p14: 2, p10: 2 },
  { name: 'SACO 1/2KG PCT', cat: 'Descartáveis', unit: 'pct', p14: 7, p10: 4 },
  { name: 'SACO 24X38 TRANSP PCT C/100', cat: 'Descartáveis', unit: 'pct', p14: 1, p10: 2 },
  { name: 'SACO ADESIVO 8X10 PCT', cat: 'Descartáveis', unit: 'pct', p14: 1, p10: 0 },
  { name: 'SACO CRAFT PCT 100', cat: 'Descartáveis', unit: 'pct', p14: 15, p10: 9 },
  { name: 'SACO DE LIXO 200LTS PCT 50', cat: 'Descartáveis', unit: 'pct', p14: 3, p10: 2 },
  { name: 'SACO DE LIXO 50 LTS PTC 100', cat: 'Descartáveis', unit: 'pct', p14: 2, p10: 2 },
  { name: 'SACO DINDIN PCT 500', cat: 'Descartáveis', unit: 'pct', p14: 4, p10: 4 },
  { name: 'SACO METALIZADO C/2000', cat: 'Descartáveis', unit: 'un', p14: 2, p10: 2 },
  { name: 'SACOLA BRANCA 8KG PCT 100', cat: 'Descartáveis', unit: 'pct', p14: 1, p10: 2 },
  { name: 'TALHERES DESCARTÁVEIS C/50', cat: 'Descartáveis', unit: 'pct', p14: 1, p10: 0 },
  { name: 'TOUCA DESCARTÁVEL PCT C/100', cat: 'Descartáveis', unit: 'pct', p14: 1, p10: 1 },
  { name: 'VELA VULÇÃO AZUL', cat: 'Descartáveis', unit: 'un', p14: 5, p10: 5 },
  { name: 'VELA VULÇÃO ROSA', cat: 'Descartáveis', unit: 'un', p14: 6, p10: 5 },
];

const INITIAL_ITEMS: InventoryItem[] = RAW_DATA.flatMap((d, index) => [
  createItem(`${index}`, 'P14', d.name, d.cat, d.p14, d.unit),
  createItem(`${index}`, 'P10', d.name, d.cat, d.p10, d.unit)
]);

export function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('cv_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = () => {
    const mockUser: User = {
      id: 'u1',
      name: 'Chef Executivo',
      email: 'chef@coqueiroverde.com.br',
      avatar: '',
      role: 'admin'
    };
    localStorage.setItem('cv_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('cv_user');
    setUser(null);
  };

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'requests' | 'losses' | 'history'>('dashboard');
  const [selectedUnit, setSelectedUnit] = useState<RestaurantUnit>('P10');
  
  // Data State
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('cv_inventory_data');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem('cv_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [requests, setRequests] = useState<MaterialRequest[]>(() => {
    const saved = localStorage.getItem('cv_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  // Bulk Modal States
  const [isBulkMovementOpen, setIsBulkMovementOpen] = useState(false);
  const [isBulkRequestOpen, setIsBulkRequestOpen] = useState(false);
  const [isStockCountOpen, setIsStockCountOpen] = useState(false);
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('cv_inventory_data', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('cv_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('cv_requests', JSON.stringify(requests));
  }, [requests]);

  // --- DERIVED DATA ---
  const currentUnitItems = useMemo(() => {
    return items.filter(item => item.unitId === selectedUnit);
  }, [items, selectedUnit]);

  const filteredItems = useMemo(() => {
    return currentUnitItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentUnitItems, searchTerm]);

  const currentUnitRequests = useMemo(() => {
    return requests.filter(r => r.unitId === selectedUnit).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [requests, selectedUnit]);

  const currentUnitTransactions = useMemo(() => {
    return transactions.filter(t => t.unitId === selectedUnit).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedUnit]);

  const currentUnitLosses = useMemo(() => {
    return currentUnitTransactions.filter(t => t.type === 'EXIT_LOSS');
  }, [currentUnitTransactions]);

  const stats: DashboardStats = useMemo(() => {
    return {
      totalItems: currentUnitItems.length,
      totalValue: currentUnitItems.reduce((acc, item) => acc + (item.quantity * item.price), 0),
      lowStockCount: currentUnitItems.filter(item => item.quantity < item.minStock).length,
      categoriesCount: new Set(currentUnitItems.map(i => i.category)).size
    };
  }, [currentUnitItems]);

  const lowStockItems = useMemo(() => {
    return currentUnitItems.filter(item => item.quantity < item.minStock);
  }, [currentUnitItems]);

  // --- HANDLERS ---

  // Inventory CRUD
  const handleSaveItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'unitId' | 'priceHistory'>) => {
    if (editingItem) {
      setItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          const updatedItem = { 
            ...item, 
            ...itemData, 
            lastUpdated: new Date().toISOString() 
          };
          
          // Add to price history if price changed
          if (item.price !== itemData.price) {
            updatedItem.priceHistory = [
              ...(item.priceHistory || []),
              { date: new Date().toISOString(), price: itemData.price }
            ];
          }
          return updatedItem;
        }
        return item;
      }));
    } else {
      const newItem: InventoryItem = {
        ...itemData,
        id: crypto.randomUUID(),
        unitId: selectedUnit, // Force current unit
        lastUpdated: new Date().toISOString(),
        priceHistory: [{ date: new Date().toISOString(), price: itemData.price }]
      };
      setItems(prev => [...prev, newItem]);
    }
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja remover este item do cadastro? O histórico será mantido.')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Stock Movement Logic (Single)
  const handleRegisterMovement = (type: MovementType, quantity: number, reason: string, newCost?: number) => {
    if (!selectedItemForMovement) return;

    // 1. Update Inventory Item
    setItems(prev => prev.map(item => {
      if (item.id === selectedItemForMovement.id) {
        let newQty = item.quantity;
        let newPrice = item.price;
        let updatedHistory = item.priceHistory || [];

        if (type === 'ENTRY_PURCHASE') {
          newQty += quantity;
          if (newCost !== undefined) {
             // If price changed, update history
             if (newCost !== item.price) {
               updatedHistory = [...updatedHistory, { date: new Date().toISOString(), price: newCost }];
             }
             newPrice = newCost;
          }
        } else {
          newQty -= quantity;
        }

        return {
          ...item,
          quantity: Math.max(0, newQty),
          price: newPrice,
          priceHistory: updatedHistory,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));

    // 2. Create Transaction Log
    const transaction: StockTransaction = {
      id: crypto.randomUUID(),
      itemId: selectedItemForMovement.id,
      itemName: selectedItemForMovement.name,
      unitId: selectedUnit,
      type,
      quantity,
      cost: newCost,
      reason,
      date: new Date().toISOString(),
      user: user?.name || 'Sistema'
    };

    setTransactions(prev => [transaction, ...prev]);
    setIsMovementModalOpen(false);
    setSelectedItemForMovement(null);
  };

  // Bulk Stock Movement
  const handleBulkMovement = (movements: { itemId: string; quantity: number; cost?: number }[], type: MovementType, reason: string) => {
    const timestamp = new Date().toISOString();
    const newTransactions: StockTransaction[] = [];

    // Update Items
    setItems(prevItems => {
      return prevItems.map(item => {
        const move = movements.find(m => m.itemId === item.id);
        if (move) {
          let newQty = item.quantity;
          let newPrice = item.price;
          let updatedHistory = item.priceHistory || [];

          if (type === 'ENTRY_PURCHASE') {
            newQty += move.quantity;
            if (move.cost !== undefined) {
               if (move.cost !== item.price) {
                 updatedHistory = [...updatedHistory, { date: timestamp, price: move.cost }];
               }
               newPrice = move.cost;
            }
          } else {
            newQty -= move.quantity;
          }

          // Generate transaction record while looping
          newTransactions.push({
            id: crypto.randomUUID(),
            itemId: item.id,
            itemName: item.name,
            unitId: selectedUnit,
            type,
            quantity: move.quantity,
            cost: move.cost,
            reason: reason || 'Movimentação em Massa',
            date: timestamp,
            user: user?.name || 'Sistema'
          });

          return {
            ...item,
            quantity: Math.max(0, newQty),
            price: newPrice,
            priceHistory: updatedHistory,
            lastUpdated: timestamp
          };
        }
        return item;
      });
    });

    setTransactions(prev => [...newTransactions, ...prev]);
    setIsBulkMovementOpen(false);
  };

  // Finalize Stock Count
  const handleFinalizeStockCount = (counts: { itemId: string; countedQty: number }[]) => {
    const timestamp = new Date().toISOString();
    const newTransactions: StockTransaction[] = [];

    setItems(prevItems => {
      return prevItems.map(item => {
        const countEntry = counts.find(c => c.itemId === item.id);
        if (countEntry) {
          const diff = countEntry.countedQty - item.quantity;
          
          if (diff !== 0) {
            newTransactions.push({
              id: crypto.randomUUID(),
              itemId: item.id,
              itemName: item.name,
              unitId: selectedUnit,
              type: diff > 0 ? 'ENTRY_ADJUSTMENT' : 'EXIT_ADJUSTMENT',
              quantity: Math.abs(diff),
              cost: item.price,
              reason: 'Ajuste de Inventário (Contagem)',
              date: timestamp,
              user: user?.name || 'Sistema'
            });
          }

          return {
            ...item,
            quantity: countEntry.countedQty,
            lastUpdated: timestamp
          };
        }
        return item;
      });
    });

    setTransactions(prev => [...newTransactions, ...prev]);
    setIsStockCountOpen(false);
    
    // Suggest purchase report
    setTimeout(() => {
        if (confirm("Contagem finalizada com sucesso! Deseja gerar o relatório de sugestão de compras agora?")) {
            setIsPurchaseOrderOpen(true);
        }
    }, 300);
  };

  // Material Requests
  const handleCreateRequest = (itemId: string, quantity: number, sector: Sector) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newRequest: MaterialRequest = {
      id: crypto.randomUUID(),
      unitId: selectedUnit,
      itemId,
      itemName: item.name,
      quantity,
      unit: item.unit,
      sector,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };

    setRequests(prev => [newRequest, ...prev]);
    setIsRequestModalOpen(false);
  };

  // Bulk Material Request
  const handleBulkRequest = (bulkRequests: { itemId: string; quantity: number }[], sector: Sector) => {
    const timestamp = new Date().toISOString();
    const newRequestObjects: MaterialRequest[] = [];

    bulkRequests.forEach(req => {
      const item = items.find(i => i.id === req.itemId);
      if (item) {
        newRequestObjects.push({
          id: crypto.randomUUID(),
          unitId: selectedUnit,
          itemId: req.itemId,
          itemName: item.name,
          quantity: req.quantity,
          unit: item.unit,
          sector,
          status: 'PENDING',
          requestedAt: timestamp
        });
      }
    });

    setRequests(prev => [...newRequestObjects, ...prev]);
    setIsBulkRequestOpen(false);
  };

  const handleApproveRequest = (request: MaterialRequest) => {
    const item = items.find(i => i.id === request.itemId);
    if (!item) return;

    if (item.quantity < request.quantity) {
      alert(`Estoque insuficiente! Disponível: ${item.quantity} ${item.unit}`);
      return;
    }

    setItems(prev => prev.map(i => {
      if (i.id === request.itemId) {
        return { ...i, quantity: i.quantity - request.quantity, lastUpdated: new Date().toISOString() };
      }
      return i;
    }));

    const transaction: StockTransaction = {
      id: crypto.randomUUID(),
      itemId: request.itemId,
      itemName: request.itemName,
      unitId: request.unitId,
      type: 'EXIT_PRODUCTION',
      quantity: request.quantity,
      reason: `Solicitação aprovada: ${request.sector}`,
      date: new Date().toISOString(),
      user: user?.name || 'Sistema'
    };
    setTransactions(prev => [transaction, ...prev]);

    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'APPROVED' } : r));
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r));
  };

  // AI
  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const insight = await generateInventoryInsights(currentUnitItems);
      setAiInsights(insight);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans pb-20 md:pb-0">
      
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-emerald-950 text-slate-300 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-emerald-900 flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <ChefHat className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">GESTÃO DE</h1>
            <span className="text-xs text-emerald-400 font-medium tracking-widest">ESTOQUE</span>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="p-4">
          <label className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2 block">Unidade</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 text-emerald-300 w-4 h-4" />
            <select 
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value as RestaurantUnit)}
              className="w-full pl-9 pr-4 py-2 bg-emerald-900/50 border border-emerald-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer hover:bg-emerald-900"
            >
              {UNITS.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-emerald-900/50 hover:text-white'}`}>
            <LayoutDashboard size={20} /> <span className="font-medium">Visão Geral</span>
          </button>
          
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-emerald-900/50 hover:text-white'}`}>
            <Package size={20} /> <span className="font-medium">Estoque</span>
          </button>

          <button onClick={() => setActiveTab('requests')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'requests' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-emerald-900/50 hover:text-white'}`}>
            <ClipboardList size={20} /> <span className="font-medium">Solicitações</span>
            {requests.filter(r => r.unitId === selectedUnit && r.status === 'PENDING').length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {requests.filter(r => r.unitId === selectedUnit && r.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button onClick={() => setActiveTab('losses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'losses' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-emerald-900/50 hover:text-white'}`}>
            <XOctagon size={20} /> <span className="font-medium">Perdas</span>
          </button>

          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'hover:bg-emerald-900/50 hover:text-white'}`}>
            <History size={20} /> <span className="font-medium">Histórico</span>
          </button>

          {/* Operations Group */}
          <div className="pt-4 mt-4 border-t border-emerald-900">
            <p className="px-4 text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Operações</p>
            <button onClick={() => setIsStockCountOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-900/50 hover:text-white transition-all">
                <ClipboardCheck size={20} /> <span className="font-medium">Contagem</span>
            </button>
            <button onClick={() => setIsPurchaseOrderOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-900/50 hover:text-white transition-all">
                <ShoppingCart size={20} /> <span className="font-medium">Relatório Compra</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-emerald-900">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-emerald-400 hover:text-white transition-colors">
            <LogOut size={18} /> <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-emerald-950 text-white p-4 sticky top-0 z-20 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <ChefHat className="text-emerald-400 w-6 h-6" />
            <h1 className="font-bold">GESTÃO DE ESTOQUE</h1>
          </div>
          <select 
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value as RestaurantUnit)}
            className="bg-emerald-900 text-xs py-1 px-2 rounded border border-emerald-800 focus:outline-none"
          >
            {UNITS.map(u => (
              <option key={u.id} value={u.id}>{u.id}</option>
            ))}
          </select>
          <button onClick={handleLogout} className="text-emerald-400">
            <LogOut size={20} />
          </button>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Dashboard - {UNITS.find(u => u.id === selectedUnit)?.label}</h2>
                <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
                  {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Mobile Operations Actions */}
              <div className="grid grid-cols-2 gap-3 md:hidden">
                 <button onClick={() => setIsStockCountOpen(true)} className="bg-purple-50 text-purple-700 p-3 rounded-xl font-bold flex flex-col items-center gap-1 border border-purple-100">
                    <ClipboardCheck size={24} />
                    <span className="text-xs">Contagem</span>
                 </button>
                 <button onClick={() => setIsPurchaseOrderOpen(true)} className="bg-blue-50 text-blue-700 p-3 rounded-xl font-bold flex flex-col items-center gap-1 border border-blue-100">
                    <ShoppingCart size={24} />
                    <span className="text-xs">Compras</span>
                 </button>
              </div>

              {/* Replenishment Alerts */}
              {lowStockItems.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-red-600" />
                    <h3 className="text-lg font-bold text-red-800">Alertas de Reposição</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-xs text-red-600 font-medium">Estoque: {item.quantity} {item.unit} (Mín: {item.minStock})</p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedItemForMovement(item);
                            setIsMovementModalOpen(true);
                          }}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                          Repor
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total de Insumos" value={stats.totalItems} icon={Package} color="bg-blue-500" />
                <StatsCard title="Valor em Estoque" value={`R$ ${stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="bg-emerald-500" />
                <StatsCard title="Abaixo do Mínimo" value={stats.lowStockCount} icon={AlertTriangle} color="bg-orange-500" trend={stats.lowStockCount > 0 ? "Ação necessária" : "Estoque saudável"} />
                <StatsCard title="Categorias" value={stats.categoriesCount} icon={Layers} color="bg-purple-500" />
              </div>

              {/* Chart & AI */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-slate-400" />
                    Valor por Categoria
                  </h3>
                  <InventoryChart items={currentUnitItems} />
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl shadow-sm border border-emerald-100">
                  <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="text-emerald-600" />
                    <h3 className="text-lg font-bold text-emerald-900">Insights do Chef IA</h3>
                  </div>
                  <div className="prose prose-sm prose-emerald h-64 overflow-y-auto custom-scrollbar">
                    {aiInsights ? (
                      <div className="bg-white/50 p-4 rounded-lg backdrop-blur-sm">
                        <ReactMarkdown>{aiInsights}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 gap-4">
                        <Sparkles className="w-8 h-8 opacity-50" />
                        <p className="text-xs">Receba análises inteligentes sobre seu estoque, sugestões de compras e alertas de desperdício.</p>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleGenerateInsights}
                    disabled={isGeneratingInsights}
                    className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                  >
                    {isGeneratingInsights ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    Gerar Análise
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Estoque</h2>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setIsBulkMovementOpen(true)}
                    className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Layers size={18} />
                    <span className="hidden sm:inline">Em Massa</span>
                    <span className="sm:hidden">Massa</span>
                  </button>
                  <button 
                    onClick={() => {
                      setEditingItem(undefined);
                      setIsFormOpen(true);
                    }}
                    className="flex-1 md:flex-none bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Plus size={18} />
                    <span>Novo Insumo</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome, categoria..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <Filter size={16} />
                  <span>{filteredItems.length} insumos listados</span>
                </div>
              </div>

              {/* Mobile Card List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                {filteredItems.map(item => (
                  <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border ${item.quantity < item.minStock ? 'border-red-200 bg-red-50/50' : 'border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-bold ${item.quantity < item.minStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mb-4">
                      <p>Mín: {item.minStock}</p>
                      <p>Valor: R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-slate-100/50">
                       <button 
                        onClick={() => {
                          setSelectedItemForMovement(item);
                          setIsMovementModalOpen(true);
                        }}
                        className="flex-1 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                       >
                         Movimentar
                       </button>
                       <button 
                        onClick={() => {
                          setEditingItem(item);
                          setIsFormOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                       >
                         <Edit2 size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600">Insumo</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Categoria</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-center">Status</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Estoque</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Valor Total</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.quantity < item.minStock ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                              <AlertCircle size={12} /> Baixo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                              <CheckCircle2 size={12} /> OK
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">{item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span></div>
                          <div className="text-xs text-slate-400">Min: {item.minStock}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          R$ {(item.quantity * item.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setSelectedItemForMovement(item);
                                setIsMovementModalOpen(true);
                              }}
                              className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-100 font-medium transition-colors"
                            >
                              Movimentar
                            </button>
                            <button 
                              onClick={() => {
                                setEditingItem(item);
                                setIsFormOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: REQUESTS */}
          {activeTab === 'requests' && (
             <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Solicitações de Material</h2>
                <div className="flex gap-2 w-full md:w-auto">
                   <button 
                    onClick={() => setIsBulkRequestOpen(true)}
                    className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ClipboardList size={18} />
                    <span className="hidden sm:inline">Pedido Rápido</span>
                    <span className="sm:hidden">Rápido</span>
                  </button>
                  <button 
                    onClick={() => setIsRequestModalOpen(true)}
                    className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Plus size={18} />
                    <span>Nova Solicitação</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentUnitRequests.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                    Nenhuma solicitação encontrada para esta unidade.
                  </div>
                ) : (
                  currentUnitRequests.map(req => (
                    <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                          ${req.sector === 'COZINHA' ? 'bg-orange-100 text-orange-700' : 
                            req.sector === 'BAR' ? 'bg-purple-100 text-purple-700' : 
                            req.sector === 'SALAO' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
                        `}>
                          {req.sector}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(req.requestedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-slate-800">{req.itemName}</h3>
                        <p className="text-slate-500 font-medium text-sm">Quantidade: {req.quantity} {req.unit}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-50">
                        {req.status === 'PENDING' ? (
                          <div className="flex gap-2">
                             <button 
                              onClick={() => handleRejectRequest(req.id)}
                              className="flex-1 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                            >
                              Rejeitar
                            </button>
                            <button 
                              onClick={() => handleApproveRequest(req)}
                              className="flex-1 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                              Aprovar
                            </button>
                          </div>
                        ) : (
                          <div className={`w-full py-2 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2
                            ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
                          `}>
                            {req.status === 'APPROVED' ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                            {req.status === 'APPROVED' ? 'Atendido' : 'Rejeitado'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
             </div>
          )}

          {/* TAB: LOSSES */}
          {activeTab === 'losses' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-xl">
                  <XOctagon className="text-red-600 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Registro de Perdas</h2>
                  <p className="text-slate-500 text-sm">Histórico detalhado de baixas por perda/quebra.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-red-50/50 border-b border-red-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-600">Data</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Item</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Qtd Perdida</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Motivo</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Responsável</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentUnitLosses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nenhuma perda registrada para esta unidade.</td>
                        </tr>
                      ) : (
                        currentUnitLosses.map((tx) => (
                          <tr key={tx.id} className="hover:bg-red-50/20 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(tx.date).toLocaleDateString()} <span className="text-xs opacity-70">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">{tx.itemName}</td>
                            <td className="px-6 py-4 font-bold text-red-600">-{tx.quantity}</td>
                            <td className="px-6 py-4">
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                {tx.reason || 'Não informado'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400 uppercase tracking-wide">{tx.user}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-slate-800">Histórico Geral de Movimentações</h2>
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-600">Data</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Tipo</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Item</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Qtd</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Motivo/Detalhes</th>
                        <th className="px-6 py-4 font-semibold text-slate-600">Usuário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentUnitTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Nenhuma movimentação registrada.</td>
                        </tr>
                      ) : (
                        currentUnitTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(tx.date).toLocaleDateString()} <span className="text-xs opacity-70">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border
                                ${tx.type === 'ENTRY_PURCHASE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                  tx.type === 'EXIT_PRODUCTION' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                  tx.type.includes('ADJUSTMENT') ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                  'bg-red-50 text-red-700 border-red-100'}
                              `}>
                                {tx.type === 'ENTRY_PURCHASE' ? <ArrowDownLeft size={12}/> : <ArrowUpRight size={12}/>}
                                {tx.type === 'ENTRY_PURCHASE' ? 'Entrada' : 
                                 tx.type === 'EXIT_PRODUCTION' ? 'Produção' : 
                                 tx.type.includes('ADJUSTMENT') ? 'Ajuste' : 'Perda'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">{tx.itemName}</td>
                            <td className="px-6 py-4 font-bold text-slate-700">{tx.quantity}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{tx.reason || '-'}</td>
                            <td className="px-6 py-4 text-xs text-slate-400 uppercase tracking-wide">{tx.user}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-30 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'inventory' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
        >
          <Package size={20} />
          <span className="text-[10px] font-medium">Estoque</span>
        </button>
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'requests' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
        >
          <ClipboardList size={20} />
          <span className="text-[10px] font-medium">Pedidos</span>
        </button>
        <button 
          onClick={() => setActiveTab('losses')} 
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'losses' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
        >
          <XOctagon size={20} />
          <span className="text-[10px] font-medium">Perdas</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'}`}
        >
          <History size={20} />
          <span className="text-[10px] font-medium">Hist.</span>
        </button>
      </nav>

      {/* Modals */}
      {isFormOpen && (
        <InventoryForm 
          onSave={handleSaveItem} 
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(undefined);
          }} 
          initialData={editingItem} 
        />
      )}

      {isMovementModalOpen && selectedItemForMovement && (
        <StockMovementModal
          item={selectedItemForMovement}
          onConfirm={handleRegisterMovement}
          onCancel={() => {
            setIsMovementModalOpen(false);
            setSelectedItemForMovement(null);
          }}
        />
      )}

      {isRequestModalOpen && (
        <MaterialRequestModal
          items={currentUnitItems}
          onConfirm={handleCreateRequest}
          onCancel={() => setIsRequestModalOpen(false)}
        />
      )}

      {isBulkMovementOpen && (
        <BulkMovementModal
          items={currentUnitItems}
          onConfirm={handleBulkMovement}
          onCancel={() => setIsBulkMovementOpen(false)}
        />
      )}

      {isBulkRequestOpen && (
        <BulkRequestModal
          items={currentUnitItems}
          onConfirm={handleBulkRequest}
          onCancel={() => setIsBulkRequestOpen(false)}
        />
      )}

      {isStockCountOpen && (
        <StockCountModal
          items={currentUnitItems}
          onConfirm={handleFinalizeStockCount}
          onCancel={() => setIsStockCountOpen(false)}
        />
      )}

      {isPurchaseOrderOpen && (
        <PurchaseOrderModal
          items={currentUnitItems}
          onClose={() => setIsPurchaseOrderOpen(false)}
        />
      )}

    </div>
  );
}
