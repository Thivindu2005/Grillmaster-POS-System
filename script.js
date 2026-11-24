// ===========================================
// GrillMaster POS - script.js
// ===========================================


// ---------- 1. DEFAULT DATA ----------
// This data is used the first time the app opens.
// After that everything is saved in localStorage.

const defaultProducts = [
  { id: 1,  name: 'Classic Burger',  price: 1450, category: 'burgers',  icon: '🍔', stock: 50 },
  { id: 2,  name: 'Cheese Burger',   price: 1650, category: 'burgers',  icon: '🧀', stock: 45 },
  { id: 3,  name: 'Double Beef',     price: 2250, category: 'burgers',  icon: '🥩', stock: 30 },
  { id: 4,  name: 'Chicken Burger',  price: 1550, category: 'burgers',  icon: '🍗', stock: 40 },
  { id: 5,  name: 'Veggie Burger',   price: 1350, category: 'burgers',  icon: '🥬', stock: 25 },
  { id: 6,  name: 'French Fries',    price: 650,  category: 'fries',    icon: '🍟', stock: 120 },
  { id: 7,  name: 'Cheesy Fries',    price: 850,  category: 'fries',    icon: '🧇', stock: 80 },
  { id: 8,  name: 'Onion Rings',     price: 750,  category: 'fries',    icon: '🧅', stock: 70 },
  { id: 9,  name: 'Cola',            price: 250,  category: 'drinks',   icon: '🥤', stock: 150 },
  { id: 10, name: 'Orange Juice',    price: 450,  category: 'drinks',   icon: '🍊', stock: 90 },
  { id: 11, name: 'Water',           price: 150,  category: 'drinks',   icon: '💧', stock: 200 },
  { id: 12, name: 'Milkshake',       price: 750,  category: 'drinks',   icon: '🥛', stock: 60 },
  { id: 13, name: 'Ice Cream',       price: 550,  category: 'desserts', icon: '🍦', stock: 55 },
  { id: 14, name: 'Cookie',          price: 300,  category: 'desserts', icon: '🍪', stock: 100 },
  { id: 15, name: 'Apple Pie',       price: 600,  category: 'desserts', icon: '🥧', stock: 35 }
];

const defaultCustomers = [
  { id: 1, name: 'John Doe',   phone: '555-0101', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', phone: '555-0102', email: 'jane@example.com' }
];

const defaultSettings = {
  shopName: 'GrillMaster POS',
  shopAddress: '123 Main Street, City, State 12345',
  shopPhone: '(555) 123-4567',
  shopEmail: 'info@grillmaster.com',
  taxRate: 10
};


// ---------- 2. APP STATE ----------

let products  = loadData('gm_products',  defaultProducts);
let customers = loadData('gm_customers', defaultCustomers);
let orders    = loadData('gm_orders',    []);
let settings  = loadData('gm_settings',  defaultSettings);

let cart = [];                  // items in the current order
let currentCategory = 'all';    // selected category filter
let lastTotals = null;          // totals saved when payment opens


// ---------- 3. LOCAL STORAGE HELPERS ----------

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Could not save data', error);
  }
}


// ---------- 4. SMALL UTILITY FUNCTIONS ----------

// show a number as Sri Lankan rupees, e.g. 1450 -> Rs. 1,450.00
function money(amount) {
  return 'Rs. ' + Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// stops user text from breaking our HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// make a new id that is bigger than every existing id
function nextId(list) {
  let max = 0;
  list.forEach(function (item) {
    if (item.id > max) max = item.id;
  });
  return max + 1;
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}


// ---------- 15. START THE APP ----------

function init() {
  document.getElementById('headerShopName').textContent = settings.shopName;
}

init();
