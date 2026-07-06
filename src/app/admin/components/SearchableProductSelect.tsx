import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price?: number;
}

interface SearchableProductSelectProps {
  productsList: Product[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
}

export default function SearchableProductSelect({
  productsList = [],
  value,
  onChange,
  placeholder = "اختر المنتج...",
  emptyLabel = "لا توجد نتائج تطابق بحثك"
}: SearchableProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products based on search term
  const filteredProducts = productsList.filter(prod =>
    prod.title?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProduct = productsList.find(prod => prod.id === value);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 focus-within:border-emerald-500/50 rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer shadow-sm hover:border-slate-350 transition-all select-none"
      >
        <span className={selectedProduct ? 'text-slate-800' : 'text-slate-400'}>
          {selectedProduct 
            ? `${selectedProduct.title}${selectedProduct.price ? ` - (${selectedProduct.price} ج.م)` : ''}`
            : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              className="bg-transparent text-xs font-bold w-full outline-none text-slate-700"
              placeholder="ابحث باسم المنتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* List Options */}
          <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="py-4 px-4 text-xs text-slate-400 text-center font-bold">
                {emptyLabel}
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const isSelected = prod.id === value;
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onChange(prod.id);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                      isSelected ? 'bg-emerald-50/50 text-emerald-700' : ''
                    }`}
                  >
                    <span>
                      {prod.title} {prod.price ? ` - (${prod.price} ج.م)` : ''}
                    </span>
                    {isSelected && <Check size={14} className="text-emerald-600 shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
