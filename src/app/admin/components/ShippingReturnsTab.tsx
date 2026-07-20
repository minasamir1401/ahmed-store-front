import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Trash2, Truck, ShieldCheck, Plus } from 'lucide-react';
import { governorates, districtsByGovernorate } from '@/lib/locations';

const ShippingRatesEditor = ({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [selectedGov, setSelectedGov] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    try { setRates(JSON.parse(value || '{}')) } catch { setRates({}) }
  }, [value]);

  const updateRates = (nextRates: Record<string, number>) => {
    onChange(JSON.stringify(nextRates));
  };

  const handleAdd = () => {
    const loc = selectedDistrict || selectedGov;
    if (loc && newPrice) {
      const nextRates = { ...rates, [loc]: Number(newPrice) };
      updateRates(nextRates);
      setSelectedGov('');
      setSelectedDistrict('');
      setNewPrice('');
    }
  };

  const handleRemove = (loc: string) => {
    const nextRates = { ...rates };
    delete nextRates[loc];
    updateRates(nextRates);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(rates).map(([loc, price]) => (
          <div key={loc} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-2xl shadow-sm">
             <span className="font-bold text-xs text-slate-700">{loc}</span>
             <div className="flex gap-4 items-center">
               <span className="text-blue-600 font-black text-xs">{price} ج.م</span>
               <button type="button" disabled={disabled} onClick={() => handleRemove(loc)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
             </div>
          </div>
        ))}
        {Object.keys(rates).length === 0 && (
          <div className="col-span-full text-center text-xs text-slate-400 font-bold py-4">
            لا توجد أسعار شحن مضافة حتى الآن. (سيتم حساب الشحن كـ 0 ج.م)
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">المحافظة</label>
          <select 
            disabled={disabled}
            value={selectedGov}
            onChange={(e) => {
              setSelectedGov(e.target.value);
              setSelectedDistrict('');
            }}
            className="w-full bg-white rounded-xl py-2.5 px-3 font-bold outline-none border border-slate-200 focus:border-blue-500/50 text-xs text-slate-700"
          >
            <option value="">اختر المحافظة...</option>
            {governorates.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">المركز / المنطقة (اختياري)</label>
          <select 
            disabled={disabled || !selectedGov}
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-white rounded-xl py-2.5 px-3 font-bold outline-none border border-slate-200 focus:border-blue-500/50 text-xs text-slate-700 disabled:opacity-50"
          >
            <option value="">اختر المركز...</option>
            {selectedGov && districtsByGovernorate[selectedGov]?.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="w-full md:w-24 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">السعر</label>
          <input 
            type="number" 
            disabled={disabled} 
            value={newPrice} 
            onChange={e=>setNewPrice(e.target.value)} 
            placeholder="مثال: 50" 
            className="w-full bg-white rounded-xl py-2.5 px-3 font-bold outline-none border border-slate-200 focus:border-blue-500/50 text-xs text-slate-700" 
          />
        </div>

        <div className="flex items-end">
          <button 
            type="button" 
            disabled={disabled || !selectedGov || !newPrice} 
            onClick={handleAdd} 
            className="h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl px-6 font-black text-xs flex items-center justify-center gap-2 transition-all w-full md:w-auto"
          >
            <Plus size={16} /> إضافة
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ShippingReturnsTab(props: any) {
  const { 
    settingsSaveLoading,
    handleSaveGeneralSettings,
    shippingRates,
    setShippingRates,
    returnPolicy,
    setReturnPolicy
  } = props;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <form onSubmit={handleSaveGeneralSettings} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-10 space-y-8 shadow-sm max-w-4xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
        
        <div className="text-center space-y-2 mb-8">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
            <Truck size={22} />
          </div>
          <h3 className="text-xl font-black text-slate-800">إعدادات الشحن والإرجاع</h3>
          <p className="text-xs text-slate-400 font-bold">إدارة أسعار شحن المحافظات وسياسة الاستبدال</p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Truck size={16} className="text-blue-500" /> 
                أسعار الشحن للمحافظات والمراكز
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                الأسعار المضافة هنا ستظهر للعميل في صفحة الدفع مباشرة.
              </p>
            </div>
            
            <ShippingRatesEditor 
              value={shippingRates} 
              onChange={setShippingRates} 
              disabled={settingsSaveLoading} 
            />
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-50">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" /> 
                سياسة الاستبدال والاسترجاع
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                تظهر للعملاء في صفحة الدفع وفي صفحة الإرجاع العامة.
              </p>
            </div>
            
            <textarea 
              value={returnPolicy} 
              onChange={e => setReturnPolicy(e.target.value)} 
              className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold outline-none border border-slate-200 focus:border-blue-500/30 focus:bg-white transition-all text-sm text-slate-700" 
              rows={6}
              placeholder="مثال: يحق للعميل استرجاع المنتج خلال 14 يوماً من تاريخ الاستلام بشرط عدم فتح العبوة..." 
              disabled={settingsSaveLoading}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 mt-8">
          <button type="submit" disabled={settingsSaveLoading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 px-10 rounded-2xl font-black text-sm shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            {settingsSaveLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} حفظ الإعدادات
          </button>
        </div>
      </form>
    </div>
  );
}
