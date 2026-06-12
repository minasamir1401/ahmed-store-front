import React from 'react'
import { X } from 'lucide-react'

export default function OrderWaybillModal({ order, onClose }: any) {
  if (!order) return null

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:hidden" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-300 border border-slate-100/50">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="text-base font-black text-slate-800">بوليصة شحن الطلب #{order.orderNumber}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{new Date(order.createdAt).toLocaleString('ar-EG')}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white text-slate-400 rounded-full hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-4 print:p-0" dir="rtl">
          <div className="flex items-center justify-between border-b border-slate-300 pb-3">
            <div>
              <div className="text-lg font-black text-emerald-600">Vitamins HUB</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-0.5">مكملات غذائية وفيتامينات أصلية</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-slate-800">بوليصة شحن وتوصيل</div>
              <div className="text-[10px] text-slate-500 font-bold mt-0.5">رقم الطلب: #{order.orderNumber}</div>
              {order.shippingRef && <div className="text-[10px] text-emerald-600 font-black mt-0.5">رقم التتبع: {order.shippingRef}</div>}
              <div className="text-[8px] text-slate-400 font-bold mt-0.5">{new Date(order.createdAt).toLocaleString('ar-EG')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded-xl overflow-hidden text-[11px] leading-normal">
            <div className="p-3 bg-slate-50/50 space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">المرسل (الشاحن):</span>
              <div className="font-black text-slate-800">Vitamins HUB</div>
              <div className="text-[9px] text-slate-500 font-medium">القاهرة، جمهورية مصر العربية</div>
              <div className="text-[9px] text-slate-500 font-medium">هاتف: 01270029230</div>
            </div>
            <div className="p-3 space-y-1 border-r border-slate-200">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">المرسل إليه (العميل):</span>
              <div className="font-black text-slate-850">{order.customerName}</div>
              <div className="font-black text-emerald-600">هاتف: {order.customerPhone}</div>
              <div className="text-[9px] text-slate-500 font-medium">
                {order.governorate} - {order.district}
                {order.address && <span className="block mt-0.5 text-slate-700">{order.address}</span>}
                {(order.building || order.floor || order.apartment) && (
                  <span className="block mt-0.5 text-[8px] text-slate-450">
                    عمارة: {order.building} • دور: {order.floor} • شقة: {order.apartment}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-[8px] font-black text-slate-400 block mb-0.5">طريقة الدفع</span>
              <span className="font-black text-slate-750">{order.paymentMethod === 'cod' ? 'الدفع عند الاستلام (COD)' : 'دفع إلكتروني مسبق / محفظة'}</span>
            </div>
            <div className="text-left">
              <span className="text-[8px] font-black text-slate-400 block mb-0.5">المطلوب تحصيله</span>
              <span className="text-xs font-black text-emerald-600">{order.total} ج.م</span>
            </div>
          </div>

          {order.notes && (
            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-2.5 text-[9px] text-amber-800 leading-normal">
              <span className="font-black block">ملاحظات التوصيل:</span>
              <p className="font-medium italic">{order.notes}</p>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-right border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[8px] font-black text-slate-450">
                  <th className="px-3 py-1.5">محتويات الشحنة</th>
                  <th className="px-3 py-1.5 text-center w-12">الكمية</th>
                  <th className="px-3 py-1.5 text-left w-20">السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item: any) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="px-3 py-1.5 font-bold truncate max-w-[200px]" title={item.title}>{item.title}</td>
                    <td className="px-3 py-1.5 text-center font-bold">x{item.quantity}</td>
                    <td className="px-3 py-1.5 text-left font-black">{item.price} ج.م</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/30 border-t border-slate-200 font-bold text-slate-500">
                  <td className="px-3 py-1 text-left text-[9px]" colSpan={2}>رسوم التوصيل</td>
                  <td className="px-3 py-1 text-left text-slate-700 text-[9px]">{order.shippingFee} ج.م</td>
                </tr>
                <tr className="bg-slate-50 font-black text-slate-850 border-t border-slate-200">
                  <td className="px-3 py-1.5 text-left text-[9px]" colSpan={2}>الإجمالي النهائي</td>
                  <td className="px-3 py-1.5 text-left text-emerald-600 text-[10px]">{order.total} ج.م</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
