/**
 * Generates a professional HTML email template for ShopEZ orders.
 * @param {Object} order The order document populated with user details
 * @param {Object} user User details (name, email)
 * @param {boolean} isForAdmin Flag to customize the email for admin vs customer
 * @returns {string} HTML string
 */
exports.generateOrderEmailHtml = (order, user, isForAdmin = false) => {
  const titleText = isForAdmin 
    ? `New Order Received - Order #${order._id}` 
    : `Your ShopEZ Order Confirmation - #${order._id}`;
  
  const headerGradient = isForAdmin
    ? 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)' // Admin: Dark Indigo
    : 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)'; // Customer: Royal Violet
  
  const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Calculate estimated delivery: 3 to 5 business days from order date
  const estStart = new Date(order.createdAt);
  estStart.setDate(estStart.getDate() + 3);
  const estEnd = new Date(order.createdAt);
  estEnd.setDate(estEnd.getDate() + 5);
  const estDeliveryStr = `${estStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${estEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // Product Items Rows
  const itemsHtml = order.orderItems.map(item => {
    const itemTotal = item.price * item.quantity;
    const imageUrl = item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80';
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; vertical-align: middle;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="width: 50px; padding-right: 12px;">
                <img src="${imageUrl}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" />
              </td>
              <td>
                <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block;">${item.name}</span>
                <span style="font-size: 12px; color: #64748b;">Qty: ${item.quantity} &times; $${item.price.toFixed(2)}</span>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 700; color: #1e293b; vertical-align: middle;">
          $${itemTotal.toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titleText}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        table {
          border-collapse: collapse;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #edf2f7;
        }
        .header {
          background: ${headerGradient};
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p {
          color: rgba(255, 255, 255, 0.85);
          margin: 8px 0 0 0;
          font-size: 14px;
        }
        .content {
          padding: 24px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 750;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 1px;
          margin-bottom: 12px;
          margin-top: 24px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 6px;
        }
        .grid {
          width: 100%;
          margin-bottom: 16px;
        }
        .grid td {
          padding: 8px 0;
          font-size: 14px;
          color: #334155;
        }
        .grid .label {
          color: #64748b;
          font-weight: 500;
          width: 140px;
        }
        .grid .val {
          font-weight: 600;
          color: #0f172a;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .badge-success {
          background-color: #dcfce7;
          color: #166534;
        }
        .badge-pending {
          background-color: #fef9c3;
          color: #854d0e;
        }
        .badge-processing {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .total-box {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-top: 20px;
        }
        .total-row {
          width: 100%;
        }
        .total-row td {
          padding: 4px 0;
          font-size: 14px;
          color: #475569;
        }
        .total-row .grand-total-label {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          padding-top: 8px;
        }
        .total-row .grand-total-val {
          font-size: 18px;
          font-weight: 900;
          color: #7c3aed;
          padding-top: 8px;
        }
        .notes-box {
          border-left: 4px solid #7c3aed;
          background-color: #f5f3ff;
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
          font-size: 13px;
          font-style: italic;
          color: #5b21b6;
          margin-top: 8px;
        }
        .footer {
          background-color: #f1f5f9;
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer a {
          color: #7c3aed;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f8fafc; padding: 20px 0;">
        <tr>
          <td>
            <div class="container">
              <!-- Header Section -->
              <div class="header">
                <h1>ShopEZ</h1>
                <p>${isForAdmin ? 'New order registered on the store' : 'Thank you for your order!'}</p>
              </div>

              <!-- Main Content Section -->
              <div class="content">
                
                <!-- Welcome/Intro Message -->
                ${isForAdmin 
                  ? `<p style="font-size: 15px; color: #334155; margin-top: 0; line-height: 1.5;">Hello Admin,<br />A new purchase has been confirmed. Below are the order receipt details.</p>` 
                  : `<p style="font-size: 15px; color: #334155; margin-top: 0; line-height: 1.5;">Hi <strong>${order.shippingAddress.fullName || user.name}</strong>,<br />Your order has been placed successfully and is now being processed. We will email you again when your package ships!</p>`
                }

                <!-- Estimated Delivery Banner (Customer Only) -->
                ${!isForAdmin ? `
                  <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center;">
                    <span style="font-size: 13px; color: #6d28d9; font-weight: 700; display: block; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delivery</span>
                    <span style="font-size: 18px; color: #4c1d95; font-weight: 800; display: block; margin-top: 4px;">${estDeliveryStr}</span>
                  </div>
                ` : ''}

                <!-- Order Meta Info Grid -->
                <div class="section-title">Order Overview</div>
                <table class="grid" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="label">Order ID:</td>
                    <td class="val" style="font-family: monospace; font-size: 13px;">${order._id}</td>
                  </tr>
                  <tr>
                    <td class="label">Date & Time:</td>
                    <td class="val">${orderDate}</td>
                  </tr>
                  <tr>
                    <td class="label">Payment Method:</td>
                    <td class="val">${order.paymentInfo.method}</td>
                  </tr>
                  <tr>
                    <td class="label">Payment Status:</td>
                    <td class="val">
                      <span class="badge ${order.paymentInfo.status === 'succeeded' ? 'badge-success' : 'badge-pending'}">
                        ${order.paymentInfo.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="label">Order Status:</td>
                    <td class="val">
                      <span class="badge badge-processing">${order.orderStatus}</span>
                    </td>
                  </tr>
                </table>

                <!-- Customer Details Grid -->
                <div class="section-title">Customer details</div>
                <table class="grid" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="label">Customer Name:</td>
                    <td class="val">${order.shippingAddress.fullName || user.name}</td>
                  </tr>
                  <tr>
                    <td class="label">Customer Email:</td>
                    <td class="val">${user.email}</td>
                  </tr>
                  <tr>
                    <td class="label">Mobile Number:</td>
                    <td class="val">${order.shippingAddress.phoneNumber}</td>
                  </tr>
                  <tr>
                    <td class="label" style="vertical-align: top; padding-top: 8px;">Delivery Address:</td>
                    <td class="val" style="line-height: 1.4; padding-top: 8px;">
                      ${order.shippingAddress.streetAddress},<br />
                      ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode},<br />
                      ${order.shippingAddress.country}
                    </td>
                  </tr>
                </table>

                <!-- Order Notes (if any) -->
                ${order.orderNotes ? `
                  <div class="section-title">Order Notes</div>
                  <div class="notes-box">
                    &ldquo;${order.orderNotes}&rdquo;
                  </div>
                ` : ''}

                <!-- Items Ordered Table -->
                <div class="section-title">Ordered Items</div>
                <table cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 8px;">
                  <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0;">
                      <th style="text-align: left; padding-bottom: 8px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Product</th>
                      <th style="text-align: right; padding-bottom: 8px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>

                <!-- Total Amount Breakdown Box -->
                <div class="total-box">
                  <table class="total-row" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: left;">Subtotal</td>
                      <td style="text-align: right; font-weight: 600; color: #1e293b;">$${order.itemsPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="text-align: left;">Estimated Tax (8%)</td>
                      <td style="text-align: right; font-weight: 600; color: #1e293b;">$${order.taxPrice.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="text-align: left;">Shipping Fee</td>
                      <td style="text-align: right; font-weight: 600; color: #1e293b;">
                        ${order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}
                      </td>
                    </tr>
                    <tr>
                      <td class="grand-total-label" style="text-align: left; border-top: 1px solid #e2e8f0;">Total Amount</td>
                      <td class="grand-total-val" style="text-align: right; border-top: 1px solid #e2e8f0;">$${order.totalPrice.toFixed(2)}</td>
                    </tr>
                  </table>
                </div>

              </div>

              <!-- Footer Section -->
              <div class="footer">
                <p style="margin: 0 0 12px 0;">Need help with this order? Reply directly to this email or visit our <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile">Support Center</a>.</p>
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">&copy; ${new Date().getFullYear()} ShopEZ Inc. All rights reserved.</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
