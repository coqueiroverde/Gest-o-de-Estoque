import { InventoryItem, StockTransaction, MaterialRequest, User } from '../types';

// Helper to generate initial data (Moved from App.tsx)
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

// Fake delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async getItems(): Promise<InventoryItem[]> {
    await delay(500); // Simulate loading
    const saved = localStorage.getItem('cv_inventory_data');
    if (saved) return JSON.parse(saved);
    return INITIAL_ITEMS;
  },

  async saveItems(items: InventoryItem[]): Promise<void> {
    // await delay(200); 
    localStorage.setItem('cv_inventory_data', JSON.stringify(items));
  },

  async getTransactions(): Promise<StockTransaction[]> {
    await delay(300);
    const saved = localStorage.getItem('cv_transactions');
    return saved ? JSON.parse(saved) : [];
  },

  async saveTransactions(transactions: StockTransaction[]): Promise<void> {
    localStorage.setItem('cv_transactions', JSON.stringify(transactions));
  },

  async getRequests(): Promise<MaterialRequest[]> {
    await delay(300);
    const saved = localStorage.getItem('cv_requests');
    return saved ? JSON.parse(saved) : [];
  },

  async saveRequests(requests: MaterialRequest[]): Promise<void> {
    localStorage.setItem('cv_requests', JSON.stringify(requests));
  },

  async getUser(): Promise<User | null> {
    await delay(200);
    const saved = localStorage.getItem('cv_user');
    return saved ? JSON.parse(saved) : null;
  },

  async login(user: User): Promise<void> {
    localStorage.setItem('cv_user', JSON.stringify(user));
  },

  async logout(): Promise<void> {
    localStorage.removeItem('cv_user');
  }
};
