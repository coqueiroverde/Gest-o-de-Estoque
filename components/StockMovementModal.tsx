import React, { useState } from 'react';
import { InventoryItem, MovementType } from '../types';
import { ArrowDown, ArrowUp, AlertTriangle, X, Save } from 'lucide-react';

interface StockMovementModalProps {
  item: InventoryItem;
  onConfirm: (type: MovementType, quantity: number, reason: string, cost?: number) => void;
  onCancel: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({ item, onConfirm, onCancel }) => {
  const [type, setType] = useState<MovementType>('EXIT_PRODUCTION');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState(item.price.toString());
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(quantity);
    if (qtyNum <= 0) return;
    
    onConfirm(type, qtyNum, reason, type === 'ENTRY_PURCHASE' ? Number(cost) : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Movimentar Estoque</h2>
            <p className="text-xs text-slate-500">{item.name} ({item.quantity} {item.unit} atuais)</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('ENTRY_PURCHASE')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'ENTRY_PURCHASE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <ArrowUp size={20} />
              <span className="text-xs font-bold">Compra</span>
            </button>
            <button
              type="button"
              onClick={() => setType('EXIT_PRODUCTION')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'EXIT_PRODUCTION' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <ArrowDown size={20} />
              <span className="text-xs font-bold">Produção</span>
            </button>
            <button
              type="button"
              onClick={() => setType('EXIT_LOSS')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'EXIT_LOSS' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <AlertTriangle size={20} />
              <span className="text-xs font-bold">Perda</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantidade ({item.unit})
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
              placeholder="0.00"
              autoFocus
            />
          </div>

          {type === 'ENTRY_PURCHASE' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Novo Custo Unitário (R$)
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

          {type === 'EXIT_LOSS' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Motivo da Perda
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 outline-none bg-white"
              >
                <option value="">Selecione...</option>
                <option value="Vencimento">Vencimento</option>
                <option value="Avaria">Avaria/Queda</option>
                <option value="Qualidade">Problema de Qualidade</option>
                <option value="Desvio">Desvio/Furto</option>
              </select>
            </div>
          )}

          {type === 'EXIT_PRODUCTION' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Destino (Opcional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Mise en place, Evento..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2
                ${type === 'ENTRY_PURCHASE' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                ${type === 'EXIT_PRODUCTION' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                ${type === 'EXIT_LOSS' ? 'bg-red-600 hover:bg-red-700' : ''}
              `}
            >
              <Save size={18} />
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};