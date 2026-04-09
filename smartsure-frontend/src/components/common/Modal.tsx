import React from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineX } from 'react-icons/hi'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  // We use a Portal to ensure the modal is rendered at the root of the document.
  // This prevents centering issues caused by parent transforms/animations (like animate-fade-in).
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop with fade effect */}
      <div 
        className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content with scale-in animation */}
      <div className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-modal-slide-up border border-surface-200 dark:border-surface-800">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-surface-200 dark:border-surface-800">
          <h3 className="text-xl font-bold text-surface-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-surface-400 hover:text-surface-900 dark:hover:text-white rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
          >
            <HiOutlineX className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
