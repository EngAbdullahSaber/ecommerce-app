// pages/view-order/[id].tsx - Complete View Order Example
"use client";
import { GenericView, ViewSection } from "../../components/shared/GenericView";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  DollarSign,
  CreditCard,
  Truck,
  Calendar,
  Clock,
  FileText,
  Tag,
  ShoppingBag,
  Gift,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Order Interface
interface Order {
  id: number;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  product: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  priority: boolean;
  giftWrap: boolean;
  shippingMethod: string;
  trackingNumber?: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

// Mock API - Fetch Order Data
const fetchOrderById = async (id: string | number): Promise<Order> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    id: Number(id),
    orderNumber: "#ORD-2024-001",
    orderDate: "2024-10-28",
    customerName: "Lindsey Curtis",
    customerEmail: "lindsey.c@email.com",
    customerPhone: "+1 (555) 123-4567",
    customerAddress: "123 Main St, Apt 4B, New York, NY 10001, United States",
    product: "Premium Wireless Headphones",
    productCategory: "Electronics",
    quantity: 2,
    unitPrice: 199.0,
    subtotal: 398.0,
    tax: 39.8,
    shippingCost: 15.0,
    totalAmount: 452.8,
    paymentMethod: "Credit Card",
    status: "Delivered",
    priority: true,
    giftWrap: false,
    shippingMethod: "Express Shipping (2-3 days)",
    trackingNumber: "1Z999AA10123456784",
    notes:
      "Please deliver between 9 AM - 5 PM. Leave at front desk if not home.",
    tags: ["vip", "repeat-customer", "express"],
    createdAt: "2024-10-28T10:30:00Z",
    updatedAt: "2024-10-30T14:45:00Z",
    estimatedDelivery: "2024-10-31",
  };
};

export default function ViewOrderPage() {
  const router = useNavigate();
  const orderId = useParams().id as string;

  // Define sections for the view
  const orderSections: ViewSection[] = [
    {
      title: "Order Information",
      description: "Basic order details and identification",
      columns: 3,
      fields: [
        {
          name: "orderNumber",
          label: "Order Number",
          type: "text",
          icon: <Package size={16} />,
          copyable: true,
        },
        {
          name: "orderDate",
          label: "Order Date",
          type: "date",
          icon: <Calendar size={16} />,
        },
        {
          name: "status",
          label: "Status",
          type: "badge",
          icon: <Tag size={16} />,
          badge: {
            success: ["Delivered"],
            warning: ["Processing", "Shipped"],
            error: ["Cancelled"],
            info: ["Pending"],
          },
        },
        {
          name: "estimatedDelivery",
          label: "Estimated Delivery",
          type: "date",
          icon: <Truck size={16} />,
          hide: (data) => data.status === "Cancelled",
        },
        {
          name: "priority",
          label: "Priority Order",
          type: "boolean",
          icon: <Zap size={16} />,
        },
        {
          name: "giftWrap",
          label: "Gift Wrap",
          type: "boolean",
          icon: <Gift size={16} />,
        },
      ],
    },
    {
      title: "Customer Information",
      description: "Details about the customer",
      columns: 2,
      fields: [
        {
          name: "customerName",
          label: "Full Name",
          type: "text",
          icon: <User size={16} />,
          copyable: true,
        },
        {
          name: "customerEmail",
          label: "Email Address",
          type: "email",
          icon: <Mail size={16} />,
          copyable: true,
        },
        {
          name: "customerPhone",
          label: "Phone Number",
          type: "phone",
          icon: <Phone size={16} />,
          copyable: true,
        },
        {
          name: "customerAddress",
          label: "Shipping Address",
          type: "text",
          icon: <MapPin size={16} />,
          copyable: true,
        },
      ],
    },
    {
      title: "Product Details",
      description: "Information about ordered items",
      columns: 2,
      fields: [
        {
          name: "product",
          label: "Product Name",
          type: "text",
          icon: <ShoppingBag size={16} />,
        },
        {
          name: "productCategory",
          label: "Category",
          type: "text",
          icon: <Tag size={16} />,
        },
        {
          name: "quantity",
          label: "Quantity",
          type: "number",
          icon: <Package size={16} />,
        },
        {
          name: "unitPrice",
          label: "Unit Price",
          type: "currency",
          icon: <DollarSign size={16} />,
        },
      ],
    },
    {
      title: "Payment & Pricing",
      description: "Financial details and breakdown",
      columns: 2,
      fields: [
        {
          name: "subtotal",
          label: "Subtotal",
          type: "currency",
        },
        {
          name: "tax",
          label: "Tax",
          type: "currency",
        },
        {
          name: "shippingCost",
          label: "Shipping Cost",
          type: "currency",
        },
        {
          name: "totalAmount",
          label: "Total Amount",
          type: "currency",
          render: (value) => (
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold text-xl shadow-lg">
              ${value.toFixed(2)}
            </div>
          ),
        },
        {
          name: "paymentMethod",
          label: "Payment Method",
          type: "text",
          icon: <CreditCard size={16} />,
        },
      ],
    },
    {
      title: "Shipping Information",
      description: "Delivery and tracking details",
      columns: 2,
      collapsible: true,
      defaultExpanded: true,
      fields: [
        {
          name: "shippingMethod",
          label: "Shipping Method",
          type: "text",
          icon: <Truck size={16} />,
        },
        {
          name: "trackingNumber",
          label: "Tracking Number",
          type: "link",
          icon: <Package size={16} />,
          copyable: true,
          linkTo: (value) => `https://tracking.example.com/${value}`,
        },
      ],
    },
    {
      title: "Additional Information",
      description: "Notes and metadata",
      columns: 1,
      collapsible: true,
      defaultExpanded: false,
      fields: [
        {
          name: "notes",
          label: "Order Notes",
          type: "text",
          icon: <FileText size={16} />,
        },
        {
          name: "tags",
          label: "Tags",
          type: "list",
          icon: <Tag size={16} />,
        },
        {
          name: "createdAt",
          label: "Created At",
          type: "datetime",
          icon: <Clock size={16} />,
        },
        {
          name: "updatedAt",
          label: "Last Updated",
          type: "datetime",
          icon: <Clock size={16} />,
        },
      ],
    },
  ];

  // const handleEdit = (id: string | number) => {
  //   router(`/orders/edit/${id}`);
  // };

  // const handleDelete = (id: string | number) => {
  //   if (confirm("Are you sure you want to delete this order?")) {
  //     console.log("Deleting order:", id);
  //     router("/orders");
  //   }
  // };

  // const handleDownload = (data: Order) => {
  //   const dataStr = JSON.stringify(data, null, 2);
  //   const dataBlob = new Blob([dataStr], { type: "application/json" });
  //   const url = URL.createObjectURL(dataBlob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = `order-${data.orderNumber}.json`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };

  // Custom Header Component
  const headerComponent = (
    <div className="flex items-center gap-2 mt-3">
      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
        VIP Customer
      </span>
      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
        Express Delivery
      </span>
      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
        Repeat Customer
      </span>
    </div>
  );

  // Custom Footer Component
  const footerComponent = (
    <div className="text-center text-sm text-slate-600 dark:text-slate-400">
      <p>Need help with this order? Contact support at support@example.com</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <GenericView
          title={`Order Details`}
          subtitle={`Viewing order #${orderId}`}
          entityId={orderId}
          fetchData={fetchOrderById}
          sections={orderSections}
          onBack={() => router("/orders")}
          onEdit={() => console.log("orders")}
          onDelete={() => console.log("orders")}
          onDownload={() => console.log("orders")}
          onShare={() => console.log("orders")}
          showActions={true}
          headerComponent={headerComponent}
          footerComponent={footerComponent}
        />
      </div>
    </div>
  );
}
