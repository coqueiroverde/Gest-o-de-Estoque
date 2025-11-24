
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import { X, Save, Search, ClipboardCheck } from 'lucide-react';

interface StockCountModalProps {
  items: InventoryItem[];
  onConfirm: (counts: { itemId: string; countedQty: number }[]) => void;
  onCancel: () => void;
}

export const StockCountModal: React.FC<StockCountModalProps> = ({ items, onConfirm, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Stores counted quantity for each item ID
  const [counts, setCounts] = useState<Record<string, string>>({});

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

  const handleCountChange = (id: string, val: string) => {
    setCounts(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include items that have been explicitly counted (even if 0)
    const finalCounts = Object.entries(counts)
      .map(([itemId, qty]) => ({
        itemId,
        countedQty: qty === '' ? 0 : Number(qty)
      }));

    if (finalCounts.length === 0) {
      if (!confirm("Nenhum item foi contado. Deseja sair sem salvar?")) return;
      onCancel();
      return;
    }

    if (confirm(`Confirmar a contagem de ${finalCounts.length} itens? O estoque será atualizado para estes valores.`)) {
      onConfirm(finalCounts);
    }
  };

  const countedCount = Object.keys(counts).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex justify-between items-center bg-purple-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <ClipboardCheck className="text-purple-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Contagem de Estoque</h2>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('pt-BR')} - Atualização de Inventário Físico</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          
          {/* Search */}
          <div className="p-4 bg-white border-b border-slate-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar itens para contagem..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* List - Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200">Item / Sistema</th>
                  <th className="px-4 py-3 border-b border-slate-200 w-32 text-center">Contagem</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedCategories.map(category => (
                  <React.Fragment key={category}>
                    {/* Category Header */}
                    <tr className="bg-purple-50/50 border-y border-slate-200">
                      <td colSpan={2} className="px-4 py-2 text-xs font-bold text-purple-800 uppercase tracking-wider">
                        {category}
                      </td>
                    </tr>
                    {/* Items in Category */}
                    {groupedItems[category].map(item => {
                      const hasCount = counts[item.id] !== undefined;
                      const countVal = Number(counts[item.id] || 0);
                      const diff = hasCount ? countVal - item.quantity : 0;
                      
                      return (
                        <tr key={item.id} className={`border-b border-slate-100 ${hasCount ? 'bg-purple-50/20' : 'hover:bg-slate-50'}`}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-400 flex gap-2 items-center mt-1">
                               <span className="bg-slate-100 px-1.5 py-0.5 rounded">Sistema: <b>{item.quantity}</b> {item.unit}</span>
                               {hasCount && diff !== 0 && (
                                 <span className={`px-1.5 py-0.5 rounded font-bold ${diff > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                   {diff > 0 ? '+' : ''}{diff}
                                 </span>
                               )}
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 shadow-sm">
                               <input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder={item.quantity.toString()}
                                  className={`w-full py-2 px-2 text-center outline-none text-base font-bold ${hasCount ? 'text-purple-700' : 'text-slate-400'}`}
                                  value={counts[item.id] !== undefined ? counts[item.id] : ''}
                                  onChange={(e) => handleCountChange(item.id, e.target.value)}
                               />
                               <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-3 border-l border-slate-200 font-medium">{item.unit}</span>
                            </div>
                          </td>
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
              <span className="font-bold text-purple-700">{countedCount}</span> itens contados
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
                disabled={countedCount === 0}
                className={`px-6 py-2 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm
                  ${countedCount === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}
                `}
              >
                <Save size={18} />
                Finalizar Contagem
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
