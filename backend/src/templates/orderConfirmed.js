const formatPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

/**
 * @param {object} order  – Mongoose Order document
 * @param {object} user   – { name, email }
 * @returns {string}      HTML email string
 */
export const orderConfirmedTemplate = (order, user) => {
  const itemRows = (order.orderedItems || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #f0e6d3;font-family:Georgia,serif;color:#2d4a35;font-size:14px;">${item.name || item.title || 'Product'}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0e6d3;text-align:center;font-family:Arial,sans-serif;color:#5a6e5a;font-size:14px;">${item.quantity}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0e6d3;text-align:right;font-family:Arial,sans-serif;color:#5a6e5a;font-size:14px;">${formatPrice(item.price)}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f0e6d3;text-align:right;font-family:Arial,sans-serif;color:#2d4a35;font-weight:600;font-size:14px;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const addr = order.shippingAddress || {};
  const addressBlock = [addr.street, addr.city, addr.state, addr.pincode, addr.country]
    .filter(Boolean)
    .join(', ');

  const subtotal = (order.orderedItems || []).reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = order.shippingCharge || 0;
  const discount = order.couponDiscount || 0;
  const total = order.totalAmount || 0;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Order Confirmed — Savora</title></head>
<body style="margin:0;padding:0;background:#f9f3ec;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f3ec;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1e2b24;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;color:#c9a66b;letter-spacing:4px;text-transform:uppercase;">SAVORA</h1>
            <p style="margin:8px 0 0;color:#a0b4a0;font-size:12px;letter-spacing:2px;">ARTISAN INDIAN FOOD</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 24px;">
            <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:22px;color:#1e2b24;">Order Confirmed ✓</h2>
            <p style="margin:0 0 24px;color:#5a6e5a;font-size:15px;line-height:1.6;">Thank you for your order, <strong style="color:#1e2b24;">${user.name}</strong>! We're preparing it with love. You'll receive a shipping notification once it's on its way.</p>

            <!-- Order Meta -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f3ec;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <tr>
                <td style="font-size:13px;color:#5a6e5a;font-family:Arial,sans-serif;">Order ID</td>
                <td align="right" style="font-size:13px;font-weight:700;color:#1e2b24;font-family:Arial,sans-serif;">#${order._id?.toString().slice(-10).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#5a6e5a;font-family:Arial,sans-serif;padding-top:6px;">Date</td>
                <td align="right" style="font-size:13px;color:#1e2b24;font-family:Arial,sans-serif;padding-top:6px;">${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#5a6e5a;font-family:Arial,sans-serif;padding-top:6px;">Payment</td>
                <td align="right" style="font-size:13px;color:#1e2b24;font-family:Arial,sans-serif;padding-top:6px;">${order.paymentMethod} · ${order.paymentStatus}</td>
              </tr>
            </table>

            <!-- Items Table -->
            <h3 style="margin:0 0 12px;font-family:Georgia,serif;font-size:16px;color:#1e2b24;">Items Ordered</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead>
                <tr style="background:#f9f3ec;">
                  <th style="padding:10px 8px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#5a6e5a;text-transform:uppercase;letter-spacing:1px;">Product</th>
                  <th style="padding:10px 8px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#5a6e5a;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                  <th style="padding:10px 8px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#5a6e5a;text-transform:uppercase;letter-spacing:1px;">Unit</th>
                  <th style="padding:10px 8px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#5a6e5a;text-transform:uppercase;letter-spacing:1px;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <!-- Price Summary -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:2px solid #f0e6d3;padding-top:16px;">
              <tr>
                <td style="padding:4px 0;font-size:14px;color:#5a6e5a;font-family:Arial,sans-serif;">Subtotal</td>
                <td align="right" style="padding:4px 0;font-size:14px;color:#1e2b24;font-family:Arial,sans-serif;">${formatPrice(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-size:14px;color:#5a6e5a;font-family:Arial,sans-serif;">Shipping</td>
                <td align="right" style="padding:4px 0;font-size:14px;color:${shipping === 0 ? '#2d7a4a' : '#1e2b24'};font-family:Arial,sans-serif;">${shipping === 0 ? 'FREE' : formatPrice(shipping)}</td>
              </tr>
              ${discount > 0 ? `<tr>
                <td style="padding:4px 0;font-size:14px;color:#5a6e5a;font-family:Arial,sans-serif;">Coupon Discount</td>
                <td align="right" style="padding:4px 0;font-size:14px;color:#2d7a4a;font-family:Arial,sans-serif;">-${formatPrice(discount)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px 0 0;font-size:17px;font-weight:700;color:#1e2b24;font-family:Georgia,serif;border-top:2px solid #c9a66b;margin-top:8px;">Grand Total</td>
                <td align="right" style="padding:12px 0 0;font-size:17px;font-weight:700;color:#c9a66b;font-family:Georgia,serif;border-top:2px solid #c9a66b;">${formatPrice(total)}</td>
              </tr>
            </table>

            <!-- Shipping Address -->
            ${addressBlock ? `<div style="margin-top:28px;background:#f9f3ec;border-radius:10px;padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#5a6e5a;font-family:Arial,sans-serif;">Shipping To</p>
              <p style="margin:0;font-size:14px;color:#1e2b24;font-family:Arial,sans-serif;line-height:1.7;">${addressBlock}</p>
            </div>` : ''}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e2b24;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#a0b4a0;font-family:Arial,sans-serif;">Questions? Email us at <a href="mailto:support@savora.in" style="color:#c9a66b;text-decoration:none;">support@savora.in</a></p>
            <p style="margin:0;font-size:11px;color:#4a5e4a;font-family:Arial,sans-serif;">© ${new Date().getFullYear()} Savora. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};
