"use client";

export type CheckoutDetails = {
  eventId: number | string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  companyName?: string;
  designation?: string;
  ticketId: string;
  registrationData?: Record<string, unknown>;
};

declare global {
  interface Window {
    Razorpay: new (opts: object) => { open: () => void };
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function bookEvent(details: CheckoutDetails, eventName: string) {
  const orderResponse = await fetch(`${API_URL}/events/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  });
  
  const orderBody = await orderResponse.json();
  const order = orderBody.data;
  if (!orderResponse.ok) throw new Error(orderBody.error || "Could not create booking");

 
  if (order.free) return { bookingId: order.bookingId, free: true, approvalStatus: order.approvalStatus };
  
  if (!order.keyId) throw new Error("Payment gateway is not configured");
  if (!(await loadRazorpay()) || !window.Razorpay) {
    throw new Error("Razorpay checkout could not be loaded");
  }

  return new Promise<{ bookingId: string; free: false }>((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "StayAtlas Events",
      description: eventName,
      order_id: order.orderId,
      prefill: {
        name: details.attendeeName,
        email: details.attendeeEmail,
        contact: details.attendeePhone,
      },
      theme: { color: "#008DD2" },
      modal: { ondismiss: () => reject(new Error("Payment was cancelled by user")) },
      handler: async (response: any) => {
        try {
          const verifyResponse = await fetch(`${API_URL}/events/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: order.bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          
          const verified = await verifyResponse.json();
          if (!verifyResponse.ok || !verified.data?.verified) {
            throw new Error(verified.error || "Payment verification failed");
          }
          resolve({ bookingId: order.bookingId, free: false });
        } catch (error) {
          reject(error);
        }
      },
    });
    checkout.open();
  });
}
