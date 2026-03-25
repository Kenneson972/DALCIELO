import { supabase, supabaseEnabled } from '@/lib/supabaseClient'

export type AuditAction =
  | 'order.validate'
  | 'order.update'
  | 'order.delete'
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'stock.update'
  | 'client.create'
  | 'client.update'
  | 'client.delete'

interface AuditEntry {
  action: AuditAction | string
  entity_type: string
  entity_id?: string
  details?: Record<string, unknown>
  ip?: string
}

/**
 * Log an admin action to the admin_audit_log table.
 * Fails silently — audit logging should never block the main operation.
 */
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  if (!supabaseEnabled || !supabase) return
  try {
    await supabase.from('admin_audit_log').insert([{
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id ?? null,
      details: entry.details ?? null,
      ip: entry.ip ?? null,
      created_at: new Date().toISOString(),
    }])
  } catch {
    // Audit logging should never throw
  }
}
