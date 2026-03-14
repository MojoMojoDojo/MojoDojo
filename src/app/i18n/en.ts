export const en = {
  nav: {
    home: 'Home',
    about: 'About',
    reviews: 'Reviews',
    contact: 'Contact',
    faq: 'FAQ',
    orderNow: 'Order Now',
    signIn: 'Sign In',
  },
  footer: {
    tagline: 'Premium desserts crafted with discipline, precision, and passion.',
    quickLinks: 'Quick Links',
    support: 'Support',
    getInTouch: 'Get in Touch',
    links: {
      about: 'About Us',
      reviews: 'Reviews',
      order: 'Order Now',
      faq: 'FAQ',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    location: 'Montreal & Laval, Quebec',
    available: 'Available for orders',
    copyright: (year: number) => `© ${year} MojoDojo. All rights reserved. Crafted with discipline.`,
  },
  home: {
    hero: {
      title: 'Premium Desserts,',
      subtitle: 'Crafted with Discipline',
      description:
        'Experience handcrafted desserts and trays made with precision, premium ingredients, and an unwavering commitment to quality. Montreal & Laval delivery.',
      cta: 'Order Now',
      ctaSecondary: 'Learn More',
    },
    why: {
      title: 'Why',
      titleAccent: 'MojoDojo',
      subtitle: 'Desserts made with discipline, precision, and care',
      cards: [
        {
          title: 'Premium Quality',
          description:
            'Only the finest ingredients make it into our desserts. No compromises, no shortcuts.',
        },
        {
          title: 'Freshly Made',
          description:
            'Every order is prepared fresh, ensuring maximum flavor and quality in every bite.',
        },
        {
          title: 'Crafted with Care',
          description:
            'Our team brings precision and passion to every dessert, treating each order like a masterpiece.',
        },
      ],
    },
    howItWorks: {
      title: 'How',
      titleAccent: 'Ordering Works',
      subtitle: 'Simple, fast, and reliable',
      steps: [
        { step: '01', title: 'Browse Menu', description: 'Explore our selection of premium desserts and trays' },
        { step: '02', title: 'Place Order', description: 'Choose your items and provide delivery details' },
        { step: '03', title: 'We Prepare', description: 'Our team crafts your order fresh to perfection' },
        { step: '04', title: 'Enjoy', description: 'Pickup or delivery — experience desserts done right' },
      ],
      cta: 'Start Your Order',
    },
  },
  about: {
    story: {
      title: 'Our',
      titleAccent: 'Story',
      p1: 'MojoDojo was born from a simple belief: desserts should be extraordinary, not ordinary. What started as a passion project has evolved into a disciplined craft, where every cheesecake, brownie, and tiramisu is made with precision and care.',
      p2: "We're not chasing trends or cutting corners. We're building something that lasts — a brand that people remember, trust, and come back to. Every batch is a statement of quality. Every order is an opportunity to prove ourselves.",
      p3: "From social media orders to a complete brand experience, MojoDojo represents ambition, consistency, and the relentless pursuit of excellence in every bite.",
    },
    values: {
      title: 'Our',
      titleAccent: 'Values',
      items: [
        { title: 'Discipline', description: 'Every product meets our exacting standards — no exceptions.' },
        { title: 'Precision', description: 'Measured ingredients, consistent technique, perfect results.' },
        { title: 'Passion', description: 'We love what we do, and it shows in every bite.' },
        { title: 'Integrity', description: 'Honest ingredients, honest pricing, honest service.' },
      ],
    },
    team: {
      title: 'Meet the',
      titleAccent: 'Team',
      description: 'The passionate people behind every MojoDojo creation.',
    },
  },
  order: {
    title: 'Select',
    titleAccent: 'Products',
    subtitle: 'Add items to your cart, then proceed to checkout',
    addToCart: 'Add to Cart',
    checkout: 'Checkout',
    deposit: {
      title: 'Deposit Required',
      description: "Orders over $100 require a $20 deposit. We'll contact you after order placement to arrange payment.",
    },
    allergens: 'Allergens / Dietary',
    proceedToCheckout: 'Proceed to Checkout',
    items: (n: number) => `${n} item${n !== 1 ? 's' : ''}`,
  },
  checkout: {
    title: 'Check',
    titleAccent: 'out',
    subtitle: 'Review your order and complete your details',
    backToProducts: 'Back to Products',
    yourDetails: 'Your Details',
    name: 'Full Name',
    phone: 'Phone',
    email: 'Email',
    delivery: 'Delivery',
    pickup: 'Pickup',
    deliveryAddress: 'Delivery Address',
    preferredDateTime: 'Preferred Date / Time',
    paymentMethod: 'Payment Method',
    cash: 'Cash on Delivery',
    online: 'Online Payment',
    instructions: 'Special Instructions',
    instructionsPlaceholder: 'Any allergies or special requests...',
    placeOrder: 'Place Order',
    placingOrder: 'Placing Order…',
    depositNote: "We'll contact you to arrange the $20 deposit payment before fulfillment.",
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    total: 'Total',
    emptyCart: 'Your cart is empty',
    emptyCartSub: 'Add some products before checking out.',
    browseProducts: 'Browse Products',
    success: {
      title: 'Order Placed!',
      message: "Thank you! We'll confirm your order details shortly via email or phone.",
      depositNote: "A $20 deposit is required for orders over $100. We'll contact you with payment details.",
      returnHome: 'Return to Home',
    },
  },
  common: {
    required: 'required',
    learnMore: 'Learn More',
    contactUs: 'Contact Us',
  },
};

export type Translations = typeof en;
