import React, { useState } from 'react';
import { InventoryItem, Sector } from '../types';
import { X, Send } from 'lucide-react';

interface MaterialRequestModalProps {
  items: InventoryItem[];
  onConfirm: (itemId: string, quantity: number, sector: Sector) => void;
  onCancel: () => void;
}

export const MaterialRequestModal: React.FC<MaterialRequestModalProps> = ({ items, onConfirm, onCancel }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sector, setSector] = useState<Sector>('COZINHA');

  const selectedItem = items.find(i => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !quantity) return;
    onConfirm(selectedItemId, Number(quantity), sector);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Solicitar Material</h2>
            <p className="text-xs text-slate-500">Requisição interna entre setores</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Setor Solicitante</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as Sector)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="COZINHA">Cozinha</option>
              <option value="BAR">Bar</option>
              <option value="SALAO">Salão</option>
              <option value="ADMIN">Administração</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Insumo</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              required
            >
              <option value="">Selecione um item...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.quantity} {item.unit} disp.)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantidade Necessária {selectedItem ? `(${selectedItem.unit})` : ''}
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>

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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              Enviar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};