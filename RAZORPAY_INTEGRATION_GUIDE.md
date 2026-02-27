# Razorpay Integration Guide: Heavenly Case Study

This guide provides a step-by-step walkthrough of how Razorpay is integrated into the **Heavenly** project. You can follow these steps to implement a similar payment system in any Node.js/Express application.

---

## 1. Prerequisites

1.  **Razorpay Account:** Sign up at [Razorpay](https://razorpay.com/).
2.  **API Keys:** Generate your `Key ID` and `Key Secret` from the Razorpay Dashboard (Settings > API Keys). Use "Test Mode" for development.
3.  **Dependencies:** Install the Razorpay SDK and Crypto (standard Node module):
    ```bash
    npm install razorpay
    ```

---

## 2. Environment Setup

Store your sensitive credentials in a `.env` file. Never hardcode these in your source code.

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

In your `app.js`, make these keys available to your views:

```javascript
// app.js
app.use((req, res, next) => {
    res.locals.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    next();
});
```

---

## 3. Backend Implementation

### A. Initialization
Import and initialize the Razorpay instance.

```javascript
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
```

### B. Create Order Route
When a user clicks "Book Now", your backend must create an "Order" in Razorpay's system.

```javascript
module.exports.bookListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        // Amount must be in the smallest currency unit (e.g., paise for INR)
        const amount = Math.round(listing.price * 100); 

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        razorpay.orders.create(options, (err, order) => {
            if (err) return res.status(500).json({ error: "Order creation failed" });
            res.json(order); // Send order details to frontend
        });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
```

### C. Verify Payment Route
Crucial for security. After payment, Razorpay returns a signature that you MUST verify on your server.

```javascript
module.exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
        // Payment is authentic
        res.json({ status: "success" });
    } else {
        // Security risk! Potential tampering
        res.status(400).json({ status: "failure", error: "Invalid signature" });
    }
};
```

---

## 4. Frontend Implementation

### A. Include Razorpay Script
Add this to your HTML/EJS file before your custom scripts:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### B. Handle the Payment Click
The logic follows these 4 steps:
1.  **Request Order:** Fetch the Order ID from your backend.
2.  **Configure Options:** Set up the Razorpay UI (colors, notes, prefill data).
3.  **Handle Success:** Define a `handler` callback to send the payment details back to your backend for verification.
4.  **Open Modal:** Trigger `rzp.open()`.

```javascript
document.getElementById('rzp-button').onclick = async function (e) {
    // 1. Get Order details from Backend
    const response = await fetch(`/listings/${listingId}/book`);
    const order = await response.json();

    // 2. Configure Razorpay Options
    const options = {
        key: "<%= razorpayKeyId %>", // Passed from res.locals
        amount: order.amount,
        currency: order.currency,
        name: "Heavenly",
        description: "Booking Payment",
        order_id: order.id,
        handler: async function (response) {
            // 3. This runs after user pays successfully
            const verifyRes = await fetch(`/listings/${listingId}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response) // Sends order_id, payment_id, signature
            });
            const verifyData = await verifyRes.json();
            if (verifyData.status === "success") {
                window.location.href = "/success-page";
            }
        },
        prefill: {
            name: "User Name",
            email: "user@example.com"
        },
        theme: { color: "#3399cc" }
    };

    // 4. Open the Razorpay Modal
    const rzp = new Razorpay(options);
    rzp.open();
};
```

---

## 5. Security Checklist

*   [ ] **Never** trust the amount sent from the frontend. Always calculate/fetch the price on the backend.
*   [ ] **Always** verify the `razorpay_signature` using HMAC SHA256 before confirming the order in your database.
*   [ ] **Use Webhooks** (Optional but recommended) for handling cases where the user's internet disconnects after payment but before the verification script runs.
