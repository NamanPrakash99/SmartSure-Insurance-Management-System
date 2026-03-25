import { useState, useEffect } from 'react'
import { adminService } from '../../api/adminService'
import { policyService } from '../../api/policyService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { Modal } from '../../components/common/Modal'
import { toast } from 'react-toastify'
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePlus, HiSearch } from 'react-icons/hi'
import { Pagination } from '../../components/common/Pagination'

export default function PolicyManagement() {
  const [policies, setPolicies] = useState([])
  const [policyTypes, setPolicyTypes] = useState([]) // For dropdown
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  
  const initialFormState = {
    policyName: '',
    description: '',
    policyTypeId: 1, // Default, assuming ID 1 exists
    premiumAmount: '',
    coverageAmount: '',
    durationInMonths: ''
  }
  
  const [formData, setFormData] = useState(initialFormState)

  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    fetchData()
  }, [])

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, searchTerm])

  const filteredPolicies = policies.filter(p => {
    // 1. Category Filter
    const category = p.category || policyTypes.find(t => t.id === p.policyTypeId)?.category
    const matchesCategory = categoryFilter === 'ALL' || category?.toUpperCase() === categoryFilter.toUpperCase()
    
    // 2. Search Term Filter (Name or ID)
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' || 
      p.policyName?.toLowerCase().includes(searchLower) || 
      p.id?.toString() === searchTerm
      
    return matchesCategory && matchesSearch
  })

  // Pagination Table Logic
  const totalItems = filteredPolicies.length
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + pageSize)

  const fetchData = async () => {
    try {
      // Need both policies list and policy types for the dropdown
      const [policiesRes, typesRes] = await Promise.all([
        policyService.getAllPolicies(),
        policyService.getPolicyTypes()
      ])
      setPolicies(policiesRes.data)
      setPolicyTypes(typesRes.data)
      if (typesRes.data.length > 0) {
        setFormData(prev => ({...prev, policyTypeId: typesRes.data[0].id}))
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (policy) => {
    setEditingPolicy(policy)
    setFormData({
      policyName: policy.policyName,
      description: policy.description,
      policyTypeId: policy.policyTypeId || (policyTypes[0]?.id),
      premiumAmount: policy.premiumAmount,
      coverageAmount: policy.coverageAmount,
      durationInMonths: policy.durationInMonths
    })
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingPolicy(null)
    setFormData(initialFormState)
    if (policyTypes.length > 0) {
       setFormData(f => ({...f, policyTypeId: policyTypes[0].id}))
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPolicy) {
        await adminService.updatePolicy(editingPolicy.id, formData)
        toast.success('Policy updated successfully')
      } else {
        await adminService.createPolicy(formData)
        toast.success('Policy created successfully')
      }
      setIsModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('API Error:', error);
      const msg = error.response?.data?.message || error.response?.data || error.message || 'Action failed';
      toast.error(msg);
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await adminService.deletePolicy(id)
        toast.success('Policy deleted')
        fetchData()
      } catch (error) {
        toast.error('Failed to delete policy')
      }
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <>
      <div className="space-y-10">
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="section-title !text-4xl">Manage Policies</h1>
            <p className="text-surface-500 mt-2 font-medium">Configure and explore insurance products in AI-Mode.</p>
          </div>
        </div>

        {/* Unified Toolbar */}
        <div className="ai-gradient-border shadow-2xl overflow-visible max-w-5xl mx-auto">
          <div className="ai-content flex flex-col lg:flex-row items-center gap-4 bg-white dark:bg-surface-900 p-2 rounded-full">
            <div className="relative group flex-1 w-full">
             <HiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors text-lg" />
             <input 
                type="text" 
                placeholder="Type to search policies..." 
                className="w-full bg-white dark:bg-surface-800 py-3.5 pl-14 pr-6 rounded-full border-none focus:ring-2 focus:ring-primary-500/20 text-sm font-medium placeholder-surface-400 transition-all dark:shadow-inner" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
            </div>

            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-950/50 p-1 rounded-full border border-surface-200/50 dark:border-surface-800">
              {['ALL', 'HEALTH', 'LIFE', 'VEHICLE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500 ${
                    categoryFilter === cat
                      ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-white shadow-xl scale-105'
                      : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="hidden lg:flex items-center pl-4 pr-1 border-l border-surface-200 dark:border-surface-800">
               <button 
                  onClick={handleOpenCreate}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 shadow-lg shadow-primary-500/25 flex items-center gap-2 active:scale-95 whitespace-nowrap"
               >
                  <HiOutlinePlus className="text-sm" />
                  <span>Create New</span>
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPolicies.length === 0 ? (
              <div className="col-span-full card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 bg-transparent shadow-none dark:border-surface-800">
                 <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800/50 rounded-full flex items-center justify-center mb-4 text-surface-400">
                    <HiOutlinePlus className="text-3xl" />
                 </div>
                 <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">No policies configured</h3>
                 <p className="text-surface-500 max-w-sm mb-6">You haven't created any insurance policies yet. Click the "Create New" button to get started.</p>
                 <button onClick={handleOpenCreate} className="btn-primary">Create First Policy</button>
              </div>
            ) : (
              paginatedPolicies.map((policy, idx) => (
                <div 
                  key={policy.id} 
                  className="card group flex flex-col h-full border-2 border-transparent hover:border-primary-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10 animate-fade-in p-0 overflow-hidden"
                  style={{ animationDelay: `${(idx % 6) * 100}ms` }}
                >
                  <div className="p-6 pb-4 border-b border-surface-100 dark:border-surface-800/60 relative">
                      <div className="absolute top-0 right-0 p-4 flex gap-2">
                         <span className="px-3 py-1 text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 rounded-full shadow-inner ring-1 ring-primary-500/20">
                           {policy.category || policyTypes.find(t => t.id === policy.policyTypeId)?.category || 'General'}
                         </span>
                         <span className="px-3 py-1 text-[10px] font-bold text-surface-400 uppercase tracking-widest bg-surface-100 dark:bg-surface-800 rounded-full shadow-inner">
                           ID: {policy.id}
                         </span>
                      </div>
                     
                     <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2 pr-16 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                       {policy.policyName}
                     </h3>
                     <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 min-h-[40px]">
                       {policy.description}
                     </p>
                  </div>

                  <div className="p-6 flex-1 bg-surface-50/50 dark:bg-surface-900/20">
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Premium</p>
                           <p className="font-extrabold text-primary-600 dark:text-primary-400 text-lg">₹{(policy.premiumAmount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Coverage</p>
                           <p className="font-extrabold text-surface-900 dark:text-white text-lg">₹{((policy.coverageAmount || 0)/100000).toFixed(1)}L</p>
                        </div>
                        <div className="col-span-2">
                           <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Duration</p>
                           <p className="font-semibold text-surface-700 dark:text-surface-300 text-sm">{policy.durationInMonths} months</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-4 bg-surface-50 dark:bg-surface-800/40 border-t border-surface-100 dark:border-surface-800 flex justify-end gap-3 transition-colors">
                     <button 
                       onClick={() => handleOpenEdit(policy)} 
                       className="btn-secondary !py-2 !px-4 flex items-center gap-2 text-sm bg-white dark:bg-surface-800 shadow-sm"
                     >
                        <HiOutlinePencilAlt className="text-primary-600 dark:text-primary-400" />
                        <span>Edit</span>
                     </button>
                     <button 
                       onClick={() => handleDelete(policy.id)} 
                       className="btn-ghost !py-2 !px-4 flex items-center gap-2 text-sm hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 text-red-600 dark:text-red-400"
                     >
                       <HiOutlineTrash />
                       <span>Delete</span>
                     </button>
                  </div>
                </div>
              ))
            )}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={pageSize}
          onPageChange={(p) => {
             setCurrentPage(p)
             window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onItemsPerPageChange={(size) => {
             setPageSize(size)
             setCurrentPage(1)
          }}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPolicy ? "Edit Policy" : "Create New Policy"}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea required className="input-field h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Policy Name</label>
            <input required type="text" placeholder="e.g. Premium Health Shield" className="input-field" value={formData.policyName} onChange={e => setFormData({...formData, policyName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Type/Category</label>
              <select className="input-field" value={formData.policyTypeId} onChange={e => setFormData({...formData, policyTypeId: Number(e.target.value)})}>
                 {policyTypes.map(t => <option key={t.id} value={t.id}>{t.category} - {t.description}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Duration (Months)</label>
              <input required type="number" min="1" className="input-field" value={formData.durationInMonths} onChange={e => setFormData({...formData, durationInMonths: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Premium Amount (₹)</label>
              <input required type="number" min="1" className="input-field" value={formData.premiumAmount} onChange={e => setFormData({...formData, premiumAmount: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Total Coverage (₹)</label>
              <input required type="number" min="1" className="input-field" value={formData.coverageAmount} onChange={e => setFormData({...formData, coverageAmount: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 border-t border-surface-200 dark:border-surface-800 mt-6 flex justify-end gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
             <button type="submit" className="btn-primary">{editingPolicy ? "Update Policy" : "Create Policy"}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
