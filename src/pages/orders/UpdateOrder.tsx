"use client";
import { useParams, useNavigate } from "react-router-dom";
import {
  GenericUpdateForm,
  FormField,
} from "../../components/shared/GenericUpdateForm";
import {
  User,
  Mail,
  Phone,
  Package,
  DollarSign,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { z } from "zod";

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
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  priority: boolean;
  giftWrap: boolean;
  shippingMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Mock API - Fetch Order Data
const fetchOrderById = async (id: string | number): Promise<Order> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock data - replace with actual API call
  return {
    id: Number(id),
    orderNumber: `#ORD-2024-00${id}`,
    orderDate: "2024-10-28",
    customerName: "Lindsey Curtis",
    customerEmail: "lindsey.c@email.com",
    customerPhone: "+1 (555) 123-4567",
    customerAddress: "123 Main St, New York, NY 10001",
    product: "headphones",
    quantity: 2,
    unitPrice: 199.0,
    totalAmount: 398.0,
    paymentMethod: "credit-card",
    status: "processing",
    priority: true,
    giftWrap: false,
    shippingMethod: "express",
    notes: "Please deliver between 9 AM - 5 PM",
    createdAt: "2024-10-28T10:30:00Z",
    updatedAt: "2024-10-28T10:30:00Z",
  };
};

// Mock API - Update Order
const updateOrder = async (id: string | number, data: any): Promise<void> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("Updating order:", id, data);

  // Here you would make actual API call
  // await axios.put(`/api/orders/${id}`, data);

  // Simulate random error for testing (remove in production)
  if (Math.random() > 0.8) {
    throw new Error("Network error occurred");
  }
};

export default function UpdateOrderPage() {
  const params = useParams();
  const navigate = useNavigate();
  const orderId = params.id as string;

  // Define form fields for updating order
  const orderFields: FormField[] = [
    // Read-only fields
    {
      name: "orderNumber",
      label: "Order Number",
      type: "text",
      readOnly: true,
      icon: <Package size={18} />,
      cols: 4,
      helperText: "Auto-generated, cannot be changed",
    },
    {
      name: "orderDate",
      label: "Order Date",
      type: "date",
      readOnly: true,
      cols: 4,
      helperText: "Original order date",
    },
    {
      name: "createdAt",
      label: "Created At",
      type: "text",
      readOnly: true,
      cols: 4,
      helperText: "First created timestamp",
    },

    // Customer Information (Editable)
    {
      name: "customerName",
      label: "Customer Name",
      type: "text",
      placeholder: "John Doe",
      required: true,
      icon: <User size={18} />,
      cols: 6,
    },
    {
      name: "customerEmail",
      label: "Customer Email",
      type: "email",
      placeholder: "john.doe@example.com",
      required: true,
      icon: <Mail size={18} />,
      cols: 6,
    },
    {
      name: "customerPhone",
      label: "Customer Phone",
      type: "text",
      placeholder: "+1 (555) 123-4567",
      required: false,
      icon: <Phone size={18} />,
      cols: 6,
      validation: z
        .string()
        .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number")
        .optional(),
    },
    {
      name: "customerAddress",
      label: "Shipping Address",
      type: "textarea",
      placeholder: "123 Main St, City, State, ZIP",
      required: true,
      rows: 3,
      cols: 6,
    },

    // Product Information
    {
      name: "product",
      label: "Product",
      type: "select",
      required: true,
      cols: 6,
      options: [
        { label: "Premium Wireless Headphones", value: "headphones" },
        { label: "Smart Watch Series 8", value: "smartwatch" },
        { label: "Laptop Stand & Keyboard", value: "laptop-accessories" },
        { label: "4K Webcam Pro", value: "webcam" },
        { label: "Ergonomic Office Chair", value: "office-chair" },
        { label: "Mechanical Keyboard RGB", value: "keyboard" },
      ],
    },
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      placeholder: "1",
      required: true,
      min: 1,
      max: 100,
      cols: 3,
    },
    {
      name: "unitPrice",
      label: "Unit Price",
      type: "number",
      placeholder: "0.00",
      required: true,
      min: 0,
      icon: <DollarSign size={18} />,
      cols: 3,
      validation: z.number().min(0.01, "Price must be greater than 0"),
    },

    // Payment & Status
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      required: true,
      cols: 6,
      icon: <CreditCard size={18} />,
      options: [
        { label: "Credit Card", value: "credit-card" },
        { label: "PayPal", value: "paypal" },
        { label: "Apple Pay", value: "apple-pay" },
        { label: "Google Pay", value: "google-pay" },
        { label: "Bank Transfer", value: "bank-transfer" },
      ],
    },
    {
      name: "status",
      label: "Order Status",
      type: "select",
      required: true,
      cols: 6,
      options: [
        { label: "Processing", value: "processing" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },

    // Shipping Method (Radio)
    {
      name: "shippingMethod",
      label: "Shipping Method",
      type: "radio",
      required: true,
      cols: 12,
      options: [
        { label: "Standard Shipping (5-7 days) - Free", value: "standard" },
        { label: "Express Shipping (2-3 days) - $15", value: "express" },
        { label: "Overnight Shipping (1 day) - $35", value: "overnight" },
      ],
    },

    // Additional Options
    {
      name: "priority",
      label: "Priority Order",
      type: "checkbox",
      cols: 6,
    },
    {
      name: "giftWrap",
      label: "Gift Wrap",
      type: "checkbox",
      cols: 6,
    },

    // Notes
    {
      name: "notes",
      label: "Order Notes",
      type: "textarea",
      placeholder: "Add any special instructions or notes...",
      required: false,
      rows: 4,
      cols: 12,
      helperText: "Internal notes (not visible to customer)",
    },
  ];

  const handleUpdate = async (id: string | number, data: any) => {
    // Calculate total before submitting
    const totalAmount = data.quantity * data.unitPrice;
    const updateData = {
      ...data,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };

    await updateOrder(id, updateData);
  };

  const handleAfterSuccess = () => {
    // Show success message
    console.log("Order updated successfully!");

    // Redirect after delay
    setTimeout(() => {
      navigate("/orders");
    }, 1500);
  };

  const handleAfterError = (error: any) => {
    // Show error message
    console.error("Update failed:", error);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Order Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            The order ID is missing or invalid.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>

        <GenericUpdateForm
          title={`Update Order #${orderId}`}
          description="Edit order details and save changes"
          fields={orderFields}
          entityId={orderId}
          fetchData={fetchOrderById}
          onUpdate={handleUpdate}
          onCancel={() => navigate("/orders")}
          onBack={() => navigate("/orders")}
          submitLabel="Save Changes"
          cancelLabel="Cancel"
          showBackButton={true}
          className="mb-8"
          afterSuccess={handleAfterSuccess}
          afterError={handleAfterError}
          beforeSubmit={(data) => {
            // Transform data before submission if needed
            return {
              ...data,
              totalAmount: data.quantity * data.unitPrice,
            };
          }}
        />
      </div>
    </div>
  );
}
