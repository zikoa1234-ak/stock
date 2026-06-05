"# StockFlow - Modern Inventory Management Platform

A complete, production-ready stock management web application built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

### Authentication & Authorization
- Email/password authentication with Firebase Auth
- Role-based access control (Admin, Manager, Staff, Viewer)
- Protected routes with role-based navigation
- User profile management
- Forgot password flow

### User & Admin Management
- Admin dashboard for user management
- Create users with specific roles
- Assign and modify user roles
- Activate/deactivate user accounts
- Role-based permission system

### Inventory Management
- Full CRUD for stock items
- Fields: name, SKU, category, quantity, min stock, unit price, supplier, storage location, barcode/QR, notes
- Categories management with color coding
- Search, filter, sort, and pagination
- Low-stock and out-of-stock alerts with badges
- Auto SKU generation
- CSV export

### Stock Movement Tracking
- Stock In / Stock Out / Adjustments
- Movement history with audit trail
- Per-item movement history
- Quantity validation and atomic updates

### Dashboard & Analytics
- KPI cards: total items, stock quantity, low stock, out of stock, users, activity
- Stock In vs Stock Out bar chart (30 days)
- Category distribution pie chart
- Top moved items chart
- Recent activity feed
- Real-time data with auto-refresh

### UI/UX
- Modern, premium SaaS-style interface
- Responsive design (mobile + desktop)
- Dark mode support
- Smooth animations with Framer Motion
- Clean cards, tables, filters, modals, drawers
- Loading, empty, and error states
- Custom scrollbars and transitions

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack Query
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Firebase Auth + Cloud Firestore
- **Deployment:** Netlify-ready

## Project Structure

```
stock-management-app/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── forms/           # Form components
│   │   │   ├── ItemForm.tsx
│   │   │   └── MovementForm.tsx
│   │   ├── charts/          # Chart components
│   │   └── drawers/         # Drawer components
│   ├── hooks/               # Custom React hooks (TanStack Query)
│   │   ├── useItems.ts
│   │   ├── useCategories.ts
│   │   ├── useMovements.ts
│   │   ├── useUsers.ts
│   │   └── useStats.ts
│   ├── services/            # Firebase service layer
│   │   ├── auth.ts
│   │   ├── inventory.ts
│   │   ├── categories.ts
│   │   ├── movements.ts
│   │   ├── activity.ts
│   │   └── stats.ts
│   ├── store/               # Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── movements/
│   │   ├── users/
│   │   ├── categories/
│   │   ├── reports/
│   │   └── settings/
│   ├── lib/                 # Library config & utilities
│   │   ├── firebase.ts
│   │   ├── utils.ts
│   │   └── permissions.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── firestore.rules          # Firestore Security Rules
├── firestore.indexes.json   # Firestore indexes
├── firebase.json            # Firebase config
├── netlify.toml             # Netlify deployment config
├── .env.example             # Environment variables template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Firebase account with a project created
- Git (for version control)

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** > **Sign-in method** > **Email/Password**
4. Create **Cloud Firestore** database (start in test mode, then apply rules)
5. Register a **Web App** in Project Settings to get Firebase config

### 3. Local Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd stock-management-app

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your Firebase config
# VITE_FIREBASE_API_KEY=your-api-key
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your-project-id
# VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
# VITE_FIREBASE_APP_ID=your-app-id

# Start development server
npm run dev
```

### 4. Firestore Security Rules

Copy the contents of `firestore.rules` to your Firebase project:
1. Go to Firestore > Rules
2. Paste the rules from `firestore.rules`
3. Publish

### 5. Firestore Indexes

Deploy indexes using Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:indexes
```

Or manually create indexes in Firebase Console based on `firestore.indexes.json`.

### 6. Initial Admin User

After deploying:
1. Sign up through the app (first user will be created as 'staff')
2. In Firebase Console > Firestore > users collection, change the first user's role to 'admin'
3. Re-login to get admin access
4. Now you can create other users from the admin panel

## Deployment to Netlify

### 1. Build Configuration

The app is ready for Netlify deployment with the included `netlify.toml`.

### 2. Environment Variables

In Netlify Dashboard > Site settings > Environment variables, add:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**IMPORTANT:** Set these BEFORE the first build, or trigger a new build after adding them.

### 3. Firebase Authorized Domains

1. Go to Firebase Console > Authentication > Settings
2. Under **Authorized domains**, add your Netlify domain (e.g., `your-site.netlify.app`)
3. Also add any custom domain you configure

### 4. Deploy Steps

1. Push your code to GitHub/GitLab
2. In Netlify: New site > Import from Git
3. Select repository
4. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy

### 5. SPA Redirect

The `netlify.toml` includes proper SPA redirect rules to handle client-side routing.

## Security Architecture

### Role-Based Access Control (RBAC)

The system implements a three-layer security approach:

1. **Frontend UI Layer:** Role-based navigation and action buttons
2. **Firestore Security Rules:** Database-level enforcement
3. **Service Layer:** Authentication checks before operations

### Role Permissions

| Feature | Admin | Manager | Staff | Viewer |
|---------|-------|---------|-------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Items | ✅ | ✅ | ✅ | ✅ |
| Create Items | ✅ | ✅ | ✅ | ❌ |
| Edit Items | ✅ | ✅ | ✅ | ❌ |
| Delete Items | ✅ | ❌ | ❌ | ❌ |
| View Movements | ✅ | ✅ | ✅ | ✅ |
| Create Movements | ✅ | ✅ | ✅ | ❌ |
| Manage Categories | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Export Reports | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | Read-only | ❌ | ❌ |

### Firestore Security Rules

The `firestore.rules` file implements:
- User data access restrictions (users can only read/edit their own profile)
- Admin-only write access for user management
- Role-based item/category CRUD
- Immutable audit trails for movements and activity logs
- Active user validation (deactivated users cannot access data)

### Custom Claims (Advanced)

For production environments with large user bases, Firebase Custom Claims provide a more scalable solution. To implement:

1. Create a Cloud Function that sets custom claims:
```typescript
// Firebase Cloud Function
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Verify caller is admin
  const callerUid = context.auth?.uid;
  const callerDoc = await admin.firestore().doc(`users/${callerUid}`).get();
  if (callerDoc.data()?.role !== 'admin') throw new functions.https.HttpsError('permission-denied', 'Admins only');

  // Set custom claim
  await admin.auth().setCustomUserClaims(data.uid, { role: data.role });
  // Also update Firestore
  await admin.firestore().doc(`users/${data.uid}`).update({ role: data.role, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
});
```

2. Use in Security Rules:
```
function getUserRole() {
  return request.auth.token.role;
}
```

This is recommended for production but requires Firebase Blaze plan (pay-as-you-go) for Cloud Functions.

## Audit Trail

All important actions are logged to the `activityLogs` collection:
- Item creation, updates, deletions
- User role changes
- Stock movements
- Category changes

These logs are immutable in the database rules (no delete/update allowed) and readable only by admin/manager roles.

## CSV Export

The inventory page includes a CSV export button that downloads all visible items as a CSV file.

## Barcode/QR Support

Items have a `barcode` field for storing barcode or QR code data. This is ready for integration with barcode scanning libraries.

## Testing

```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
```

## License

MIT"