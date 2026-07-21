ALTER TABLE "EventBooking"
  ADD COLUMN "paymentAmountPaise" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "razorpayOrderId" TEXT,
  ADD COLUMN "registrationData" JSONB;

CREATE UNIQUE INDEX "EventBooking_razorpayOrderId_key"
  ON "EventBooking"("razorpayOrderId");

ALTER TABLE "EventTicket"
  ADD COLUMN "requiresApproval" BOOLEAN NOT NULL DEFAULT false;
