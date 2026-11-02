import React, { useState } from 'react'
import { X, Copy, Check, MessageSquare, Receipt, User, Package } from 'lucide-react'

export default function OrderDetailsModal({ order, onClose, onUpdateStatus, onSaveShippingRef }: any) {
  const [copied, setCopied] = useState(false)
  if (!order) return null

  const subtotal = (Number(order.total) || 0) - (Number(order.shippingFee) || 0)

  const generateReceiptText = () => {
    const statusMap: Record<string, string> = {
      pending: 'قيد الانتظار',
      shipped: 'جاري الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'تم إلغاء الطلب'
    }
    const statusLabel = statusMap[order.status] || order.status || 'قيد الانتظار'
    const dateStr = new Date(order.createdAt).toLocaleString('ar-EG')
    const buildingInfo = [
      order.building ? `عمارة: ${order.building}` : '',
      order.floor ? `دور: ${order.floor}` : '',
      order.apartment ? `شقة: ${order.apartment}` : ''
    ].filter(Boolean).join('، ')

    const itemsText = (order.items || []).map((item: any, idx: number) => {
      const sizeStr = item.size ? ` (${item.size})` : ''
      const itemPrice = Number(item.price) || 0
      const itemQty = Number(item.quantity) || 1
      return `• ${item.title}${sizeStr}\n  الكمية: ${itemQty} × ${itemPrice} ج.م = ${itemQty * itemPrice} ج.م`
    }).join('\n')

    return `فاتورة طلب - The VitaHub
------------------------------------
رقم الطلب: #${order.orderNumber}
التاريخ: ${dateStr}
حالة الطلب: ${statusLabel}
${order.shippingRef ? `رقم التتبع: ${order.shippingRef}\n` : ''}
بيانات العميل:
- الاسم: ${order.customerName || '-'}
- رقم الهاتف: ${order.customerPhone || '-'}
${order.customerEmail ? `- البريد: ${order.customerEmail}\n` : ''}- المحافظة: ${order.governorate || '-'}
- المنطقة: ${order.district || '-'}
- العنوان: ${order.address || '-'}${buildingInfo ? ` (${buildingInfo})` : ''}
${order.notes ? `- ملاحظات: ${order.notes}\n` : ''}
------------------------------------
المنتجات المطلوبة:
${itemsText}

------------------------------------
المجموع الفرعي: ${subtotal} ج.م
مصاريف الشحن: ${order.shippingFee || 0} ج.م
الإجمالي النهائي المطلوب: ${order.total} ج.م
------------------------------------
شكراً لاختياركم The VitaHub`
  }

  const handleCopy = () => {
    const text = generateReceiptText()
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleWhatsApp = () => {
    const rawPhone = String(order.customerPhone || '').split('-')[0].replace(/[^0-9]/g, '')
    const cleanPhone = rawPhone.startsWith('0') ? '2' + rawPhone : rawPhone
    const text = generateReceiptText()
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:hidden" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-300 border border-slate-100/50">
        
        {/* Header with Quick Actions */}
        <div className="px-6 md:px-8 py-5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-emerald-600" />
              <h3 className="text-base font-black text-slate-800">تفاصيل وفاتورة الطلب #{order.orderNumber}</h3>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(order.createdAt).toLocaleString('ar-EG')}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                copied 
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {copied ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-slate-500" />}
              <span>{copied ? 'تم نسخ الفاتورة!' : 'نسخ الفاتورة (Receipt)'}</span>
            </button>

            {order.customerPhone && (
              <button
                type="button"
                onClick={handleWhatsApp}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <MessageSquare size={14} />
                <span>واتساب</span>
              </button>
            )}

            <button 
              type="button" 
              onClick={onClose} 
              aria-label="إغلاق النافذة المنبثقة" 
              className="p-2 bg-white text-slate-400 rounded-full hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* Status Update Control Section */}
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-150 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700">تحديث حالة الطلب وتتبع الشحن</h4>
              <span className="text-[10px] font-bold text-slate-400">الحالة: {
                order.status === 'pending' ? 'قيد الانتظار' :
                order.status === 'shipped' ? 'جاري الشحن' :
                order.status === 'delivered' ? 'تم التوصيل' :
                order.status === 'cancelled' ? 'تم إلغاء الطلب' : order.status
              }</span>
            </div>
            
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
                  className={`py-2 px-2 rounded-xl text-[9px] sm:text-[10px] font-black transition-all border-2 cursor-pointer ${
                    order.status === st.id 
                      ? 'border-emerald-600 bg-emerald-600 text-white scale-[1.02] shadow-md shadow-emerald-600/10' 
                      : 'border-slate-100 ' + st.color
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Tracking reference input */}
            <div className="pt-2 flex flex-col md:flex-row gap-2.5 items-end">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[9px] font-black text-slate-400 mr-1 block">رقم تتبع شركة الشحن (أرامكس أو غيرها)</label>
                <input
                  type="text"
                  id="modalShippingRef"
                  defaultValue={order.shippingRef || ''}
                  placeholder="مثال: ARX987654321"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:border-emerald-500 outline-none text-slate-700"
                />
              </div>
              <button
                type="button"
                onClick={() => onSaveShippingRef(order)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-emerald-500 transition-all cursor-pointer whitespace-nowrap w-full md:w-auto flex justify-center"
              >
                حفظ رقم التتبع
              </button>
            </div>
          </div>

          {/* Styled Receipt Container */}
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">فاتورة مبيعات معتمدة</span>
                <h4 className="text-sm font-black text-slate-800">The VitaHub Store Receipt</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                طلب #{order.orderNumber}
              </span>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <User size={13} className="text-emerald-600" />
                <span>بيانات العميل والتوصيل</span>
              </h5>
              <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block">الاسم:</span>
                  <span className="font-black text-slate-800">{order.customerName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block">رقم الهاتف:</span>
                  <span className="font-black text-emerald-700 dir-ltr inline-block">{order.customerPhone || '-'}</span>
                </div>
                {order.customerEmail && (
                  <div className="md:col-span-2">
                    <span className="text-slate-400 text-[10px] font-bold block">البريد الإلكتروني:</span>
                    <span className="font-bold text-slate-700">{order.customerEmail}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block">المحافظة:</span>
                  <span className="font-black text-slate-800">{order.governorate || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold block">المنطقة / الحي:</span>
                  <span className="font-black text-slate-800">{order.district || '-'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-400 text-[10px] font-bold block">العنوان بالتفصيل:</span>
                  <span className="font-bold text-slate-800 leading-relaxed block mt-0.5">
                    {order.address || '-'}
                    {(order.building || order.floor || order.apartment) ? ` (عمارة: ${order.building || '-'}، دور: ${order.floor || '-'}، شقة: ${order.apartment || '-'})` : ''}
                  </span>
                </div>
                {order.notes && (
                  <div className="md:col-span-2 bg-amber-50 border border-amber-200/60 p-3 rounded-xl text-amber-900 text-xs">
                    <span className="font-black block text-[10px] uppercase text-amber-700">ملاحظات العميل:</span>
                    <span className="font-bold">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ordered Items Bill */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Package size={13} className="text-emerald-600" />
                <span>المنتجات المطلوبة ({order.items?.length || 0})</span>
              </h5>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                {order.items?.map((item: any, idx: number) => {
                  const itemPrice = Number(item.price) || 0
                  const itemQty = Number(item.quantity) || 1
                  const itemTotal = itemPrice * itemQty
                  return (
                    <div key={item.id || idx} className="p-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="w-12 h-12 bg-white border border-slate-150 rounded-xl p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-contain" alt="" />
                        ) : (
                          <Package size={20} className="text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-xs font-black text-slate-800 truncate">{item.title}</h6>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                          {item.size && (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                              {item.size}
                            </span>
                          )}
                          <span className="text-slate-400 font-bold">
                            سعر القطعة: {itemPrice.toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 block">الكمية: ×{itemQty}</span>
                        <span className="text-xs font-black text-emerald-600 block mt-0.5">{itemTotal.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Receipt Financial Totals */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 font-bold">
                <span>المجموع الفرعي للمنتجات</span>
                <span className="font-black text-slate-800">{subtotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-bold">
                <span>مصاريف الشحن والتوصيل</span>
                <span className="font-black text-slate-800">{(Number(order.shippingFee) || 0).toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="border-t border-slate-200/80 pt-3 flex justify-between items-center">
                <span className="text-sm font-black text-slate-900">الإجمالي النهائي المطلوب</span>
                <span className="text-base font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                  {(Number(order.total) || 0).toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            </div>

            {/* Receipt Footer Note */}
            <div className="text-center text-[10px] text-slate-400 font-bold pt-1 border-t border-dashed border-slate-200">
              The VitaHub Egypt — مكملات غذائية وفيتامينات أصلية 100%
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
