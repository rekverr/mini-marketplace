CREATE TABLE "CheckoutRequest" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CheckoutRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CheckoutRequest_orderId_key" ON "CheckoutRequest"("orderId");
CREATE UNIQUE INDEX "CheckoutRequest_userId_key_key" ON "CheckoutRequest"("userId", "key");
CREATE INDEX "CheckoutRequest_createdAt_idx" ON "CheckoutRequest"("createdAt");
ALTER TABLE "CheckoutRequest" ADD CONSTRAINT "CheckoutRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CheckoutRequest" ADD CONSTRAINT "CheckoutRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "RefreshToken_userId_revokedAt_idx" ON "RefreshToken"("userId", "revokedAt");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_price_idx" ON "Product"("price");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
