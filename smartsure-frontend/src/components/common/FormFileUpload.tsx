import React, { useState } from 'react'
import { HiOutlineUpload, HiOutlineDocumentAdd } from 'react-icons/hi'

interface FormFileUploadProps {
  label: string
  helperText?: string
  accept?: string
  value?: File | null
  onChange: (file: File | null) => void
  error?: string
  containerClassName?: string
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
  label,
  helperText,
  accept = ".pdf,image/jpeg,image/png,image/jpg",
  value,
  onChange,
  error,
  containerClassName = ""
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChange(e.dataTransfer.files[0])
    }
  }

  return (
    <div className={`space-y-3 ${containerClassName}`}>
      <label className="block text-xs font-black uppercase tracking-widest text-surface-500 dark:text-surface-400 pl-1">
        {label}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 group
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 scale-[1.01]' 
            : 'border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-900/40 hover:border-primary-500/50'
          }
          ${error ? 'border-red-500/50' : ''}
          ${value ? 'bg-primary-50/30 dark:bg-primary-950/20 border-primary-500/40' : ''}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onChange(e.target.files[0])
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500
            ${value || isDragging
              ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 scale-110'
              : 'bg-surface-100 dark:bg-surface-850 text-surface-400 group-hover:scale-110 group-hover:text-primary-500'
            }
          `}>
            {value ? (
              <HiOutlineDocumentAdd className="text-3xl" />
            ) : (
              <HiOutlineUpload className="text-3xl" />
            )}
          </div>

          {value ? (
            <div className="animate-fade-in">
              <p className="text-sm font-bold text-surface-900 dark:text-white mb-1 truncate max-w-[200px]">
                {value.name}
              </p>
              <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-widest">
                {(value.size / 1024 / 1024).toFixed(2)} MB • Ready
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-bold text-surface-900 dark:text-white">
                Drag & drop or <span className="text-primary-600">browse</span>
              </p>
              <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">
                {helperText || "PDF, JPG, PNG (Max 10MB)"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {error && <p className="text-[11px] font-bold text-red-500 pl-1">{error}</p>}
    </div>
  )
}
