import React, { useState, useEffect } from 'react'
import { adminService } from '../../api/adminService'
import { policyService } from '../../api/policyService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { Modal } from '../../components/common/Modal'
import { toast } from 'react-toastify'
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch, HiOutlineShieldCheck } from 'react-icons/hi'
import { Pagination } from '../../components/common/Pagination'
import { Policy } from '../../types'

interface PolicyType {
  id: number
  category: string
  description: string
}

export default function PolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [policyTypes, setPolicyTypes] = useState<PolicyType[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)

  const initialFormState = {
    name: '',
    description: '',
    policyTypeId: '' as string | number,
    premiumAmount: '' as string | number,
    coverageAmount: '' as string | number,
    durationInMonths: '' as string | number
  }

  const [formData, setFormData] = useState(initialFormState)

  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, searchTerm])

  const filteredPolicies = policies.filter(p => {
    const category = p.category || policyTypes.find(t => t.id === p.policyTypeId)?.category
    const matchesCategory = categoryFilter === 'ALL' || category?.toUpperCase() === categoryFilter.toUpperCase()
    const searchLower = searchTerm.toLowerCase()
    const nameMatch = p.name?.toLowerCase().includes(searchLower)
    const idMatch = p.id?.toString() === searchTerm
    return matchesCategory && (searchTerm === '' || nameMatch || idMatch)
  })

  const totalItems = filteredPolicies.length
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + pageSize)

  const fetchData = async () => {
    try {
      const [policiesRes, typesRes] = await Promise.all([
        policyService.getAllPolicies(),
        policyService.getPolicyTypes()
      ])
      
      if (policiesRes.success) setPolicies(policiesRes.data)
      if (typesRes.success) {
        setPolicyTypes(typesRes.data)
        if (typesRes.data.length > 0 && !formData.policyTypeId) {
          setFormData(prev => ({ ...prev, policyTypeId: typesRes.data[0].id }))
        }
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (policy: Policy) => {
    setEditingPolicy(policy)
    setFormData({
      name: policy.name || '',
      description: policy.description || '',
      policyTypeId: policy.policyTypeId || (policyTypes[0]?.id || ''),
      premiumAmount: policy.premiumAmount || '',
      coverageAmount: policy.coverageAmount || '',
      durationInMonths: policy.durationInMonths || ''
    })
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingPolicy(null)
    setFormData({
      ...initialFormState,
      policyTypeId: policyTypes[0]?.id || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.policyTypeId) {
      toast.error('Please select a policy type')
      return
    }

    // Prepare data with redundancy for field names to ensure backend compatibility
    const submissionData = {
      name: formData.name,
      policyName: formData.name, // Potential required backend field
      description: formData.description,
      policyDescription: formData.description, // Redundancy
      policyTypeId: Number(formData.policyTypeId),
      premiumAmount: Number(formData.premiumAmount),
      coverageAmount: Number(formData.coverageAmount),
      durationInMonths: Number(formData.durationInMonths),
      // Legacy / alternate fields
      premium: Number(formData.premiumAmount),
      coverage: Number(formData.coverageAmount),
      typeId: Number(formData.policyTypeId)
    }

    try {
      let response;
      if (editingPolicy) {
        response = await adminService.updatePolicy(editingPolicy.id, submissionData)
      } else {
        response = await adminService.createPolicy(submissionData)
      }
      
      if (response.success) {
        toast.success(`Policy ${editingPolicy ? 'updated' : 'created'} successfully!`)
        setIsModalOpen(false)
        fetchData()
      } else {
        toast.error(`Action Failed: ${response.message || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Submission Error:', error)
      const msg = error.response?.data?.message || error.response?.data || 'Server error'
      toast.error(`Submission Error: ${msg}`)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure?")) return
    try {
      const response = await adminService.deletePolicy(id)
      if (response.success) {
        toast.success('Policy deleted')
        fetchData()
      }
    } catch (error) {
      toast.error('Deletion failed')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  if (loading) return <LoadingSpinner />

  return (
    <>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="section-title !text-4xl">Manage Policies</h1>
            <p className="text-surface-500 mt-2 font-medium">Configure insurance products.</p>
          </div>
        </div>

        <div className="ai-gradient-border shadow-2xl overflow-visible max-w-5xl mx-auto">
          <div className="ai-content flex flex-col lg:flex-row items-center gap-4 bg-white dark:bg-surface-900 p-2 rounded-full">
            <div className="relative group flex-1 w-full">
              <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors text-lg" />
              <input
                type="text"
                placeholder="Type to search policies..."
                className="w-full bg-white dark:bg-surface-800 py-3.5 pl-14 pr-6 rounded-full border-none focus:ring-2 focus:ring-primary-500/20 text-sm font-medium placeholder-surface-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-950/50 p-1 rounded-full">
              {['ALL', 'HEALTH', 'LIFE', 'VEHICLE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${categoryFilter === cat ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-white shadow-xl' : 'text-surface-500 hover:text-surface-900'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center pl-4 pr-1">
              <button onClick={handleOpenCreate} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                <HiOutlinePlus className="text-sm" />
                <span>Create New</span>
              </button>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPolicies.map((policy, idx) => (
            <div 
              key={policy.id} 
              className="card group flex flex-col h-full border-2 border-transparent hover:border-primary-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10 animate-fade-in"
              style={{ animationDelay: `${(idx % 6) * 100}ms` }}
            >
              <div className="p-6 md:p-8 flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary-50 dark:bg-primary-900/20 rounded-full group-hover:scale-150 transition-transform duration-700 ease-in-out pointer-events-none" />
                
                <div className="relative z-10 w-14 h-14 bg-white dark:bg-surface-800 shadow-lg border border-surface-100 dark:border-surface-700 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <HiOutlineShieldCheck className="text-2xl" />
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                   <span className="px-3 py-1 text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 rounded-full shadow-inner ring-1 ring-primary-500/20">
                     {policy.category || policyTypes.find(t => t.id === policy.policyTypeId)?.category || 'General'}
                   </span>
                </div>
                
                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {policy.policyName || policy.name}
                </h3>
                <p className="text-surface-500 dark:text-surface-400 text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                  {policy.policyDescription || policy.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-surface-50 dark:bg-surface-900 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-xl relative">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Premium</p>
                    <p className="font-extrabold text-primary-600 dark:text-primary-400 text-xl tracking-tight">₹{(policy.premiumAmount || 0).toLocaleString()}<span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest ml-1">/mo</span></p>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-900 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-xl relative">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">Coverage</p>
                    <p className="font-extrabold text-surface-900 dark:text-white text-xl tracking-tight">
                      {policy.coverageAmount && policy.coverageAmount >= 100000 
                        ? `₹${(policy.coverageAmount / 100000).toFixed(1)}L` 
                        : `₹${(policy.coverageAmount || 0).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 md:px-8 pb-6 pt-0 flex gap-3 z-10">
                <button 
                  onClick={() => handleOpenEdit(policy)}
                  className="flex-1 btn-ghost border border-primary-200 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 text-xs tracking-widest uppercase font-black !py-3 flex items-center justify-center gap-2 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all active:scale-95 shadow-sm"
                >
                  <HiOutlinePencilAlt className="text-lg" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(policy.id)}
                  className="flex-1 btn-ghost border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs tracking-widest uppercase font-black !py-3 flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-95 shadow-sm"
                >
                  <HiOutlineTrash className="text-lg" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={pageSize} onPageChange={setCurrentPage} onItemsPerPageChange={setPageSize} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPolicy ? "Edit Policy" : "Create New Policy"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="text" placeholder="Policy Name" className="input-field" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
          <textarea required placeholder="Description" className="input-field h-24" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <select required className="input-field" value={formData.policyTypeId} onChange={e => handleInputChange('policyTypeId', e.target.value)}>
              <option value="">Select Type</option>
              {policyTypes.map(t => <option key={t.id} value={t.id}>{t.category}</option>)}
            </select>
            <input required type="number" placeholder="Duration (Months)" className="input-field" value={formData.durationInMonths} onChange={e => handleInputChange('durationInMonths', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" placeholder="Premium Amount (₹)" className="input-field" value={formData.premiumAmount} onChange={e => handleInputChange('premiumAmount', e.target.value)} />
            <input required type="number" placeholder="Coverage Amount (₹)" className="input-field" value={formData.coverageAmount} onChange={e => handleInputChange('coverageAmount', e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Confirm</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
