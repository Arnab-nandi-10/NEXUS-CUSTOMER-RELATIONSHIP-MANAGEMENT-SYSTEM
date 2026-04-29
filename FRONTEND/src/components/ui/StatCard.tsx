import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  icon: LucideIcon
  iconColor?: string
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-primary-600',
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        'card p-6 hover:shadow-soft-xl transition-shadow duration-200',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-dark-600 dark:text-dark-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-dark-900 dark:text-dark-50">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  change.trend === 'up' ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-sm text-dark-500 dark:text-dark-500 ml-2">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl bg-primary-50 dark:bg-primary-950',
            iconColor
          )}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}
