/**
 * @param {object} order – Mongoose Order document
 * @param {object} user  – { name, email }
 * @returns {string}     HTML email string
 */
export const orderShippedTemplate = (order, user) => {
  const itemsList = (order.orderedItems || [])
    .map(
      (item) => `<li style="padding:6px 0;font-size:14px;color:#2d4a35;font-family:Arial,sans-serif;">${item.name || item.title || 'Product'} &times; ${item.quantity}</li>`
    )
    .join('');

  const estimatedDelivery = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Your Savora Order is Shipped!</title></head>
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

        <!-- Shipping icon banner -->
        <tr>
          <td style="background:#e8f5e9;padding:20px 40px;text-align:center;border-bottom:3px solid #c9a66b;">
            <p style="margin:0;font-size:28px;">🚚</p>
            <h2 style="margin:8px 0 0;font-family:Georgia,serif;font-size:20px;color:#1e2b24;">Your order is on the way!</h2>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 24px;">
            <p style="margin:0 0 24px;color:#5a6e5a;font-size:15px;line-height:1.6;">Hi <strong style="color:#1e2b24;">${user.name}</strong>, great news! Your Savora order has been shipped and is heading your way.</p>

            <!-- Order Meta -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f3ec;border-radius:10px;padding:16px 20px;margin-bottom:28px;">
              <tr>
                <td style="font-size:13px;color:#5a6e5a;font-family:Arial,sans-serif;">Order ID</td>
                <td align="right" style="font-size:13px;font-weight:700;color:#1e2b24;font-family:Arial,sans-serif;">#${order._id?.toString().slice(-10).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#5a6e5a;font-family:Arial,sans-serif;padding-top:6px;">Tracking ID</td>
                <td align="right" style="font-size:13px;color:#1e2b24;font-family:Arial,sans-serif;padding-top:6px;font-weight:600;">${order.trackingId || 'Tracking info will be updated soon'}</td>
              </tr>
              ${estimatedDelivery ? `<tr>
                <td style="font-size:13px;color:#5a6e5a;font-family:Arial,sans-serif;padding-top:6px;">Estimated Delivery</td>
                <td align="right" style="font-size:13px;color:#2d7a4a;font-family:Arial,sans-serif;padding-top:6px;font-weight:600;">${estimatedDelivery}</td>
              </tr>` : ''}
            </table>

            <!-- Items brief -->
            <h3 style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;color:#1e2b24;">Items in this shipment:</h3>
            <ul style="margin:0;padding-left:18px;list-style:disc;">${itemsList}</ul>

            <p style="margin:28px 0 0;font-size:14px;color:#5a6e5a;line-height:1.6;">You can track your order in real time from your <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="color:#c9a66b;text-decoration:none;font-weight:600;">dashboard</a>.</p>
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
