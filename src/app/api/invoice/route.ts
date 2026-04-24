import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    // Fetch transaction
    const { data: tx, error: txError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id) // Security: only own transactions
      .single();

    if (txError || !tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Only generate invoices for purchases/topups/subscriptions
    if (!['purchase', 'topup', 'subscription'].includes(tx.type)) {
      return NextResponse.json({ error: 'No invoice for this transaction type' }, { status: 400 });
    }

    // Get user details
    const { data: userData } = await supabase
      .from('zestio_users')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const invoiceNumber = `INV-${tx.created_at.slice(0, 10).replace(/-/g, '')}-${tx.id.slice(0, 8).toUpperCase()}`;
    const date = new Date(tx.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Determine line item
    const lineItems = getLineItem(tx);
    const total = lineItems.reduce((sum, item) => sum + item.total, 0);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, system-ui, sans-serif; color: #1d2832; padding: 48px; max-width: 700px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 48px; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-mark { width: 32px; height: 32px; background: #1a1d24; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 14px; }
    .logo-text { font-size: 18px; font-weight: 700; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 28px; color: #1d2832; font-family: Georgia, serif; }
    .invoice-title p { color: #8c9196; font-size: 13px; margin-top: 4px; }
    .details { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 13px; }
    .details dt { color: #8c9196; margin-bottom: 2px; }
    .details dd { font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { text-align: left; padding: 12px 16px; background: #f7f9ff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #8c9196; font-weight: 600; }
    td { padding: 16px; border-bottom: 1px solid #edf4ff; font-size: 14px; }
    .total-row td { border-bottom: none; font-weight: 700; font-size: 16px; }
    .total-row .amount { color: #006c4d; }
    .footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid #edf4ff; text-align: center; color: #8c9196; font-size: 12px; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-mark">Z</div>
      <div class="logo-text">Zestio</div>
    </div>
    <div class="invoice-title">
      <h1>Invoice</h1>
      <p>${invoiceNumber}</p>
    </div>
  </div>

  <div class="details">
    <dl>
      <dt>Bill to</dt>
      <dd>${userData?.full_name || userData?.email || user.email}</dd>
      <dd style="color:#8c9196;margin-top:2px;">${user.email}</dd>
    </dl>
    <dl style="text-align:right;">
      <dt>Date</dt>
      <dd>${date}</dd>
      <dt>Status</dt>
      <dd style="color:#006c4d;">Paid</dd>
    </dl>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Qty</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems.map(item => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align:right;">${item.qty}</td>
        <td style="text-align:right;">${item.unitPrice}</td>
        <td style="text-align:right;">${item.total.toFixed(2)} €</td>
      </tr>`).join('')}
      <tr class="total-row">
        <td colspan="3" style="text-align:right;">Total</td>
        <td class="amount" style="text-align:right;">${total.toFixed(2)} €</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Zestio &middot; AI Real Estate Tools</p>
    <p style="margin-top:4px;">Thank you for your business.</p>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (err) {
    console.error('Invoice error:', err);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

function getLineItem(tx: { type: string; amount: number; description: string | null }) {
  // Credit cost mapping
  const creditPacks: Record<number, { price: number; label: string }> = {
    50: { price: 9, label: '50 Credit Pack' },
    200: { price: 29, label: '200 Credit Pack' },
    500: { price: 59, label: '500 Credit Pack' },
    100: { price: 0, label: 'Pro Plan — 100 Monthly Credits' },
  };

  // Subscription credits
  if (tx.type === 'subscription' || tx.type === 'purchase') {
    const pack = creditPacks[tx.amount];
    if (pack) {
      return [{ description: pack.label, qty: 1, unitPrice: `${pack.price.toFixed(2)} €`, total: pack.price }];
    }
    // Pro plan fallback
    return [{ description: 'Pro Plan Subscription', qty: 1, unitPrice: '29.00 €', total: 29.00 }];
  }

  // Top-up
  if (tx.type === 'topup') {
    const pack = creditPacks[tx.amount];
    if (pack) {
      return [{ description: pack.label, qty: 1, unitPrice: `${pack.price.toFixed(2)} €`, total: pack.price }];
    }
    // Custom amount: estimate price at €0.18/credit (blended rate)
    const estimatedPrice = Math.round(tx.amount * 0.12 * 100) / 100;
    return [{ description: `${tx.amount} Credit Top-Up`, qty: 1, unitPrice: `${estimatedPrice.toFixed(2)} €`, total: estimatedPrice }];
  }

  return [{ description: tx.description || 'Credit purchase', qty: 1, unitPrice: '—', total: 0 }];
}
