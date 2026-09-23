import { Link } from 'react-router'
import { Mail } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { ContactMessage } from '@/types'
import { formatDateTime } from './date'

const STATUS_STYLES: Record<string, 'default' | 'accent' | 'tertiary'> = {
  new: 'accent',
  read: 'default',
  replied: 'tertiary',
  archived: 'default',
}

export function MessageRow({ message }: { message: ContactMessage }) {
  return (
    <li>
      <Link
        to={`/admin/messages?id=${message.id}`}
        className="glass flex flex-col gap-2 rounded-2xl p-5 transition hover:border-white/15 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary">
            <Mail className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{message.name}</span>
              <Badge variant={STATUS_STYLES[message.status] ?? 'default'}>{message.status}</Badge>
            </span>
            <span className="mt-1 block truncate text-sm text-muted">
              {message.message.length > 90
                ? `${message.message.slice(0, 90)}…`
                : message.message}
            </span>
          </span>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted">
          {formatDateTime(message.created_at)}
        </span>
      </Link>
    </li>
  )
}