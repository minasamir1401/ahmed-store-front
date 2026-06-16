"use client"

import React from 'react'
import {
  LayoutDashboard, Package, Tag, Award, FileText, Plus, Edit2, Trash2, Eye,
  Loader2, Lock, User, LogIn, X, Image as ImageIcon, Upload, CheckCircle2, AlertCircle, Layers, Building2, Search, RotateCcw, Sparkles, Menu, ShoppingCart, Printer, Truck, Calendar, Clock, Smartphone, Stethoscope
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminDashboard } from './hooks/useAdminDashboard'
import AdminLoginForm from './components/AdminLoginForm'
import HeroTab from './components/HeroTab'
import AdminSettingsTab from './components/AdminSettingsTab'
import WhatsappTab from './components/WhatsappTab'
import ProductsForm from './components/ProductsForm'
import OffersForm from './components/OffersForm'
import MedicalTipsForm from './components/MedicalTipsForm'

export default function AdminDashboard() {
  const {
    showAlert,
    showConfirm,
    BACKEND_API,
    isLoggedIn,
    setIsLoggedIn,
    username,
    setUsername,
    password,
    setPassword,
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    data,
    categories,
    brands,
    productsList,
    loading,
    isAILoading,
    isSEOLoading,
    isTranslatingLoading,
    uploading,
    setUploading,
    brandUploading,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    setFormData,
    supplementFactsList,
    setSupplementFactsList,
    sizesPricesList,
    setSizesPricesList,
    faqsList,
    setFaqsList,
    productSpecsObj,
    setProductSpecsObj,
    keyInfoObj,
    setKeyInfoObj,
    certificationsObj,
    setCertificationsObj,
    dosageCalculatorObj,
    setDosageCalculatorObj,
    stats,
    brandSearch,
    setBrandSearch,
    showBrandSuggestions,
    setShowBrandSuggestions,
    searchQuery,
    setSearchQuery,
    adminToken,
    whatsappStatus,
    wsLoading,
    adminEmail,
    setAdminEmail,
    adminName,
    setAdminName,
    adminPassword,
    setAdminPassword,
    logs,
    selectedOrderForWaybill,
    setSelectedOrderForWaybill,
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    mainFileInputRef,
    galleryFileInputRef,
    brandLogoRef,
    addLog,
    fetchWithAdminAuth,
    fetchWhatsappStatus,
    fetchStats,
    fetchData,
    fetchMeta,
    handleLogin,
    handleLogout,
    handleDelete,
    handleShipToAramex,
    handleWhatsappLogout,
    handleFileUpload,
    uploadAdminImage,
    handleOpenModal,
    handleAIFill,
    handleAutoTranslate,
    handleSEOAI,
    handleTipAI,
    handleSaveAdminSettings,
    handleSave,
    filteredBrands,
    backupLoading,
    restoreLoading,
    handleDownloadBackup,
    handleRestoreBackup,
    cleanLoading,
    handleCleanBase64Images,
    tabs
  } = useAdminDashboard()

  const items = data
  const propsObj = {
    formData,
    setFormData,
    handleSave,
    loading,
    uploading,
    setUploading,
    handleFileUpload,
    uploadAdminImage,
    categories,
    brandSearch,
    setBrandSearch,
    showBrandSuggestions,
    setShowBrandSuggestions,
    filteredBrands,
    brandUploading,
    isAILoading,
    isTranslatingLoading,
    handleAIFill,
    handleAutoTranslate,
    sizesPricesList,
    setSizesPricesList,
    supplementFactsList,
    setSupplementFactsList,
    faqsList,
    setFaqsList,
    keyInfoObj,
    setKeyInfoObj,
    productSpecsObj,
    setProductSpecsObj,
    certificationsObj,
    setCertificationsObj,
    dosageCalculatorObj,
    setDosageCalculatorObj,
    addLog,
    fetchWithAdminAuth,
    handleTipAI,
    BACKEND_API,
    adminEmail,
    setAdminEmail,
    adminName,
    setAdminName,
    adminPassword,
    setAdminPassword,
    adminSaveLoading: loading,
    handleAdminSave: handleSaveAdminSettings,
    isLoggedIn,
    setIsLoggedIn,
    showLogin: false,
    activeTab,
    tabs,
    items,
    productsList,
    handleSEOAI,
    isSEOLoading,
    handleLogout,
    handleDelete,
    handleShipToAramex,
    handleOpenModal,
    mainFileInputRef,
    galleryFileInputRef,
    brandLogoRef,
    logs,
    stats,
    data,
    selectedOrderForWaybill,
    setSelectedOrderForWaybill,
    selectedOrderForDetails,
    setSelectedOrderForDetails,
    whatsappStatus,
    handleWhatsappLogout,
    wsLoading,
    searchQuery,
    setSearchQuery,
    isSidebarOpen,
    setIsSidebarOpen,
    adminToken,
    fetchWhatsappStatus,
    fetchStats,
    fetchData,
    fetchMeta,
    backupLoading,
    restoreLoading,
    handleDownloadBackup,
    handleRestoreBackup,
    cleanLoading,
    handleCleanBase64Images
  }

  const getTabIcon = (iconKey?: string) => {
    switch (iconKey) {
      case 'Package':
        return <Package size={18} />
      case 'ShoppingCart':
        return <ShoppingCart size={18} />
      case 'Building2':
        return <Building2 size={18} />
      case 'Award':
        return <Award size={18} />
      case 'Tag':
        return <Tag size={18} />
      case 'Layers':
        return <Layers size={18} />
      case 'Stethoscope':
        return <Stethoscope size={18} />
      case 'Smartphone':
        return <Smartphone size={18} />
      case 'User':
        return <User size={18} />
      default:
        return <Package size={18} />
    }
  }

  if (!isLoggedIn) {
    return <AdminLoginForm username={username} setUsername={setUsername} password={password} setPassword={setPassword} handleLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* Premium Sticky Topbar */}
      <div className="bg-[#0f172a] text-white px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Menu size={20} />
          </button>
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md">
            <LayoutDashboard size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-white leading-none">لوحة التحكم</h1>
            <span className="text-[9px] text-emerald-400 font-bold block mt-1">The VitaHub • Premium Healthcare Control</span>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs font-black text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer">خروج</button>
      </div>

      <div className="flex-1 flex overflow-hidden relative print:hidden">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden animate-in fade-in" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar Nav */}
        <aside className={`
          fixed inset-y-0 right-0 z-40 w-64 bg-[#0f172a] border-l border-slate-800/50 p-6 flex flex-col shrink-0 transition-transform duration-300 transform shadow-2xl md:shadow-none print:hidden
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          ${isModalOpen ? 'hidden' : ''}
          md:relative md:translate-x-0 md:flex
        `}>
          <div className="flex-1 space-y-2 mt-4">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsModalOpen(false)
                  setIsSidebarOpen(false)
                }} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {getTabIcon((tab as any).iconKey)} {tab.label}
              </button>
            ))}
          </div>
          
          {/* Logs Area */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-[9px] font-black text-slate-500 uppercase mb-3 mr-2 tracking-widest">حالة الخادم الفورية</h4>
            <div className="bg-slate-900 rounded-2xl p-4 space-y-2 border border-slate-800/30">
              {logs.length === 0 ? (
                <div className="text-[8px] text-slate-500 italic">لا توجد سجلات حالياً</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-[8px] font-bold text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate block">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Body Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 print:hidden">
          
          {/* KPI Dashboard Cards Grid */}
          {!isModalOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <ShoppingCart className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">إجمالي الإيرادات</span>
                  <span className="text-xs sm:text-sm md:text-lg font-black text-slate-800 truncate block mt-0.5">{stats.totalSales.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Clock className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">طلبات نشطة</span>
                  <span className="text-xs sm:text-sm md:text-lg font-black text-slate-800 truncate block mt-0.5">{stats.pendingOrders} طلبات قيد التجهيز</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Package className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">إجمالي المنتجات</span>
                  <span className="text-xs sm:text-sm md:text-lg font-black text-slate-800 truncate block mt-0.5">{stats.totalProducts} منتجاً نشطاً</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <Award className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 block uppercase">الأقسام والشركات</span>
                  <span className="text-xs sm:text-sm md:text-lg font-black text-slate-800 truncate block mt-0.5">{stats.totalCategories} قسماً / {stats.totalBrands} شركة</span>
                </div>
              </div>
            </div>
          )}

          {!isModalOpen ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header actions bar */}
              <div className="p-4 md:p-6 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between bg-slate-50/50 gap-4">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  {activeTab !== 'hero' && activeTab !== 'whatsapp' && activeTab !== 'admin-settings' && (
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-100 flex items-center gap-2 shadow-sm w-full lg:min-w-[320px]">
                      <Search size={16} className="text-slate-400" />
                      <input type="text" placeholder="ابحث في هذه القائمة..." className="bg-transparent text-xs font-bold w-full outline-none text-slate-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 w-full lg:w-auto justify-end">
                  <button onClick={fetchData} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all bg-white border border-slate-100 shadow-sm cursor-pointer" title="تحديث البيانات">
                    <RotateCcw size={16} className={loading ? 'animate-spin' : ''} />
                  </button>
                  {activeTab !== 'hero' && activeTab !== 'orders' && activeTab !== 'whatsapp' && activeTab !== 'admin-settings' && (
                    <button onClick={() => handleOpenModal()} className="bg-emerald-600 text-white flex-1 lg:flex-none px-8 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer">
                      <Plus size={16} /> إضافة عنصر جديد
                    </button>
                  )}
                </div>
              </div>
              
              {/* Active Tab Main Tables List */}
              {activeTab === 'hero' ? ( <HeroTab {...propsObj} /> ) : activeTab === 'admin-settings' ? ( <AdminSettingsTab {...propsObj} /> ) : activeTab === 'whatsapp' ? ( <WhatsappTab {...propsObj} /> ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse min-w-[700px]">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase border-b border-slate-100 tracking-wider">
                      <tr className="text-right">
                        <th className="px-6 md:px-8 py-5">{activeTab === 'orders' ? 'رقم الطلب والعميل' : 'العنصر'}</th>
                        <th className="px-6 md:px-8 py-5">{activeTab === 'orders' ? 'حالة الطلب / الإجمالي' : 'التفاصيل / السعر'}</th>
                        <th className="px-6 md:px-8 py-5 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {loading && data.length === 0 ? (
                        <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" size={32} /></td></tr>
                      ) : (Array.isArray(data) ? data : []).filter(i => (i.title || i.name || i.orderNumber || i.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                        <tr><td colSpan={3} className="py-20 text-center text-slate-400 font-bold text-xs">لا توجد بيانات تطابق بحثك حالياً</td></tr>
                      ) : (
                        (Array.isArray(data) ? data : []).filter(i => (i.title || i.name || i.orderNumber || i.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group">
                            <td className="px-6 md:px-8 py-5">
                              <div className="flex items-center gap-4">
                                {activeTab !== 'orders' && (
                                  <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                                    <img src={item.image || 'https://placehold.co/400x400?text=Vitamins+HUB'} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" alt="item" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs md:text-sm font-black text-slate-800 truncate max-w-[200px] md:max-w-none">
                                    {activeTab === 'orders' ? `#${item.orderNumber}` : (item.title || item.name || 'بدون اسم')}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-bold mt-1.5 flex flex-wrap items-center gap-2">
                                    {activeTab === 'orders' ? (
                                      <>
                                        <span className="text-slate-700 font-black">{item.customerName}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.customerPhone}</span>
                                        <span className="text-emerald-600 font-black">{item.governorate}</span>
                                      </>
                                    ) : activeTab === 'offers' ? ( <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-600 font-bold border border-emerald-100 text-[10px]">عرض ترويجي</span> ) : activeTab === 'medical-tips' ? (
                                      <>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">ID: {item.id.substring(0, 8)}</span>
                                        {item.categoryId && <span className="text-emerald-600 font-black">#{categories.find(c => c.id === item.categoryId)?.name || 'غير مصنف'}</span>}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 md:px-8 py-5">
                              <div className="flex flex-col gap-1">
                                <div className="text-[11px] md:text-xs font-black text-slate-700 bg-slate-50 w-fit px-3 py-1 rounded-lg border border-slate-100">
                                  {activeTab === 'offers' ? (item.discount || 'بدون علامة خصم') : activeTab === 'medical-tips' ? (item.content ? item.content.substring(0, 50) + '...' : '') : item.price ? `${item.price} ج.م` : (item.total ? `${item.total} ج.م` : '---')}
                                </div>
                                {activeTab === 'orders' && (
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md w-fit border ${
                                    item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-500/20' :
                                    item.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-500/20' :
                                    item.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-500/20' :
                                    'bg-emerald-50 text-emerald-600 border-emerald-500/20'
                                  }`}>
                                    {item.status === 'pending' ? 'قيد الانتظار وتجهيز الطلب' : 
                                     item.status === 'shipped' ? 'جاري الشحن / في الطريق' : 
                                     item.status === 'cancelled' ? 'تم إلغاء الطلب' :
                                     'تم التوصيل بنجاح'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 md:px-8 py-5">
                              <div className="flex gap-2 justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                {activeTab === 'orders' ? (
                                  <>
                                    <button onClick={() => setSelectedOrderForDetails(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="عرض تفاصيل الطلب"><Eye size={16} /></button>
                                    <button onClick={() => setSelectedOrderForWaybill(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" title="طباعة بوليصة الشحن"><Printer size={16} /></button>
                                    {item.status === 'pending' && (
                                      <button onClick={() => handleShipToAramex(item.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="إرسال لشركة أرامكس"><Truck size={16} /></button>
                                    )}
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="حذف"><Trash2 size={16} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" title="تعديل"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer" title="حذف"><Trash2 size={16} /></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            // Full Screen Form Overhaul
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Form Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors cursor-pointer">
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800 leading-none">إدارة {tabs.find(t => t.id === activeTab)?.label}</h3>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold block mt-1">{editingItem ? `تعديل العنصر #${editingItem.id.substring(0, 8)}` : 'إضافة عنصر جديد بالكامل'}</span>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-3 sm:px-6 py-2 sm:py-3 rounded-2xl font-black text-[10px] sm:text-xs text-slate-500 hover:bg-slate-100 transition-all cursor-pointer">إلغاء</button>
                  <button onClick={handleSave} className="bg-emerald-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-2xl font-black text-[10px] sm:text-xs shadow-lg shadow-emerald-600/10 hover:scale-[1.02] transition-all cursor-pointer">
                    {loading ? <Loader2 className="animate-spin" size={14} /> : 'حفظ العنصر'}
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
                <form onSubmit={handleSave} className="space-y-10 pb-20">
                  {activeTab === 'products' ? ( <ProductsForm {...propsObj} /> ) : activeTab === 'offers' ? ( <OffersForm {...propsObj} /> ) : activeTab === 'medical-tips' ? ( <MedicalTipsForm {...propsObj} /> ) : (
                    // Simpler tabs forms (brands, categories)
                    <div className="space-y-8 max-w-xl mx-auto py-10">
                      <div className="aspect-video bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                         {formData.image ? <img src={formData.image} className="w-full h-full object-contain p-4" alt="preview" /> : <Upload size={36} className="text-slate-300" />}
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-black text-xs bg-emerald-600 px-4 py-2 rounded-xl shadow-md">تغيير الصورة</span>
                         </div>
                         <input type="file" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'main')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                         {uploading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-emerald-600" size={32} />
                          </div>
                         )}
                      </div>
                      <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <label className="text-xs font-black text-slate-800 block mr-1">الاسم أو العنوان (عربي)</label>
                             <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-2xl py-4 px-6 font-black text-sm outline-none transition-all text-slate-700" placeholder="اكتب الاسم هنا..." required />
                           </div>
                           <div className="space-y-2">
                             <label className="text-xs font-black text-slate-800 block mr-1">الاسم بالإنجليزية (English Name)</label>
                             <input type="text" value={formData.nameEn || ''} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full bg-slate-50 focus:bg-white border border-transparent focus:border-emerald-500/20 rounded-2xl py-4 px-6 font-black text-sm outline-none transition-all text-slate-700 text-left dir-ltr" placeholder="Enter English name..." />
                           </div>
                         </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Waybill Printing Overlay (Premium Waybill UI) */}
      {selectedOrderForWaybill && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:relative print:inset-auto print:bg-white print:p-0 print:block print:w-full print:h-auto print:overflow-visible print:z-0">
          <div className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 print:shadow-none print:w-full print:max-w-none print:rounded-none print:border-0">
            {/* Header (No print) */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:hidden">
              <div>
                <h3 className="text-xs font-black text-slate-800">طباعة بوليصة الشحن</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">رقم الطلب: #{selectedOrderForWaybill.orderNumber}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Printer size={12} /> طباعة البوليصة
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForWaybill(null)}
                  className="p-2 bg-white text-slate-400 rounded-full hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Printable Waybill Sheet Content */}
            <div id="waybill-content" className="p-6 space-y-4 print:p-0" dir="rtl">
              {/* Waybill Header */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                <div>
                  <div className="text-lg font-black text-emerald-600">The VitaHub</div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider mt-0.5">مكملات غذائية وفيتامينات أصلية</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-800">بوليصة شحن وتوصيل</div>
                  <div className="text-[10px] text-slate-500 font-bold mt-0.5">رقم الطلب: #{selectedOrderForWaybill.orderNumber}</div>
                  {selectedOrderForWaybill.shippingRef && (
                    <div className="text-[10px] text-emerald-600 font-black mt-0.5">رقم التتبع: {selectedOrderForWaybill.shippingRef}</div>
                  )}
                  <div className="text-[8px] text-slate-400 font-bold mt-0.5">{new Date(selectedOrderForWaybill.createdAt).toLocaleString('ar-EG')}</div>
                </div>
              </div>

              {/* Waybill Body: Sender & Receiver Grid */}
              <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded-xl overflow-hidden text-[11px] leading-normal">
                {/* Shipper */}
                <div className="p-3 bg-slate-50/50 space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">المرسل (الشاحن):</span>
                  <div className="font-black text-slate-800">The VitaHub</div>
                  <div className="text-[9px] text-slate-500 font-medium">القاهرة، جمهورية مصر العربية</div>
                  <div className="text-[9px] text-slate-500 font-medium">هاتف: 01270029230</div>
                </div>

                {/* Consignee */}
                <div className="p-3 space-y-1 border-r border-slate-200">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">المرسل إليه (العميل):</span>
                  <div className="font-black text-slate-850">{selectedOrderForWaybill.customerName}</div>
                  <div className="font-black text-emerald-600">هاتف: {selectedOrderForWaybill.customerPhone}</div>
                  <div className="text-[9px] text-slate-500 font-medium">
                    {selectedOrderForWaybill.governorate} - {selectedOrderForWaybill.district}
                    {selectedOrderForWaybill.address && <span className="block mt-0.5 text-slate-700">{selectedOrderForWaybill.address}</span>}
                    {(selectedOrderForWaybill.building || selectedOrderForWaybill.floor || selectedOrderForWaybill.apartment) && (
                      <span className="block mt-0.5 text-[8px] text-slate-450">
                        عمارة: {selectedOrderForWaybill.building} • دور: {selectedOrderForWaybill.floor} • شقة: {selectedOrderForWaybill.apartment}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-[8px] font-black text-slate-400 block mb-0.5">طريقة الدفع</span>
                  <span className="font-black text-slate-750">
                    {selectedOrderForWaybill.paymentMethod === 'cod' ? 'الدفع عند الاستلام (COD)' : 'دفع إلكتروني مسبق / محفظة'}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[8px] font-black text-slate-400 block mb-0.5">المطلوب تحصيله</span>
                  <span className="text-xs font-black text-emerald-600">
                    {selectedOrderForWaybill.total} ج.م
                  </span>
                </div>
              </div>

              {/* Delivery Notes */}
              {selectedOrderForWaybill.notes && (
                <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-2.5 text-[9px] text-amber-800 leading-normal">
                  <span className="font-black block">ملاحظات التوصيل:</span>
                  <p className="font-medium italic">{selectedOrderForWaybill.notes}</p>
                </div>
              )}

              {/* Items Table */}
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
                    {selectedOrderForWaybill.items?.map((item: any) => (
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
                      <td className="px-3 py-1 text-left text-slate-700 text-[9px]">{selectedOrderForWaybill.shippingFee} ج.م</td>
                    </tr>
                    <tr className="bg-slate-50 font-black text-slate-850 border-t border-slate-200">
                      <td className="px-3 py-1.5 text-left text-[9px]" colSpan={2}>الإجمالي النهائي</td>
                      <td className="px-3 py-1.5 text-left text-emerald-600 text-[10px]">{selectedOrderForWaybill.total} ج.م</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Barcode & Receivers Signature Area */}
              <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div 
                    className="w-44 h-9" 
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, #1e293b, #1e293b 2px, transparent 2px, transparent 5px, #1e293b 5px, #1e293b 6px, transparent 6px, transparent 10px, #1e293b 10px, #1e293b 12px, transparent 12px, transparent 14px)'
                    }}
                  />
                  <span className="font-mono text-[9px] font-bold tracking-[0.4em] text-slate-800">
                    {selectedOrderForWaybill.shippingRef || selectedOrderForWaybill.orderNumber}
                  </span>
                </div>
                
                <div className="text-left space-y-1">
                  <div className="text-[7px] text-slate-400 font-black uppercase tracking-wider">توقيع المستلم وتأكيد الاستلام</div>
                  <div className="w-28 h-6 border-b border-dashed border-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details & Status Editor Modal */}
      {selectedOrderForDetails && (() => {
        const order = selectedOrderForDetails;
        return (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:hidden" dir="rtl">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 border border-slate-100/50">
              {/* Header */}
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h3 className="text-base font-black text-slate-800">تفاصيل الطلب #{order.orderNumber}</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{new Date(order.createdAt).toLocaleString('ar-EG')}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrderForDetails(null)} 
                  className="p-2 bg-white text-slate-400 rounded-full hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-8 space-y-8 overflow-y-auto flex-1">
                
                {/* Status Update Control Section */}
                <div className="bg-emerald-600/5 rounded-3xl p-6 border border-emerald-600/10 space-y-4">
                  <h4 className="text-xs font-black text-emerald-600">تحديث حالة الطلب الحالية</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'pending', label: 'قيد الانتظار', color: 'bg-amber-50 text-amber-600 border-amber-500/10 hover:bg-amber-100' },
                      { id: 'shipped', label: 'جاري الشحن', color: 'bg-blue-50 text-blue-600 border-blue-500/10 hover:bg-blue-100' },
                      { id: 'delivered', label: 'تم التوصيل', color: 'bg-emerald-50 text-emerald-600 border-emerald-500/10 hover:bg-emerald-100' },
                      { id: 'cancelled', label: 'تم إلغاء الطلب', color: 'bg-red-50 text-red-600 border-red-500/10 hover:bg-red-100' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={async () => {
                          if (!(await showConfirm(`هل أنت متأكد من تغيير حالة الطلب إلى "${st.label}"؟`, 'تغيير الحالة'))) return;
                          try {
                            const res = await fetchWithAdminAuth(`${BACKEND_API}/api/orders/${order.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: st.id })
                            });
                            if (res.ok) {
                              await showAlert(`تم تغيير الحالة بنجاح إلى: ${st.label} ✅`, 'تحديث الحالة')
                              setSelectedOrderForDetails(null);
                              fetchData();
                            } else {
                              await showAlert('فشل في تحديث الحالة', 'خطأ')
                            }
                          } catch (err) {
                            await showAlert('حدث خطأ', 'خطأ')
                          }
                        }}
                        className={`py-2.5 px-2 rounded-xl text-[9px] sm:text-[10px] font-black transition-all border-2 cursor-pointer ${
                          order.status === st.id 
                            ? 'border-emerald-600 bg-emerald-600 text-white scale-[1.03] shadow-md shadow-emerald-600/10' 
                            : 'border-slate-100 ' + st.color
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Tracking reference input */}
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
                      onClick={async () => {
                        const val = (document.getElementById('modalShippingRef') as HTMLInputElement)?.value || '';
                        try {
                          const res = await fetchWithAdminAuth(`${BACKEND_API}/api/orders/${order.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ shippingRef: val })
                          });
                          if (res.ok) {
                            await showAlert('تم حفظ رقم التتبع بنجاح ✅', 'حفظ التتبع')
                            setSelectedOrderForDetails(null);
                            fetchData();
                          } else {
                            await showAlert('فشل حفظ رقم التتبع', 'خطأ')
                          }
                        } catch (err) {
                          await showAlert('حدث خطأ', 'خطأ')
                        }
                      }}
                      className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:bg-emerald-500 transition-all cursor-pointer whitespace-nowrap w-full md:w-auto flex justify-center"
                    >
                      حفظ رقم التتبع
                    </button>
                  </div>
                </div>

                {/* Customer Details */}
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

                {/* Products List */}
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

                {/* Subtotal and Total */}
                <div className="bg-slate-50 rounded-3xl p-6 border space-y-3 text-xs font-bold text-slate-650">
                  <div className="flex justify-between"><span>المجموع الفرعي للمنتجات</span><span className="font-black text-slate-800">{order.total - order.shippingFee} ج.م</span></div>
                  <div className="flex justify-between"><span>رسوم الشحن والتوصيل</span><span className="font-black text-slate-800">{order.shippingFee} ج.م</span></div>
                  <div className="flex justify-between text-sm font-black text-slate-800 border-t pt-3"><span>الإجمالي النهائي</span><span className="text-emerald-600 text-base">{order.total} ج.م</span></div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}
