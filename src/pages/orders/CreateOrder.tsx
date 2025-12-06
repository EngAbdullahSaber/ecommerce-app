// pages/create-order.tsx - Fixed for Vite/React Router
"use client";
import React, { useState } from "react";
import { GenericForm, FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Package,
  DollarSign,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Define form fields for creating an order
  const orderFields: FormField[] = [
    {
      name: "orderNumber",
      label: "Order Number",
      type: "text",
      placeholder: "ORD-2024-001",
      required: true,
      icon: <Package size={18} />,
      cols: 6,
      helperText: "Auto-generated if left empty",
    },
    {
      name: "orderDate",
      label: "Order Date",
      type: "date",
      required: true,
      cols: 6,
      max: new Date().toISOString().split("T")[0],
    },

    // Customer Information Section
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

    // Payment Information
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

    // Additional Options
    {
      name: "priority",
      label: "Priority Shipping",
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

    // Shipping Method (Radio buttons example)
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
  ];

  // Default values for the form
  const defaultValues = {
    orderNumber: "",
    orderDate: new Date().toISOString().split("T")[0],
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    product: "",
    quantity: 1,
    unitPrice: 0,
    paymentMethod: "credit-card",
    status: "processing",
    priority: false,
    giftWrap: false,
    notes: "",
    shippingMethod: "standard",
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Order Data:", data);

      // Calculate total amount
      const totalAmount = data.quantity * data.unitPrice;
      console.log("Total Amount:", totalAmount);

      // Here you would typically make an API call to create the order
      // await createOrder(data);

      // Show success message and redirect
      alert("Order created successfully!");
      navigate("/orders");
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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

        <GenericForm
          title="Create New Order"
          description="Fill in the details below to create a new order"
          fields={orderFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/orders")}
          submitLabel="Create Order"
          cancelLabel="Cancel"
          isLoading={isLoading}
          mode="create"
          className="group"
        />
      </div>
    </div>
  );
}
