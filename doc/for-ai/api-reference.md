# API Reference

**Framework**: Next.js App Router (Route Handlers)  
**Auth**: Supabase Auth (JWT)  
**Style**: RESTful

---

## Authentication

### Landlord APIs
All landlord APIs require JWT token:
```
Authorization: Bearer <access_token>
```

### Tenant APIs
Public APIs use tenant identifier:
```
X-Tenant-Identifier: <uuid>
```

### Admin APIs
Admin APIs check email against `ADMIN_EMAILS` env var:
```
Authorization: Bearer <admin_jwt_token>
```

---

## API Overview

### Tenant (Public)
```
POST   /api/public/tickets          Submit repair ticket
POST   /api/public/feedback         Submit feedback (visitor)
```

### Landlord (Authenticated)
```
GET    /api/properties              List properties
POST   /api/properties              Create property
GET    /api/properties/[id]         Get property
PUT    /api/properties/[id]         Update property
DELETE /api/properties/[id]         Delete property

GET    /api/tickets                 List tickets
GET    /api/tickets/[id]            Get ticket
PUT    /api/tickets/[id]            Update ticket
PUT    /api/tickets/[id]/close      Close ticket
PUT    /api/tickets/[id]/mark-done  Mark as done (no receipt)
PUT    /api/tickets/[id]/upload-receipt  Upload receipt
PUT    /api/tickets/[id]/archive    Archive ticket
DELETE /api/tickets/[id]            Delete ticket

POST   /api/expenses/manual         Add expense manually
POST   /api/expenses/import-csv     Bulk import expenses (CSV)

POST   /api/feedback                Submit feedback (user)
GET    /api/feedback                Get my feedback

GET    /api/dashboard/stats         Get dashboard stats
GET    /api/export/schedule-e       Export Schedule E report
```

### Admin
```
GET    /api/admin/stats             Dashboard stats
GET    /api/admin/users             List users
GET    /api/admin/users/[id]        User detail
DELETE /api/admin/users/[id]        Delete user
GET    /api/admin/properties        List properties
GET    /api/admin/tickets           List tickets
GET    /api/admin/feedback          List feedback
PUT    /api/admin/feedback/[id]     Update feedback
```

### Internal
```
POST   /api/internal/analyze-ticket   AI analyze ticket
POST   /api/internal/extract-receipt  AI extract receipt
```

---

## Detailed API Specs

### 1. Tenant: Submit Ticket

**Endpoint**: `POST /api/public/tickets`

**Request** (multipart/form-data):
```typescript
{
  property_slug: string;        // Required
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  description: string;          // Required
  photos?: File[];             // Max 5, each <10MB
  is_emergency?: boolean;
}
```

**Response**:
```json
{
  "success": true,
  "ticket_id": "uuid",
  "message": "Your request has been submitted."
}
```

---

### 2. Landlord: Create Property

**Endpoint**: `POST /api/properties`

**Request**:
```json
{
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "unit_number": "Apt 2B"
}
```

**Response**:
```json
{
  "success": true,
  "property": {
    "id": "uuid",
    "slug": "apt-2b-abc123",
    "tenant_link": "https://stoopkeep.com/r/apt-2b-abc123"
  }
}
```

---

### 3. Landlord: List Tickets

**Endpoint**: `GET /api/tickets?status=new&property_id=uuid`

**Query Params**:
- `status`: new | in_progress | pending_receipt | closed | archived
- `property_id`: UUID (optional filter)
- `page`: number (default 1)
- `limit`: number (default 20)

**Response**:
```json
{
  "tickets": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "description": "Kitchen sink leak",
      "status": "new",
      "source": "tenant_submitted",
      "expense_category": "repair_maintenance",
      "created_at": "2024-03-25T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

### 4. Landlord: Update Ticket

**Endpoint**: `PUT /api/tickets/[id]`

**Request**:
```json
{
  "landlord_notes": "Called plumber, coming tomorrow",
  "status": "in_progress"
}
```

**Response**:
```json
{
  "success": true,
  "ticket": { /* updated ticket */ }
}
```

---

### 5. Landlord: Close Ticket

**Endpoint**: `PUT /api/tickets/[id]/close`

**Request** (multipart/form-data):
```typescript
{
  final_cost: number;          // Required
  receipt_photos?: File[];     // Optional, will trigger AI OCR
  receipt_vendor_name?: string;
}
```

**Response**:
```json
{
  "success": true,
  "ticket": {
    "status": "closed",
    "final_cost": 150.00,
    "closed_at": "2024-03-25T15:00:00Z"
  },
  "ai_extracted": {
    "vendor": "Joe's Plumbing",
    "amount": 150.00
  }
}
```

---

### 6. Landlord: Manual Expense

**Endpoint**: `POST /api/expenses/manual`

**Request** (multipart/form-data):
```typescript
{
  expense_type: 'insurance' | 'property_tax' | 'repair_maintenance' | ...;
  property_id: string;
  date: string;               // YYYY-MM-DD
  description: string;
  cost: number;
  vendor_name?: string;
  notes?: string;
  receipts?: File[];
}
```

**Expense Types**:
- `repair_maintenance` (default)
- `insurance`
- `property_tax`
- `mortgage_interest`
- `utilities`
- `management_fees`
- `hoa_fees`
- `cleaning`
- `legal_professional`
- `advertising`
- `supplies`
- `travel_auto`
- `other`

**Response**:
```json
{
  "success": true,
  "expense_id": "uuid"
}
```

---

### 7. Landlord: CSV Import

**Endpoint**: `POST /api/expenses/import-csv`

**Request** (multipart/form-data):
```typescript
{
  csv_file: File;
}
```

**CSV Format**:
```csv
expense_type,date,property_address,description,cost,vendor_name,notes
repair_maintenance,2024-03-15,"123 Main St, Apt 2B","Kitchen sink",150.00,"ABC Plumbing",""
insurance,2024-01-01,"123 Main St, Apt 2B","Annual insurance",1200.00,"State Farm",""
```

**Response**:
```json
{
  "success": true,
  "imported": 45,
  "failed": 2,
  "errors": [
    { "row": 12, "error": "Property not found: '456 Fake St'" }
  ]
}
```

---

### 8. Landlord: Export Schedule E

**Endpoint**: `GET /api/export/schedule-e?year=2024`

**Response**: Excel file download

**Excel Structure**:
```
Sheet 1: Schedule E Summary
├─ Line 5  - Advertising: $200
├─ Line 9  - Insurance: $3,600
├─ Line 14 - Repairs: $18,234
├─ Line 16 - Taxes: $15,000
└─ Total: $59,894

Sheet 2-N: Property Details (one sheet per property)
```

---

### 9. Feedback: Submit (Public)

**Endpoint**: `POST /api/public/feedback`

**Request** (multipart/form-data):
```typescript
{
  email: string;              // Required
  user_name?: string;
  feedback_type: 'bug' | 'feature_request' | 'question' | 'general';
  message: string;            // Min 20 chars
  screenshots?: File[];       // Max 5, each <5MB
}
```

**Response**:
```json
{
  "success": true,
  "feedback_id": "uuid",
  "message": "Thank you for your feedback!"
}
```

---

### 10. Admin: Dashboard Stats

**Endpoint**: `GET /api/admin/stats`

**Response**:
```json
{
  "users": {
    "total": 142,
    "trial": 98,
    "paid": 38,
    "canceled": 6
  },
  "properties": {
    "total": 203
  },
  "tickets": {
    "total": 1847,
    "tenant_submitted": 1234,
    "manual_import": 613
  },
  "feedback": {
    "total": 65,
    "new": 8,
    "in_progress": 12,
    "resolved": 45
  },
  "revenue": {
    "mrr": 1140,
    "arr": 13680
  }
}
```

---

### 11. Admin: List Users

**Endpoint**: `GET /api/admin/users?status=trial&page=1`

**Response**:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "john@doe.com",
      "subscription_status": "trial",
      "trial_tickets_used": 2,
      "properties_count": 3,
      "tickets_count": 12,
      "created_at": "2024-03-20T10:00:00Z"
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

---

### 12. Admin: Update Feedback

**Endpoint**: `PUT /api/admin/feedback/[id]`

**Request**:
```json
{
  "status": "resolved",
  "admin_notes": "Fixed in version 1.2.0"
}
```

**Response**:
```json
{
  "success": true,
  "feedback": { /* updated feedback */ }
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `PROPERTY_NOT_FOUND` | 404 | Property not found |
| `TICKET_NOT_FOUND` | 404 | Ticket not found |
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | No permission |
| `FILE_TOO_LARGE` | 400 | File exceeds 10MB |
| `INVALID_STATUS` | 400 | Invalid status value |

---

## Rate Limits

- Tenant submit: 10 requests/hour/IP
- Landlord APIs: 1000 requests/hour/user
- AI analysis: 100 requests/hour

---

## Notes for AI Implementation

1. **Always validate input** using Zod schemas
2. **Use Supabase RLS** for data isolation
3. **Retry Gemini calls** 3 times if inconsistent
4. **Log all AI responses** for debugging
5. **Use transactions** for multi-step operations
6. **Handle file uploads** with proper MIME type checks
7. **Return structured errors** with clear messages

---

For detailed implementation code, refer to Next.js and Supabase documentation.
