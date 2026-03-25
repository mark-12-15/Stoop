# Component Specifications

## Shared Components

### Button
**Variants**: primary, secondary, danger, ghost  
**Sizes**: sm, md, lg  
**States**: default, hover, active, disabled, loading

### Modal
**Usage**: Feedback modal, ticket detail modal  
**Props**: isOpen, onClose, title, children

### Table
**Features**: Sortable columns, filterable, pagination  
**Usage**: Tickets list, properties list, users list

### FileUploader
**Features**: Drag & drop, multiple files, preview  
**Limits**: Max 5 files, 10MB each  
**Formats**: Images (jpg, png, webp), PDF

### StatusBadge
**Statuses**: new, in_progress, pending_receipt, closed, archived  
**Colors**: 
- new: orange
- in_progress: blue
- pending_receipt: yellow
- closed: green
- archived: gray

---

## Page Components

### TenantSubmitForm
**Location**: `/r/[slug]`  
**Fields**: description, photos, emergency flag, contact info  
**Validation**: Required description (min 10 chars)

### DashboardStats
**Location**: `/dashboard`  
**Cards**: Total tickets, active tickets, closed tickets, pending receipts

### TicketCard
**Usage**: Ticket list item  
**Shows**: Description, property, status, date, cost

### PropertyCard
**Usage**: Property list item  
**Shows**: Address, tenant link, ticket count, QR code

### FeedbackModal
**Usage**: Feedback submission  
**Fields**: feedback_type, message, screenshots, email (if not logged in)

---

## Form Validation

All forms use **Zod** schemas:

```typescript
// Example: Manual expense form
const ExpenseSchema = z.object({
  expense_type: z.enum([...]),
  property_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(10),
  cost: z.number().positive(),
  vendor_name: z.string().optional(),
});
```

---

## UI Patterns

### Loading States
- Skeleton loaders for lists
- Spinner for buttons
- Progress bar for file uploads

### Error Handling
- Toast notifications for errors
- Inline error messages for form fields
- Error boundaries for page crashes

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hide sidebar on mobile, show hamburger menu

---

For detailed implementation, use Radix UI/shadcn/ui components.
