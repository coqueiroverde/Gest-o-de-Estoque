
import React, { useMemo, useState } from 'react';
import { InventoryItem } from '../types';
import { X, ShoppingCart, Copy, Check } from 'lucide-react';

interface PurchaseOrderModalProps {
  items: InventoryItem[];
  onClose: () => void;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ items, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Calculate recommendations: Needs = MinStock - CurrentStock
  const recommendations = useMemo(() => {
    const toBuy: { item: InventoryItem; qty: number }[] = [];
    
    items.forEach(item => {
      if (item.quantity < item.minStock) {
        toBuy.push({
          item,
          qty: Number((item.minStock - item.quantity).toFixed(2))
        });
      }
    });

    // Sort by category then name
    return toBuy.sort((a, b) => {
      if (a.item.category !== b.item.category) {
        return a.item.category.localeCompare(b.item.category);
      }
      return a.item.name.localeCompare(b.item.name);
    });
  }, [items]);

  const groupedRecommendations = useMemo(() => {
    const groups: Record<string, typeof recommendations> = {};
    recommendations.forEach(rec => {
      if (!groups[rec.item.category]) groups[rec.item.category] = [];
      groups[rec.item.category].push(rec);
    });
    return groups;
  }, [recommendations]);

  const handleCopy = () => {
    let text = `*PEDIDO DE COMPRA - ${new Date().toLocaleDateString()}*\n\n`;
    
    Object.keys(groupedRecommendations).sort().forEach(cat => {
      text += `*${cat}*\n`;
      groupedRecommendations[cat].forEach(rec => {
        text += `- ${rec.item.name}: ${rec.qty} ${rec.item.unit}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ShoppingCart className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Sugestão de Compra</h2>
              <p className="text-xs text-slate-500">Baseado no estoque atual vs. mínimo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Check className="w-16 h-16 mb-4 text-emerald-400 bg-emerald-100 rounded-full p-3" />
              <p className="text-lg font-medium text-slate-600">Tudo certo!</p>
              <p className="text-sm">Nenhum item abaixo do estoque mínimo.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedRecommendations).sort().map(category => (
                <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{category}</h3>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2 font-medium">Item</th>
                        <th className="px-4 py-2 font-medium text-center">Atual</th>
                        <th className="px-4 py-2 font-medium text-center">Mínimo</th>
                        <th className="px-4 py-2 font-medium text-right text-blue-600">Comprar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupedRecommendations[category].map((rec, idx) => (
                        <tr key={rec.item.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{rec.item.name}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{rec.item.quantity} {rec.item.unit}</td>
                          <td className="px-4 py-3 text-center text-slate-500">{rec.item.minStock} {rec.item.unit}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50/30">
                            +{rec.qty} {rec.item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm"
          >
            Fechar
          </button>
          {recommendations.length > 0 && (
            <button
              onClick={handleCopy}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 text-sm"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copiado!' : 'Copiar Pedido'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
