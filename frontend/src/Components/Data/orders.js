const orders = [
  {
    id: "HM10291",
    date: "02 Jul 2026",
    status: "Delivered",
    total: 2499,

    customer: {
      name: "Reethika",
      phone: "9876543210",
      address:
        "12/45, Lakshmi Nagar, Coimbatore, Tamil Nadu - 641018",
    },

    payment: {
      method: "Google Pay",
      transaction: "UPI123456789012",
      status: "Paid",
    },

    courier: {
      partner: "Delhivery",
      tracking: "14925678912345",
    },

    items: [
      {
        id: 1,
        image: "/products/tshirt.jpg",
        name: "Oversized Premium T-Shirt",
        color: "Black",
        size: "XL",
        qty: 2,
        price: 799,
      },
      {
        id: 2,
        image: "/products/jeans.jpg",
        name: "Slim Fit Jeans",
        color: "Blue",
        size: "32",
        qty: 1,
        price: 1699,
      },
    ],
  },

  {
    id: "HM10292",
    date: "25 Jun 2026",
    status: "Processing",
    total: 1899,

    customer: {
      name: "Reethika",
      phone: "9876543210",
      address:
        "12/45, Lakshmi Nagar, Coimbatore, Tamil Nadu - 641018",
    },

    payment: {
      method: "Credit Card",
      transaction: "CARD987654321",
      status: "Paid",
    },

    courier: {
      partner: "Blue Dart",
      tracking: "987654321234",
    },

    items: [
      {
        id: 1,
        image: "/products/shirt.jpg",
        name: "Formal White Shirt",
        color: "White",
        size: "L",
        qty: 1,
        price: 1899,
      },
    ],
  },
];

export default orders;