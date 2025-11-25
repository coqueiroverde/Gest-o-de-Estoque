
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import { suggestItemDetails } from '../services/geminiService';
import { Sparkles, Loader2, Save, X, Utensils, TrendingUp, Clock, History } from 'lucide-react';

interface InventoryFormProps {
  onSave: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'unitId' | 'priceHistory'>) => void;
  onCancel: () => void;
  initialData?: InventoryItem;
}

const UNITS = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'cx', label: 'Caixa (cx)' },
  { value: 'pct', label: 'Pacote (pct)' },
];

export const InventoryForm: React.FC<InventoryFormProps> = ({ onSave, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '0');
  const [unit, setUnit] = useState(initialData?.unit || 'un');
  const [price, setPrice] = useState(initialData?.price?.toString() || '0');
  const [minStock, setMinStock] = useState(initialData?.minStock?.toString() || '5');
  const [description, setDescription] = useState(initialData?.description || '');
  
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Calculate average price based on history
  const averagePrice = useMemo(() => {
    if (!initialData?.priceHistory || initialData.priceHistory.length === 0) return null;
    
    // Sort descending by date just in case, though typically added in order
    const sortedHistory = [...initialData.priceHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Take last 4 entries
    const lastEntries = sortedHistory.slice(0, 4);
    
    if (lastEntries.length === 0) return null;
    
    const sum = lastEntries.reduce((acc, entry) => acc + entry.price, 0);
    return sum / lastEntries.length;
  }, [initialData]);

  const handleAiSuggest = async () => {
    if (!name.trim()) return;
    setIsAiLoading(true);
    try {
      const suggestion = await suggestItemDetails(name);
      if (suggestion) {
        setCategory(suggestion.category);
        setDescription(suggestion.description);
        setPrice(suggestion.suggestedPrice.toString());
        setMinStock(suggestion.minStockRecommendation.toString());
        if (suggestion.unitSuggestion) {
          setUnit(suggestion.unitSuggestion);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      category,
      quantity: Number(quantity),
      unit,
      price: Number(price),
      description,
      minStock: Number(minStock),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-orange-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Utensils className="text-orange-500 w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-800">
              {initialData ? 'Editar Insumo' : 'Novo Insumo'}
            </h2>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name & AI Button */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Insumo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Arroz Arbóreo, Filé Mignon..."
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiLoading || !name.trim()}
                  className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium border border-orange-100"
                  title="Preencher com IA"
                >
                  {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span className="hidden sm:inline">IA Auto</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">A IA sugere categoria, preço e unidade para insumos de restaurante.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Mercearia"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Unidade</label>
                <select 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  {UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.value}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Qtd</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="col-span-1">
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">Custo (R$)</label>
                  {averagePrice !== null && (
                    <span title="Média das últimas 4 entradas" className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      Avg: {averagePrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes (marca, fornecedor, validade...)"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
              />
            </div>

            {/* Price History Section */}
            {initialData?.priceHistory && initialData.priceHistory.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <History size={16} /> Histórico de Preços
                </h3>
                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden max-h-32 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">Data</th>
                        <th className="px-3 py-2 font-medium text-right">Preço Unit.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[...initialData.priceHistory]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((entry, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-slate-600">
                            {new Date(entry.date).toLocaleDateString()} 
                            <span className="text-slate-400 ml-1">
                              {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-800 font-medium text-right">
                            R$ {entry.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 font-medium"
              >
                <Save size={18} />
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
