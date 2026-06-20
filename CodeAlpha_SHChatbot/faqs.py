"""
faqs.py
-------
Step 1 (Task requirement): Collect FAQs related to a topic/product.

Topic chosen: An Online Store (e-commerce) — orders, shipping, returns,
payments, and account management.

Each entry is a dict with:
  - "question": the canonical FAQ question
  - "answer":   the answer to show the user

Feel free to edit / extend this list with your own product's FAQs —
the rest of the chatbot code does not need to change.
"""

FAQS = [
    {
        "question": "How can I track my order?",
        "answer": "You can track your order by logging into your account and "
                   "going to 'My Orders'. Click on the order you want to track "
                   "to see real-time shipping status. You'll also receive a "
                   "tracking link via email once your order ships."
    },
    {
        "question": "What is your return policy?",
        "answer": "We offer a 30-day return policy from the date of delivery. "
                   "Items must be unused, in their original packaging, with "
                   "tags attached. Refunds are processed within 5-7 business "
                   "days after we receive the returned item."
    },
    {
        "question": "How do I cancel my order?",
        "answer": "You can cancel your order within 1 hour of placing it by "
                   "going to 'My Orders' and clicking 'Cancel Order'. After "
                   "that window, please contact customer support, as the order "
                   "may already be processing."
    },
    {
        "question": "What payment methods do you accept? What cards do you take?",
        "answer": "We accept credit/debit cards (Visa, MasterCard, American "
                   "Express), PayPal, UPI, net banking, and popular digital "
                   "wallets like Google Pay and Apple Pay."
    },
    {
        "question": "How long does shipping take?",
        "answer": "Standard shipping takes 3-5 business days. Express shipping "
                   "takes 1-2 business days. International orders typically "
                   "take 7-14 business days depending on the destination."
    },
    {
        "question": "Do you offer free shipping?",
        "answer": "Yes! We offer free standard shipping on all orders over "
                   "$50. Orders below that threshold have a flat shipping fee "
                   "of $4.99."
    },
    {
        "question": "How do I reset my account password?",
        "answer": "Click 'Forgot Password' on the login page and enter your "
                   "registered email address. We'll send you a link to reset "
                   "your password. The link expires in 24 hours."
    },
    {
        "question": "Can I change my shipping address after placing an order?",
        "answer": "You can change your shipping address within 1 hour of "
                   "placing the order by contacting customer support. Once "
                   "the order has shipped, the address cannot be changed."
    },
    {
        "question": "Is it safe to use my credit card on your site?",
        "answer": "Yes, your payment information is fully encrypted using "
                   "industry-standard SSL technology. We are PCI-DSS "
                   "compliant and never store your full card details on our "
                   "servers."
    },
    {
        "question": "Do you ship internationally?",
        "answer": "Yes, we ship to over 50 countries worldwide. Shipping "
                   "costs and delivery times vary by destination and are "
                   "calculated at checkout."
    },
    {
        "question": "How do I apply a discount or promo code?",
        "answer": "Enter your promo code in the 'Promo Code' field on the "
                   "checkout page and click 'Apply'. The discount will be "
                   "reflected in your order total immediately."
    },
    {
        "question": "What should I do if I received a damaged or wrong item?",
        "answer": "We're sorry for the inconvenience! Please contact our "
                   "support team within 48 hours of delivery with photos of "
                   "the item. We'll arrange a free replacement or full "
                   "refund."
    },
    {
        "question": "How do I contact customer support?",
        "answer": "You can reach our customer support team via live chat on "
                   "our website, email at support@onlinestore.com, or by "
                   "calling our helpline at 1-800-555-0199, available 9 AM-9 "
                   "PM daily."
    },
    {
        "question": "Do you have a loyalty or rewards program?",
        "answer": "Yes! Our Rewards Club lets you earn points on every "
                   "purchase, which can be redeemed for discounts on future "
                   "orders. Sign up for free from your account dashboard."
    },
    {
        "question": "Can I get an invoice for my purchase?",
        "answer": "Yes, an invoice is automatically emailed to you after "
                   "purchase. You can also download it anytime from 'My "
                   "Orders' under the specific order details."
    },
]
