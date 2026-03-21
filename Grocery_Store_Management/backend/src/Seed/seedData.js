/**
 * SEED DATA FILE
 * ─────────────────────────────────────────────────────────────────
 * This is your equivalent of the SSMS tables in .NET
 *
 * HOW TO ADD A NEW PARENT MENU:
 *   1. Add an object to the parentMenus array below
 *   2. Run: npm run seed
 *
 * HOW TO ADD A NEW MENU under a parent:
 *   1. Find the parentMenuCode that this menu belongs to
 *   2. Add an object to the menus array with that parentMenuCode
 *   3. Run: npm run seed
 *
 * HOW TO ADD A NEW SCREEN under a menu:
 *   1. Find the menuCode that this screen belongs to
 *   2. Add an object to the screens array with that menuCode
 *   3. Run: npm run seed
 *   4. That screen is now available to assign in role permissions
 * ─────────────────────────────────────────────────────────────────
 */

const parentMenus = [
  {
    name: 'Administration',
    code: 'ADMINISTRATION',
    icon: 'settings',
    order: 1,
    isSuperAdminOnly: true, // only super admin sees this section
  },
  {
    name: 'Supplier Management',
    code: 'SUPPLIER_MANAGEMENT',
    icon: 'users',
    order: 2,
    isSuperAdminOnly: false,
  },
  {
    name: 'Tender Management',
    code: 'TENDER_MANAGEMENT',
    icon: 'file-text',
    order: 3,
    isSuperAdminOnly: false,
  },
  {
    name: 'Quotation Management',
    code: 'QUOTATION_MANAGEMENT',
    icon: 'receipt',
    order: 4,
    isSuperAdminOnly: false,
  },
  {
    name: 'Inventory',
    code: 'INVENTORY',
    icon: 'package',
    order: 5,
    isSuperAdminOnly: false,
  },
  {
    name: 'Inventory & Grocery',
    code: 'INVENTORY_GROCERY',
    icon: 'shopping-basket',
    order: 8,
    isSuperAdminOnly: false,
  },
  {
    name: 'Storefront',
    code: 'STOREFRONT',
    icon: 'shopping-cart',
    order: 6,
    isSuperAdminOnly: false,
  },
  {
    name: 'Payment Logs',
    code: 'PAYMENT_LOGS',
    icon: 'dollar-sign',
    order: 7,
    isSuperAdminOnly: false,
  },
];

// ─── MENUS ────────────────────────────────────────────────────────
// parentMenuCode must match a code in the parentMenus array above

const menus = [
  // ── Administration ──
  {
    name: 'User Management',
    code: 'USER_MANAGEMENT',
    parentMenuCode: 'ADMINISTRATION',
    icon: 'user-cog',
    order: 1,
  },
  {
    name: 'Module Management',
    code: 'MODULE_MANAGEMENT',
    parentMenuCode: 'ADMINISTRATION',
    icon: 'layout',
    order: 2,
  },

  // ── Supplier Management ──
  {
    name: 'Suppliers',
    code: 'SUPPLIERS',
    parentMenuCode: 'SUPPLIER_MANAGEMENT',
    icon: 'truck',
    order: 1,
  },
  {
    name: 'Categories',
    code: 'CATEGORIES',
    parentMenuCode: 'SUPPLIER_MANAGEMENT',
    icon: 'tag',
    order: 2,
  },

  // ── Tender Management ──
  {
    name: 'Tenders',
    code: 'TENDERS',
    parentMenuCode: 'TENDER_MANAGEMENT',
    icon: 'clipboard',
    order: 1,
  },
  {
    name: 'Bids',
    code: 'BIDS',
    parentMenuCode: 'TENDER_MANAGEMENT',
    icon: 'trending-up',
    order: 2,
  },

  // ── Quotation Management ──
  {
    name: 'Quotations',
    code: 'QUOTATIONS',
    parentMenuCode: 'QUOTATION_MANAGEMENT',
    icon: 'file-invoice',
    order: 1,
  },

  // ── Inventory ──
  {
    name: 'Products',
    code: 'PRODUCTS',
    parentMenuCode: 'INVENTORY',
    icon: 'box',
    order: 1,
  },
  {
    name: 'Stock Management',
    code: 'STOCK_MANAGEMENT',
    parentMenuCode: 'INVENTORY',
    icon: 'layers',
    order: 2,
  },

  // ── Storefront ──
  {
    name: 'Listings',
    code: 'LISTINGS',
    parentMenuCode: 'STOREFRONT',
    icon: 'store',
    order: 1,
  },

  // ── Inventory & Grocery ──
  {
    name: 'Grocery Management',
    code: 'GROCERY_MANAGEMENT',
    parentMenuCode: 'INVENTORY_GROCERY',
    icon: 'shopping-basket',
    order: 1,
  },
  {
    name: 'Inventory Management',
    code: 'INVENTORY_MANAGEMENT',
    parentMenuCode: 'INVENTORY_GROCERY',
    icon: 'package',
    order: 2,
  },

  // ── Payment Logs ──
  {
    name: 'Transactions',
    code: 'TRANSACTIONS',
    parentMenuCode: 'PAYMENT_LOGS',
    icon: 'credit-card',
    order: 1,
  },
];

// ─── SCREENS ──────────────────────────────────────────────────────
// menuCode must match a code in the menus array above
// route is the frontend React route for this screen
// code (SCREEN_*) is used for permission checks in middleware

const screens = [
  // ── User Management ──
  {
    name: 'Users',
    code: 'SCREEN_USERS',
    menuCode: 'USER_MANAGEMENT',
    route: '/admin/users',
    description: 'View, create, edit and deactivate system users',
    order: 1,
  },
  {
    name: 'Roles',
    code: 'SCREEN_ROLES',
    menuCode: 'USER_MANAGEMENT',
    route: '/admin/roles',
    description: 'View, create and manage roles and their permissions',
    order: 2,
  },

  // ── Module Management ──
  {
    name: 'Parent Menus',
    code: 'SCREEN_PARENT_MENUS',
    menuCode: 'MODULE_MANAGEMENT',
    route: '/admin/parent-menus',
    description: 'Manage top-level sidebar sections',
    order: 1,
  },
  {
    name: 'Menus',
    code: 'SCREEN_MENUS',
    menuCode: 'MODULE_MANAGEMENT',
    route: '/admin/menus',
    description: 'Manage menus within each sidebar section',
    order: 2,
  },
  {
    name: 'Screens',
    code: 'SCREEN_SCREENS',
    menuCode: 'MODULE_MANAGEMENT',
    route: '/admin/screens',
    description: 'Manage individual screens within menus',
    order: 3,
  },

  // ── Suppliers ──
  {
    name: 'All Suppliers',
    code: 'SCREEN_SUPPLIERS',
    menuCode: 'SUPPLIERS',
    route: '/suppliers',
    description: 'View and manage all registered suppliers',
    order: 1,
  },
  {
    name: 'Verify Suppliers',
    code: 'SCREEN_SUPPLIER_VERIFY',
    menuCode: 'SUPPLIERS',
    route: '/suppliers/verify',
    description: 'Approve or reject pending supplier registrations',
    order: 2,
  },

  // ── Categories ──
  {
    name: 'Categories',
    code: 'SCREEN_CATEGORIES',
    menuCode: 'CATEGORIES',
    route: '/categories',
    description: 'Manage grocery product categories',
    order: 1,
  },

  // ── Tenders ──
  {
    name: 'All Tenders',
    code: 'SCREEN_TENDERS',
    menuCode: 'TENDERS',
    route: '/tenders',
    description: 'View and manage all tenders',
    order: 1,
  },
  {
    name: 'Create Tender',
    code: 'SCREEN_TENDERS_CREATE',
    menuCode: 'TENDERS',
    route: '/tenders/create',
    description: 'Create a new tender call for suppliers',
    order: 2,
  },

  // ── Bids ──
  {
    name: 'All Bids',
    code: 'SCREEN_BIDS',
    menuCode: 'BIDS',
    route: '/bids',
    description: 'View and compare supplier bids',
    order: 1,
  },

  // ── Quotations ──
  {
    name: 'All Quotations',
    code: 'SCREEN_QUOTATIONS',
    menuCode: 'QUOTATIONS',
    route: '/quotations',
    description: 'View and manage quotations sent to suppliers',
    order: 1,
  },

  // ── Products ──
  {
    name: 'All Products',
    code: 'SCREEN_PRODUCTS',
    menuCode: 'PRODUCTS',
    route: '/products',
    description: 'View and manage the grocery product catalog',
    order: 1,
  },

  // ── Stock Management ──
  {
    name: 'Stock Levels',
    code: 'SCREEN_STOCK_LEVELS',
    menuCode: 'STOCK_MANAGEMENT',
    route: '/inventory/levels',
    description: 'Set and monitor min/max/reorder stock levels',
    order: 1,
  },
  {
    name: 'Stock Receipts',
    code: 'SCREEN_STOCK_RECEIPTS',
    menuCode: 'STOCK_MANAGEMENT',
    route: '/inventory/receipts',
    description: 'Record and confirm incoming stock deliveries',
    order: 2,
  },
  {
    name: 'Stock Alerts',
    code: 'SCREEN_STOCK_ALERTS',
    menuCode: 'STOCK_MANAGEMENT',
    route: '/inventory/alerts',
    description: 'View low stock, critical and overstock alerts',
    order: 3,
  },

  // ── Storefront ──
  {
    name: 'Manage Listings',
    code: 'SCREEN_STOREFRONT',
    menuCode: 'LISTINGS',
    route: '/storefront',
    description: 'Select and publish products to the customer view',
    order: 1,
  },

  // ── Transactions ──
  {
    name: 'All Transactions',
    code: 'SCREEN_TRANSACTIONS',
    menuCode: 'TRANSACTIONS',
    route: '/transactions',
    description: 'View all payment transaction logs',
    order: 1,
  },

  // ── Grocery Management ──
  {
    name: 'My Grocery Items',
    code: 'SCREEN_GROCERY_ITEMS',
    menuCode: 'GROCERY_MANAGEMENT',
    route: '/my-grocery-items',
    description: 'Supplier: manage grocery items and send to admin',
    order: 1,
  },
  {
    name: 'My Submissions',
    code: 'SCREEN_MY_SUBMISSIONS',
    menuCode: 'GROCERY_MANAGEMENT',
    route: '/my-submissions',
    description: 'Supplier: track submission history and status',
    order: 2,
  },
  {
    name: 'Grocery Submissions',
    code: 'SCREEN_GROCERY_SUBMISSIONS',
    menuCode: 'GROCERY_MANAGEMENT',
    route: '/grocery-submissions',
    description: 'Admin: review, accept or reject supplier submissions',
    order: 3,
  },

  // ── Inventory Management ──
  {
    name: 'Inventory',
    code: 'SCREEN_INVENTORY',
    menuCode: 'INVENTORY_MANAGEMENT',
    route: '/inventory',
    description: 'Admin: manage stock levels, set min/max/reorder and alert suppliers',
    order: 1,
  },
];

module.exports = { parentMenus, menus, screens };
