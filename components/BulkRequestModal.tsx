
import React, { useState, useMemo } from 'react';
import { InventoryItem, Sector } from '../types';
import { X, Send, Search } from 'lucide-react';

interface BulkRequestModalProps {
  items: InventoryItem[];
  onConfirm: (requests: { itemId: string; quantity: number }[], sector: Sector) => void;
  onCancel: () => void;
}

export const BulkRequestModal: React.FC<BulkRequestModalProps> = ({ items, onConfirm, onCancel }) => {
  const [sector, setSector] = useState<Sector>('COZINHA');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stores quantity for each item ID
  const [quantities, setQuantities] = useState<Record<string, string>>({});

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
    setQuantities(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requests = Object.entries(quantities)
      .map(([itemId, qty]) => ({
        itemId,
        quantity: Number(qty)
      }))
      .filter(r => r.quantity > 0);

    if (requests.length === 0) return;

    onConfirm(requests, sector);
  };

  const activeCount = Object.values(quantities).filter(q => Number(q) > 0).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-blue-50/50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pedido Rápido (Lista)</h2>
            <p className="text-xs text-slate-500">Solicite múltiplos itens para seu setor.</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          
          {/* Controls */}
          <div className="p-4 bg-white border-b border-slate-100 space-y-3 flex-shrink-0">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Setor Solicitante</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as Sector)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
              >
                <option value="COZINHA">Cozinha</option>
                <option value="BAR">Bar</option>
                <option value="SALAO">Salão</option>
                <option value="ADMIN">Administração</option>
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar insumos..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
             <table className="w-full text-left border-collapse">
               <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm text-xs font-semibold text-slate-500 uppercase">
                 <tr>
                   <th className="px-4 py-3 border-b border-slate-200">Item</th>
                   <th className="px-4 py-3 border-b border-slate-200 w-36 text-center">Quantidade</th>
                 </tr>
               </thead>
               <tbody className="bg-white">
                 {sortedCategories.map(category => (
                   <React.Fragment key={category}>
                     {/* Category Header */}
                     <tr className="bg-slate-50 border-y border-slate-200">
                        <td colSpan={2} className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                          {category}
                        </td>
                     </tr>
                     {/* Items */}
                     {groupedItems[category].map(item => {
                        const isActive = Number(quantities[item.id]) > 0;
                        return (
                          <tr key={item.id} className={`border-b border-slate-100 ${isActive ? 'bg-blue-50/50' : ''}`}>
                            <td className="px-4 py-3">
                               <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                               <div className="text-xs text-slate-400">Estoque: {item.quantity} {item.unit}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                 <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className={`w-full py-1.5 px-2 text-center outline-none text-sm font-bold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}
                                    value={quantities[item.id] || ''}
                                    onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                 />
                                 <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-2 border-l border-slate-200">{item.unit}</span>
                              </div>
                            </td>
                          </tr>
                        );
                     })}
                   </React.Fragment>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-slate-500">
              <span className="font-bold text-slate-800">{activeCount}</span> pedidos
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
                className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm disabled:bg-slate-300 disabled:cursor-not-allowed`}
              >
                <Send size={18} />
                Solicitar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
