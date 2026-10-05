export default function renderOrderStatusEmail(order = {}) {
  const timeline = (order.trackingHistory || [])
    .map((h) => `
      <li style="margin-bottom:12px;">
        <div style="font-weight:600">${escapeHtml(String(h.status || ''))}</div>
        <div style="color:#555">${escapeHtml(String(h.note || ''))}</div>
        <div style="font-size:12px;color:#888">${formatDate(h.updatedAt)}</div>
      </li>
    `)
    .join('');

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Order Update</title>
    </head>
    <body style="font-family:Arial,Helvetica,sans-serif;color:#222;background:#f7f7f7;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:20px;border-radius:6px;border:1px solid #eee;">
        <h2 style="margin-top:0">Order ${escapeHtml(String(order.orderId || ''))} — ${escapeHtml(String(order.status || ''))}</h2>
        <p>Hi ${escapeHtml(String(order.customerName || 'Customer'))},</p>
        <p>We're writing to let you know your order status has been updated.</p>

        <h3 style="margin-bottom:6px">Tracking timeline</h3>
        <ul style="list-style:none;padding:0;margin:0 0 12px 0">${timeline || '<li>No tracking entries yet</li>'}</ul>

        <p style="font-size:13px;color:#555">Tracking number: <strong>${escapeHtml(String(order.trackingNumber || 'N/A'))}</strong></p>

        <p style="font-size:12px;color:#888;margin-top:18px">If you have questions, reply to this email or contact support.</p>
      </div>
    </body>
  </html>`;
}

function formatDate(d) {
  try {
    const date = d ? new Date(d) : new Date();
    return date.toLocaleString();
  } catch (e) {
    return '';
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
