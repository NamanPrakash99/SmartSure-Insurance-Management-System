import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminService } from '../../api/adminService'
import { policyService } from '../../api/policyService'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { Modal } from '../../components/common/Modal'
import { toast } from 'react-toastify'
import { useDebounce } from '../../hooks/useDebounce'
import { policySchema, PolicyInput } from '../../schemas/policySchema'
import { Button } from '../../components/common/Button'
import { FormInput } from '../../components/common/FormInput'
import { FormSelect } from '../../components/common/FormSelect'
import { FormTextarea } from '../../components/common/FormTextarea'
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineShieldCheck,
} from 'react-icons/hi'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 400)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PolicyInput>({
    resolver: zodResolver(policySchema),
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, categoryFilter])

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const category = p.category || policyTypes.find((t) => t.id === p.policyTypeId)?.category
      const matchesCategory =
        categoryFilter === 'ALL' || category?.toUpperCase() === categoryFilter.toUpperCase()
      
      const searchLower = debouncedSearchTerm.toLowerCase()
      const nameMatch = p.name?.toLowerCase().includes(searchLower)
      const idMatch = p.id?.toString() === debouncedSearchTerm
      
      return matchesCategory && (debouncedSearchTerm === '' || nameMatch || idMatch)
    })
  }, [policies, policyTypes, debouncedSearchTerm, categoryFilter])

  const totalItems = filteredPolicies.length
  const startIndex = (currentPage - 1) * pageSize
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + pageSize)

  const fetchData = async () => {
    const [policiesRes, typesRes] = await Promise.all([
      policyService.getAllPolicies(),
      policyService.getPolicyTypes(),
    ])

    if (policiesRes.success) setPolicies(policiesRes.data)
    if (typesRes.success) setPolicyTypes(typesRes.data)
    setLoading(false)
  }

  const handleOpenEdit = (policy: Policy) => {
    setEditingPolicy(policy)
    reset({
      name: policy.name || policy.policyName || '',
      description: policy.description || policy.policyDescription || '',
      policyTypeId: String(policy.policyTypeId || ''),
      premiumAmount: String(policy.premiumAmount || ''),
      coverageAmount: String(policy.coverageAmount || ''),
      durationInMonths: String(policy.durationInMonths || ''),
    })
    setIsModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingPolicy(null)
    reset({
      name: '',
      description: '',
      policyTypeId: policyTypes[0]?.id ? String(policyTypes[0].id) : '',
      premiumAmount: '',
      coverageAmount: '',
      durationInMonths: '',
    })
    setIsModalOpen(true)
  }

  const onSubmit = async (data: PolicyInput) => {
    setIsSubmitting(true)

    // Prepare standardized data for backend
    const submissionData = {
      name: data.name,
      policyName: data.name,
      description: data.description,
      policyDescription: data.description,
      policyTypeId: Number(data.policyTypeId),
      premiumAmount: Number(data.premiumAmount),
      coverageAmount: Number(data.coverageAmount),
      durationInMonths: Number(data.durationInMonths),
      // Alt field names for compatibility
      premium: Number(data.premiumAmount),
      coverage: Number(data.coverageAmount),
      typeId: Number(data.policyTypeId),
    }

    const response = editingPolicy
      ? await adminService.updatePolicy(editingPolicy.id, submissionData)
      : await adminService.createPolicy(submissionData)

    if (response.success) {
      toast.success(`Policy ${editingPolicy ? 'updated' : 'created'} successfully!`)
      setIsModalOpen(false)
      fetchData()
    } else {
      toast.error(`Action Failed: ${response.message || 'Unknown error'}`)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure?')) return
    const response = await adminService.deletePolicy(id)
    if (response.success) {
      toast.success('Policy deleted')
      fetchData()
    } else {
      toast.error('Deletion failed')
    }
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
            <FormInput
              placeholder="Search policies by name or ID..."
              leftIcon={<HiOutlineSearch />}
              containerClassName="flex-1 w-full"
              className="!rounded-full !py-3.5 !pl-14 !pr-6 !border-none !focus:ring-2 !focus:ring-primary-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-950/50 p-1 rounded-full">
              {['ALL', 'HEALTH', 'LIFE', 'VEHICLE'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all ${
                    categoryFilter === cat
                      ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-white shadow-xl'
                      : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center pl-4 pr-1">
              <Button
                onClick={handleOpenCreate}
                size="sm"
                leftIcon={<HiOutlinePlus />}
                className="rounded-full !px-6"
              >
                Create New
              </Button>
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
                    {policy.category ||
                      policyTypes.find((t) => t.id === policy.policyTypeId)?.category ||
                      'General'}
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
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">
                      Premium
                    </p>
                    <p className="font-extrabold text-primary-600 dark:text-primary-400 text-xl tracking-tight">
                      ₹{(policy.premiumAmount || 0).toLocaleString()}
                      <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest ml-1">
                        /mo
                      </span>
                    </p>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-900 md:bg-transparent md:dark:bg-transparent p-3 md:p-0 rounded-xl relative">
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-1">
                      Coverage
                    </p>
                    <p className="font-extrabold text-surface-900 dark:text-white text-xl tracking-tight">
                      {policy.coverageAmount && policy.coverageAmount >= 100000
                        ? `₹${(policy.coverageAmount / 100000).toFixed(1)}L`
                        : `₹${(policy.coverageAmount || 0).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 md:px-8 pb-6 pt-0 flex gap-3 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => handleOpenEdit(policy)}
                  leftIcon={<HiOutlinePencilAlt />}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="!text-red-500 !border-red-500/50 hover:!bg-red-500/10"
                  onClick={() => handleDelete(policy.id)}
                  leftIcon={<HiOutlineTrash />}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={pageSize}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setPageSize}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPolicy ? 'Edit Policy' : 'Create New Policy'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Policy Name"
            placeholder="Enter policy name..."
            error={errors.name?.message}
            {...register('name')}
          />

          <FormTextarea
            label="Description"
            placeholder="Enter policy description..."
            error={errors.description?.message}
            rows={4}
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Policy Category"
              error={errors.policyTypeId?.message}
              options={[
                { value: '', label: 'Select Type' },
                ...policyTypes.map(t => ({ value: t.id, label: t.category }))
              ]}
              {...register('policyTypeId')}
            />
            <FormInput
              label="Duration"
              type="number"
              placeholder="Months"
              error={errors.durationInMonths?.message}
              {...register('durationInMonths')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Premium (₹)"
              type="number"
              placeholder="0.00"
              error={errors.premiumAmount?.message}
              {...register('premiumAmount')}
            />
            <FormInput
              label="Coverage (₹)"
              type="number"
              placeholder="0.00"
              error={errors.coverageAmount?.message}
              {...register('coverageAmount')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              className="min-w-[140px]"
            >
              {editingPolicy ? 'Update Policy' : 'Create Policy'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
