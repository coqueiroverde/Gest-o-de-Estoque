
import React, { useState, useMemo } from 'react';
import { InventoryItem, MovementType } from '../types';
import { ArrowDown, ArrowUp, AlertTriangle, X, Save, Search } from 'lucide-react';

interface BulkMovementModalProps {
  items: InventoryItem[];
  onConfirm: (movements: { itemId: string; quantity: number; cost?: number }[], type: MovementType, reason: string) => void;
  onCancel: () => void;
}

export const BulkMovementModal: React.FC<BulkMovementModalProps> = ({ items, onConfirm, onCancel }) => {
  const [type, setType] = useState<MovementType>('EXIT_PRODUCTION');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stores quantity and optional cost for each item ID
  const [changes, setChanges] = useState<Record<string, { qty: string; cost: string }>>({});

  // Group items by category
  const groupedItems = useMemo(() => {
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups: Record<string, InventoryItem[]> = {};
    
    filtered.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    // Sort items within groups alphabetically
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [items, searchTerm]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedItems).sort();
  }, [groupedItems]);

  const handleQtyChange = (id: string, val: string) => {
    setChanges(prev => ({
      ...prev,
      [id]: { ...prev[id], qty: val }
    }));
  };

  const handleCostChange = (id: string, val: string) => {
    setChanges(prev => ({
      ...prev,
      [id]: { ...prev[id], cost: val }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const movements = Object.entries(changes)
      .map(([itemId, data]) => ({
        itemId,
        quantity: Number(data.qty),
        cost: data.cost ? Number(data.cost) : undefined
      }))
      .filter(m => m.quantity > 0);

    if (movements.length === 0) return;

    onConfirm(movements, type, reason);
  };

  const activeCount = Object.values(changes).filter(c => Number(c.qty) > 0).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Movimentação em Massa</h2>
            <p className="text-xs text-slate-500 hidden md:block">Registre entrada ou saída de múltiplos itens.</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          
          {/* Controls */}
          <div className="p-4 bg-white border-b border-slate-100 space-y-3 flex-shrink-0">
            {/* Type Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('ENTRY_PURCHASE')}
                className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${type === 'ENTRY_PURCHASE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-slate-200 text-slate-500'}`}
              >
                <ArrowUp size={16} /> <span className="text-sm">Compra</span>
              </button>
              <button
                type="button"
                onClick={() => setType('EXIT_PRODUCTION')}
                className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${type === 'EXIT_PRODUCTION' ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold' : 'border-slate-200 text-slate-500'}`}
              >
                <ArrowDown size={16} /> <span className="text-sm">Produção</span>
              </button>
              <button
                type="button"
                onClick={() => setType('EXIT_LOSS')}
                className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${type === 'EXIT_LOSS' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-slate-200 text-slate-500'}`}
              >
                <AlertTriangle size={16} /> <span className="text-sm">Perda</span>
              </button>
            </div>

            {/* Reason & Search */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={type === 'EXIT_LOSS' ? "Motivo da perda (obrigatório)" : "Motivo/Destino (opcional)"}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                required={type === 'EXIT_LOSS'}
              />
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar itens..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* List - Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200">Item</th>
                  <th className="px-4 py-3 border-b border-slate-200 w-28 text-center">Qtd</th>
                  {type === 'ENTRY_PURCHASE' && (
                    <th className="px-4 py-3 border-b border-slate-200 w-28 text-center">Novo Custo</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedCategories.map(category => (
                  <React.Fragment key={category}>
                    {/* Category Header */}
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <td colSpan={type === 'ENTRY_PURCHASE' ? 3 : 2} className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        {category}
                      </td>
                    </tr>
                    {/* Items in Category */}
                    {groupedItems[category].map(item => {
                      const isActive = Number(changes[item.id]?.qty) > 0;
                      return (
                        <tr key={item.id} className={`transition-colors border-b border-slate-100 ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-500 flex gap-2">
                               <span>Atual: <b>{item.quantity} {item.unit}</b></span>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                               <input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0"
                                  className={`w-full py-1.5 px-2 text-center outline-none text-sm font-bold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}
                                  value={changes[item.id]?.qty || ''}
                                  onChange={(e) => handleQtyChange(item.id, e.target.value)}
                               />
                               <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-2 border-l border-slate-200">{item.unit}</span>
                            </div>
                          </td>
                          {type === 'ENTRY_PURCHASE' && (
                            <td className="px-2 py-3">
                              <div className="relative">
                                 <span className="absolute left-2 top-1.5 text-[10px] text-slate-400">R$</span>
                                 <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={item.price.toFixed(2)}
                                    className="w-full py-1.5 pl-6 pr-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-emerald-500"
                                    value={changes[item.id]?.cost || ''}
                                    onChange={(e) => handleCostChange(item.id, e.target.value)}
                                 />
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            {items.length === 0 && (
               <div className="p-8 text-center text-slate-400">
                  Nenhum item encontrado.
               </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-slate-500">
              <span className="font-bold text-slate-800">{activeCount}</span> itens alterados
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={activeCount === 0}
                className={`px-6 py-2 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm
                  ${activeCount === 0 ? 'bg-slate-300 cursor-not-allowed' : ''}
                  ${activeCount > 0 && type === 'ENTRY_PURCHASE' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  ${activeCount > 0 && type === 'EXIT_PRODUCTION' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                  ${activeCount > 0 && type === 'EXIT_LOSS' ? 'bg-red-600 hover:bg-red-700' : ''}
                `}
              >
                <Save size={18} />
                Confirmar Tudo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
