import React from 'react'
import { X } from 'lucide-react'

export default function OrderDetailsModal({ order, onClose, onUpdateStatus, onSaveShippingRef, showConfirm, showAlert, getAuthHeaders, BACKEND_API, fetchData }: any) {
  if (!order) return null

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:hidden" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 border border-slate-100/50">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-base font-black text-slate-800">تفاصيل الطلب #{order.orderNumber}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{new Date(order.createdAt).toLocaleString('ar-EG')}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white text-slate-400 rounded-full hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          <div className="bg-emerald-600/5 rounded-3xl p-6 border border-emerald-600/10 space-y-4">
            <h4 className="text-xs font-black text-emerald-600">تحديث حالة الطلب الحالية</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'pending', label: 'قيد الانتظار', color: 'bg-amber-50 text-amber-600 border-amber-500/10 hover:bg-amber-100' },
                { id: 'shipped', label: 'جاري الشحن', color: 'bg-blue-50 text-blue-600 border-blue-500/10 hover:bg-blue-100' },
                { id: 'delivered', label: 'تم التوصيل', color: 'bg-emerald-50 text-emerald-600 border-emerald-500/10 hover:bg-emerald-100' },
                { id: 'cancelled', label: 'تم إلغاء الطلب', color: 'bg-red-50 text-red-600 border-red-500/10 hover:bg-red-100' }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onUpdateStatus(st)}
                  className={`py-2.5 px-2 rounded-xl text-[9px] sm:text-[10px] font-black transition-all border-2 cursor-pointer ${
                    order.status === st.id ? 'border-emerald-600 bg-emerald-600 text-white scale-[1.03] shadow-md shadow-emerald-600/10' : 'border-slate-100 ' + st.color
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[9px] font-black text-slate-400 mr-1 block">رقم تتبع شركة الشحن (أرامكس أو غيرها)</label>
                <input
                  type="text"
                  id="modalShippingRef"
                  defaultValue={order.shippingRef || ''}
                  placeholder="مثال: ARX987654321"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold focus:border-emerald-500 outline-none text-slate-700"
                />
              </div>
              <button
                type="button"
                onClick={() => onSaveShippingRef(order)}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:bg-emerald-500 transition-all cursor-pointer whitespace-nowrap w-full md:w-auto flex justify-center"
              >
                حفظ رقم التتبع
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-800 border-b pb-2">بيانات العميل وعنوان التوصيل</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="space-y-1"><span className="text-slate-400 font-bold">الاسم بالكامل:</span> <span className="font-black text-slate-850 mr-2">{order.customerName}</span></div>
              <div className="space-y-1"><span className="text-slate-400 font-bold">رقم الهاتف:</span> <span className="font-black text-emerald-600 mr-2">{order.customerPhone}</span></div>
              {order.customerEmail && <div className="space-y-1"><span className="text-slate-400 font-bold">البريد الإلكتروني:</span> <span className="font-bold text-slate-800 mr-2">{order.customerEmail}</span></div>}
              <div className="space-y-1"><span className="text-slate-400 font-bold">المحافظة:</span> <span className="font-black text-slate-800 mr-2">{order.governorate}</span></div>
              <div className="space-y-1"><span className="text-slate-400 font-bold">المنطقة / الحي:</span> <span className="font-black text-slate-800 mr-2">{order.district}</span></div>
              <div className="space-y-1 md:col-span-2"><span className="text-slate-400 font-bold">العنوان التفصيلي:</span> <span className="font-black text-slate-800 mr-2">{order.address} (عمارة: {order.building}، دور: {order.floor}، شقة: {order.apartment})</span></div>
              {order.notes && <div className="space-y-1.5 md:col-span-2 bg-amber-50 border border-amber-100 p-3 rounded-2xl text-amber-800 italic"><span className="font-black">ملاحظات العميل:</span> {order.notes}</div>}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-800 border-b pb-2">المنتجات المطلوبة</h4>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all">
                  <div className="w-14 h-14 bg-white border rounded-xl p-1 shrink-0 overflow-hidden">
                    <img src={item.image} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <h5 className="text-xs font-black text-slate-800 truncate">{item.title}</h5>
                    {item.size && <span className="text-[9px] text-slate-400 font-bold block mt-0.5">الحجم: {item.size}</span>}
                    <div className="flex justify-between items-center mt-1 text-[10px]">
                      <span className="text-slate-400 font-bold">الكمية: x{item.quantity}</span>
                      <span className="font-black text-emerald-600">{item.price} ج.م</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border space-y-3 text-xs font-bold text-slate-650">
            <div className="flex justify-between"><span>المجموع الفرعي للمنتجات</span><span className="font-black text-slate-800">{order.total - order.shippingFee} ج.م</span></div>
            <div className="flex justify-between"><span>رسوم الشحن والتوصيل</span><span className="font-black text-slate-800">{order.shippingFee} ج.م</span></div>
            <div className="flex justify-between text-sm font-black text-slate-800 border-t pt-3"><span>الإجمالي النهائي</span><span className="text-emerald-600 text-base">{order.total} ج.م</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
