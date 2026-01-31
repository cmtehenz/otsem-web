# 📝 TODO List - Backend API Endpoints

## 🔴 Critical - Missing Endpoints

### 1. Health Check Endpoint
**Status**: Not Implemented
**Priority**: High
**Endpoint**: `GET /health`

**Description**: Health check endpoint for monitoring and load balancers.

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-30T10:00:00Z",
  "uptime": 123456,
  "version": "1.0.0"
}
```

---

### 2. Customer Transactions Statement
**Status**: Not Implemented
**Priority**: High
**Endpoint**: `GET /customers/:customerId/statement`

**Description**: Unified endpoint that returns all customer transactions (deposits, withdrawals, conversions).

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `startDate` (YYYY-MM-DD, optional)
- `endDate` (YYYY-MM-DD, optional)

**Expected Response**:
```json
{
  "statements": [
    {
      "transactionId": "tx_abc123",
      "type": "PIX_IN" | "PIX_OUT" | "CONVERSION",
      "status": "PENDING" | "COMPLETED" | "FAILED" | "PROCESSING",
      "amount": 150.00,
      "description": "Transaction description",
      "senderName": "John Doe",
      "recipientName": "Jane Smith",
      "createdAt": "2025-01-30T10:00:00Z",
      "usdtAmount": 25.50,
      "subType": "BUY" | "SELL",
      "externalData": {
        "walletAddress": "0x...",
        "network": "TRC20",
        "txHash": "0x..."
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### 3. PIX Transactions History
**Status**: Not Implemented
**Priority**: High
**Endpoint**: `GET /pix/transactions/account-holders/:accountHolderId`

**Description**: List all PIX transactions (incoming and outgoing) for a specific account holder.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Expected Response**:
```json
{
  "transactions": [
    {
      "transactionId": "tx_pix_abc123",
      "type": "PIX_OUT",
      "status": "COMPLETED",
      "amount": 50.00,
      "description": "Payment to Store XYZ",
      "recipientName": "Store XYZ LTDA",
      "recipientCpf": "12345678901",
      "createdAt": "2025-01-30T10:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

### 4. USDT Conversions History
**Status**: Not Implemented
**Priority**: High
**Endpoint**: `GET /wallet/conversions`

**Description**: List all USDT conversions (BUY and SELL) for the authenticated customer.

**Expected Response**:
```json
{
  "data": [
    {
      "id": "conv_abc123",
      "status": "COMPLETED" | "PENDING" | "FAILED",
      "subType": "BUY" | "SELL",
      "brlAmount": 100.00,
      "usdtAmount": 20.50,
      "network": "TRC20",
      "walletAddress": "TWx...",
      "txHash": "0x...",
      "createdAt": "2025-01-30T10:00:00Z",
      "completedAt": "2025-01-30T10:05:00Z"
    }
  ]
}
```

---

## 📌 Implementation Notes

### Frontend Status
✅ Frontend is **fully prepared** to consume these endpoints:
- Transaction page has fallback logic for missing endpoints
- Automatic detection and graceful degradation
- Debug logs for endpoint availability monitoring

### Current Behavior
- **Deposits (PIX_IN)**: ✅ Working via `/accounts/:id/summary`
- **Withdrawals (PIX_OUT)**: ❌ Returns 404
- **Conversions (USDT)**: ❌ Returns 404

### Recommended Implementation Order
1. `/health` - Quick win, essential for production
2. `/customers/:customerId/statement` - Preferred unified approach
3. Alternative: Implement `/pix/transactions/...` and `/wallet/conversions` separately

---

## 🔄 Related Files

**Frontend Implementation**:
- `/src/app/customer/transactions/page.tsx` - Main transactions page
- `/src/app/customer/dashboard/page.tsx` - Dashboard with recent transactions
- `/src/components/modals/withdraw-modal.tsx` - PIX withdrawal modal
- `/src/components/modals/convert-modal.tsx` - USDT conversion modal

**API Documentation**:
- `/API_SPEC.md` - Contains endpoint specifications

---

Last Updated: 2025-01-30
