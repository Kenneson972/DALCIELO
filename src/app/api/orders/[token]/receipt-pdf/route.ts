import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabaseAdmin'
import { getOrderByToken, setOrderReceiptPdfUrl } from '@/lib/ordersStore'

const RECEIPT_BUCKET = 'receipts'

/**
 * POST /api/orders/[token]/receipt-pdf
 * Appelé par n8n après génération du PDF : envoie le corps de la requête (binaire PDF),
 * en-tête requis : x-receipt-secret = RECEIPT_UPLOAD_SECRET
 */
export async function POST(
  req: Request,
  ctx: { params: { token: string } | Promise<{ token: string }> }
) {
  const params = await Promise.resolve(ctx.params)
  const token = params?.token?.trim()
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const secret = process.env.RECEIPT_UPLOAD_SECRET
  if (!secret) {
    console.error('[receipt-pdf] RECEIPT_UPLOAD_SECRET not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const receivedSecret = req.headers.get('x-receipt-secret') ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (receivedSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await getOrderByToken(token)
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  let pdfBuffer: ArrayBuffer
  try {
    pdfBuffer = await req.arrayBuffer()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
  if (pdfBuffer.byteLength === 0) {
    return NextResponse.json({ error: 'Empty PDF' }, { status: 400 })
  }

  const supabase = getSupabase()
  const fileName = `${token}.pdf`

  const { error: uploadError } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('[receipt-pdf] Storage upload failed:', uploadError)
    return NextResponse.json(
      { error: 'Upload failed', details: uploadError.message },
      { status: 500 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? ''
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${RECEIPT_BUCKET}/${fileName}`

  const updated = await setOrderReceiptPdfUrl(token, publicUrl)
  if (!updated) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, receipt_pdf_url: publicUrl })
}
