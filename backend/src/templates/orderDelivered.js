/**
 * @param {object} order – Mongoose Order document (populate orderedItems.product with slug)
 * @param {object} user  – { name, email }
 * @returns {string}     HTML email string
 */
export const orderDeliveredTemplate = (order, user) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  // First item's product slug for review CTA
  const firstItem = order.orderedItems?.[0];
  const firstSlug =
    firstItem?.product?.slug ||          // populated
    firstItem?.slug ||                    // denormalised
    null;

  const reviewLink = firstSlug
    ? `${clientUrl}/product/${firstSlug}#reviews`
    : `${clientUrl}/shop`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Order Delivered — Savora</title></head>
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

        <!-- Delivered banner -->
        <tr>
          <td style="background:#e8f5e9;padding:20px 40px;text-align:center;border-bottom:3px solid #c9a66b;">
            <p style="margin:0;font-size:36px;">🎉</p>
            <h2 style="margin:8px 0 0;font-family:Georgia,serif;font-size:20px;color:#1e2b24;">Your order has been delivered!</h2>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 24px;">
            <p style="margin:0 0 16px;color:#5a6e5a;font-size:15px;line-height:1.6;">Hi <strong style="color:#1e2b24;">${user.name}</strong>, your Savora order <strong style="color:#1e2b24;">#${order._id?.toString().slice(-10).toUpperCase()}</strong> has been delivered. We hope you absolutely love it!</p>

            <p style="margin:0 0 28px;color:#5a6e5a;font-size:15px;line-height:1.6;">Your feedback means the world to us and helps other food lovers discover authentic flavours.</p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:#c9a66b;border-radius:50px;padding:14px 36px;text-align:center;">
                  <a href="${reviewLink}" style="font-family:Georgia,serif;font-size:15px;font-weight:700;color:#1e2b24;text-decoration:none;display:block;white-space:nowrap;">
                    ⭐ Loved it? Leave a Review
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#8a9e8a;text-align:center;font-family:Arial,sans-serif;">Or visit your <a href="${clientUrl}/dashboard" style="color:#c9a66b;text-decoration:none;">account dashboard</a> to track all your orders.</p>
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
