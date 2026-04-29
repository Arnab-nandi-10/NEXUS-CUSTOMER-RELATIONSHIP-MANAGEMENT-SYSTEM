import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className 
}: BadgeProps) {
  const variants = {
    default: 'bg-dark-100 text-dark-700 dark:bg-dark-800 dark:text-dark-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-950 dark:text-danger-300',
    info: 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
