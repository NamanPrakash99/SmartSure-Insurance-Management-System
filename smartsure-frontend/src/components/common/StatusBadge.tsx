const statusConfig = {
  ACTIVE: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200/50 dark:border-emerald-500/20',
    pulse: false,
  },
  APPROVED: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200/50 dark:border-emerald-500/20',
    pulse: false,
  },
  SUBMITTED: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
    border: 'border-blue-200/50 dark:border-blue-500/20',
    pulse: true,
  },
  UNDER_REVIEW: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    border: 'border-amber-200/50 dark:border-amber-500/20',
    pulse: true,
  },
  PENDING: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    border: 'border-amber-200/50 dark:border-amber-500/20',
    pulse: true,
  },
  REJECTED: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    border: 'border-red-200/50 dark:border-red-500/20',
    pulse: false,
  },
  CANCELLED: {
    bg: 'bg-surface-100 dark:bg-surface-800',
    text: 'text-surface-500 dark:text-surface-400',
    dot: 'bg-surface-400',
    border: 'border-surface-200/50 dark:border-surface-700/50',
    pulse: false,
  },
  CLOSED: {
    bg: 'bg-surface-100 dark:bg-surface-800',
    text: 'text-surface-600 dark:text-surface-400',
    dot: 'bg-surface-500',
    border: 'border-surface-200/50 dark:border-surface-700/50',
    pulse: false,
  },
  EXPIRED: {
    bg: 'bg-surface-100 dark:bg-surface-800',
    text: 'text-surface-500 dark:text-surface-400',
    dot: 'bg-surface-400',
    border: 'border-surface-200/50 dark:border-surface-700/50',
    pulse: false,
  },
  PENDING_PAYMENT: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    border: 'border-amber-200/50 dark:border-amber-500/20',
    pulse: true,
  },
}

const defaultConfig = {
  bg: 'bg-surface-100 dark:bg-surface-800',
  text: 'text-surface-600 dark:text-surface-400',
  dot: 'bg-surface-400',
  border: 'border-surface-200/50 dark:border-surface-700/50',
  pulse: false,
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = (statusConfig as any)[status] || defaultConfig

  const formatStatus = (s: string) =>
    s ? s.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : ''

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
      {formatStatus(status)}
    </span>
  )
}
