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


// ---------- 5. PRODUCT GRID ----------

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const searchText = document.getElementById('searchInput').value.toLowerCase().trim();

  // filter by category and search text
  const filtered = products.filter(function (product) {
    const matchCategory = currentCategory === 'all' || product.category === currentCategory;
    const matchSearch = product.name.toLowerCase().includes(searchText);
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-text">No products found</div>';
    return;
  }

  let html = '';
  filtered.forEach(function (product) {
    const outClass = product.stock <= 0 ? 'out-of-stock' : '';
    html += `
      <div class="product-card ${outClass}" onclick="addToCart(${product.id})">
        <div class="product-icon">${escapeHtml(product.icon)}</div>
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-price">${money(product.price)}</div>
        <div class="product-stock">Stock: ${product.stock}</div>
      </div>
    `;
  });
  grid.innerHTML = html;
}

// category buttons
document.getElementById('categories').addEventListener('click', function (event) {
  const button = event.target.closest('.category-btn');
  if (!button) return;

  document.querySelectorAll('.category-btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  button.classList.add('active');

  currentCategory = button.dataset.category;
  renderProducts();
});


// ---------- 6. CART ----------

function addToCart(productId) {
  const product = products.find(function (p) { return p.id === productId; });
  if (!product) return;

  if (product.stock <= 0) {
    alert('Product out of stock!');
    return;
  }

  const existing = cart.find(function (item) { return item.id === productId; });

  if (existing) {
    // do not allow more than what we have in stock
    if (existing.quantity >= product.stock) {
      alert('Only ' + product.stock + ' left in stock!');
      return;
    }
    existing.quantity++;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  renderCart();
}

function changeQuantity(productId, change) {
  const item = cart.find(function (i) { return i.id === productId; });
  const product = products.find(function (p) { return p.id === productId; });
  if (!item || !product) return;

  const newQty = item.quantity + change;

  if (newQty > product.stock) {
    alert('Only ' + product.stock + ' left in stock!');
    return;
  }

  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = newQty;
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(function (item) { return item.id !== productId; });
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;
  if (confirm('Clear all items from the cart?')) {
    cart = [];
    renderCart();
  }
}

// work out subtotal, tax and total
function calculateTotals() {
  let subtotal = 0;

  cart.forEach(function (item) {
    const product = products.find(function (p) { return p.id === item.id; });
    if (product) subtotal += product.price * item.quantity;
  });

  const tax = subtotal * (settings.taxRate / 100);
  const total = subtotal + tax;

  return { subtotal: subtotal, tax: tax, total: total };
}

function renderCart() {
  const container = document.getElementById('cartItems');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-icon">🛒</div>
        <div>Cart is empty</div>
        <div>Add items to get started</div>
      </div>
    `;
  } else {
    let html = '';
    cart.forEach(function (item) {
      const product = products.find(function (p) { return p.id === item.id; });
      if (!product) return;

      html += `
        <div class="cart-item">
          <div>
            <div class="cart-item-name">${escapeHtml(product.icon)} ${escapeHtml(product.name)}</div>
            <div class="cart-item-price">${money(product.price)} each</div>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQuantity(${product.id}, -1)">−</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
            <button class="qty-btn remove" onclick="removeFromCart(${product.id})">×</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  const totals = calculateTotals();
  document.getElementById('subtotal').textContent = money(totals.subtotal);
  document.getElementById('tax').textContent = money(totals.tax);
  document.getElementById('total').textContent = money(totals.total);
  document.getElementById('taxLabel').textContent = 'Tax (' + settings.taxRate + '%):';

  // the checkout button only works when the cart has items
  document.getElementById('checkoutBtn').disabled = cart.length === 0;
}


// ---------- 7. CUSTOMER DROPDOWN (on the cart) ----------

function renderCustomerSelect() {
  const select = document.getElementById('customerSelect');
  const oldValue = select.value;

  let html = '<option value="0">Walk-in Customer</option>';
  customers.forEach(function (customer) {
    html += `<option value="${customer.id}">${escapeHtml(customer.name)}</option>`;
  });
  select.innerHTML = html;

  // keep the old selection if that customer still exists
  if (oldValue && select.querySelector('option[value="' + oldValue + '"]')) {
    select.value = oldValue;
  }
}


// ---------- 8. PAYMENT & CHECKOUT ----------

function openPayment() {
  if (cart.length === 0) return;

  lastTotals = calculateTotals();
  document.getElementById('paymentDue').textContent = money(lastTotals.total);
  document.getElementById('paymentMethod').value = 'Cash';
  document.getElementById('amountReceived').value = '';
  document.getElementById('changeAmount').value = money(0);
  document.getElementById('cashFields').style.display = 'block';

  openModal('paymentModal');
}

// show or hide the cash fields when the method changes
document.getElementById('paymentMethod').addEventListener('change', function () {
  const isCash = this.value === 'Cash';
  document.getElementById('cashFields').style.display = isCash ? 'block' : 'none';
});

// calculate change while the cashier types
document.getElementById('amountReceived').addEventListener('input', function () {
  const received = parseFloat(this.value) || 0;
  const change = received - lastTotals.total;
  document.getElementById('changeAmount').value = change > 0 ? money(change) : money(0);
});

function completePayment() {
  const method = document.getElementById('paymentMethod').value;
  let received = lastTotals.total;
  let change = 0;

  if (method === 'Cash') {
    received = parseFloat(document.getElementById('amountReceived').value) || 0;

    if (received < lastTotals.total) {
      alert('Amount received is less than the total!');
      return;
    }
    change = received - lastTotals.total;
  }

  // find the selected customer
  const customerId = parseInt(document.getElementById('customerSelect').value);
  const customer = customers.find(function (c) { return c.id === customerId; });

  // build the order items (we copy name and price so old orders never change)
  const orderItems = cart.map(function (item) {
    const product = products.find(function (p) { return p.id === item.id; });
    return {
      productId: product.id,
      name: product.name,
      icon: product.icon,
      price: product.price,
      quantity: item.quantity
    };
  });

  const order = {
    id: nextId(orders),
    date: new Date().toISOString(),
    customerId: customer ? customer.id : 0,
    customerName: customer ? customer.name : 'Walk-in',
    items: orderItems,
    subtotal: lastTotals.subtotal,
    tax: lastTotals.tax,
    total: lastTotals.total,
    paymentMethod: method,
    received: received,
    change: change,
    status: 'Completed'
  };

  // reduce the stock of every sold product
  cart.forEach(function (item) {
    const product = products.find(function (p) { return p.id === item.id; });
    product.stock -= item.quantity;
  });

  orders.unshift(order);   // newest order first

  saveData('gm_orders', orders);
  saveData('gm_products', products);

  // reset the screen
  cart = [];
  closeModal('paymentModal');
  renderCart();
  renderProducts();
  showReceipt(order);
}


// ---------- 9. RECEIPT ----------

function showReceipt(order) {
  let itemsHtml = '';
  order.items.forEach(function (item) {
    itemsHtml += `
      <div class="receipt-row">
        <div>
          ${escapeHtml(item.name)}<br />
          <small>${item.quantity} × ${money(item.price)}</small>
        </div>
        <div>${money(item.price * item.quantity)}</div>
      </div>
    `;
  });

  let paymentHtml = `
    <div class="receipt-row"><span>Payment Method:</span><span>${escapeHtml(order.paymentMethod)}</span></div>
  `;

  if (order.paymentMethod === 'Cash') {
    paymentHtml += `
      <div class="receipt-row"><span>Amount Received:</span><span>${money(order.received)}</span></div>
      <div class="receipt-row"><span>Change:</span><span>${money(order.change)}</span></div>
    `;
  }

  document.getElementById('receiptContent').innerHTML = `
    <div class="receipt-head">
      <h3>${escapeHtml(settings.shopName)}</h3>
      <p>${escapeHtml(settings.shopAddress)}</p>
      <p>${escapeHtml(settings.shopPhone)}</p>
      <p>${escapeHtml(settings.shopEmail)}</p>
      <p>${new Date(order.date).toLocaleString()}</p>
      <p>Order #${order.id} | Customer: ${escapeHtml(order.customerName)}</p>
    </div>

    ${itemsHtml}

    <div class="receipt-row"><span>Subtotal:</span><span>${money(order.subtotal)}</span></div>
    <div class="receipt-row"><span>Tax (${settings.taxRate}%):</span><span>${money(order.tax)}</span></div>
    <div class="receipt-row total"><span>Total:</span><span>${money(order.total)}</span></div>

    ${paymentHtml}

    <div class="receipt-foot">
      Thank you for your business!<br />
      Visit us again!
    </div>
  `;

  openModal('receiptModal');
}


// ---------- 10. ORDERS (Read, Update status, Delete) ----------

function showOrders() {
  renderOrders();
  openModal('ordersModal');
}

function renderOrders() {
  const list = document.getElementById('ordersList');

  if (orders.length === 0) {
    list.innerHTML = '<div class="empty-text">No orders yet. Complete a checkout to see it here.</div>';
    return;
  }

  let html = '';
  orders.forEach(function (order) {
    // short text like "Burger (2), Fries (1)"
    const summary = order.items.map(function (item) {
      return escapeHtml(item.name) + ' (' + item.quantity + ')';
    }).join(', ');

    html += `
      <div class="list-item">
        <div class="list-info">
          <div class="list-title">Order #${order.id}</div>
          <div class="list-sub">${new Date(order.date).toLocaleString()} | Customer: ${escapeHtml(order.customerName)}</div>
          <div class="list-sub">${summary}</div>
        </div>
        <div class="list-side">
          <span class="order-total">${money(order.total)}</span>
          <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
            ${statusOption(order.status, 'Completed')}
            ${statusOption(order.status, 'Refunded')}
            ${statusOption(order.status, 'Cancelled')}
          </select>
          <button class="btn btn-view" onclick="viewOrder(${order.id})">Receipt</button>
          <button class="btn btn-delete" onclick="deleteOrder(${order.id})">Delete</button>
        </div>
      </div>
    `;
  });
  list.innerHTML = html;
}

function statusOption(current, value) {
  const selected = current === value ? 'selected' : '';
  return `<option value="${value}" ${selected}>${value}</option>`;
}

function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(function (o) { return o.id === orderId; });
  if (!order) return;

  order.status = newStatus;
  saveData('gm_orders', orders);
}

function viewOrder(orderId) {
  const order = orders.find(function (o) { return o.id === orderId; });
  if (order) showReceipt(order);
}

function deleteOrder(orderId) {
  if (!confirm('Are you sure you want to delete this order?')) return;

  orders = orders.filter(function (o) { return o.id !== orderId; });
  saveData('gm_orders', orders);
  renderOrders();
}


// ---------- 11. PRODUCTS CRUD ----------

function showProducts() {
  renderProductsList();
  openModal('productsModal');
}

function renderProductsList() {
  const list = document.getElementById('productsList');

  if (products.length === 0) {
    list.innerHTML = '<div class="empty-text">No products yet. Add your first product.</div>';
    return;
  }

  let html = '';
  products.forEach(function (product) {
    const lowClass = product.stock <= 10 ? 'low' : '';
    html += `
      <div class="list-item">
        <div class="list-info">
          <div class="list-title">${escapeHtml(product.icon)} ${escapeHtml(product.name)}</div>
          <div class="list-sub">${money(product.price)} | ${escapeHtml(product.category)}</div>
        </div>
        <div class="list-side">
          <span class="stock-badge ${lowClass}">${product.stock} units</span>
          <button class="btn btn-edit" onclick="openProductForm(${product.id})">✏️ Edit</button>
          <button class="btn btn-delete" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
        </div>
      </div>
    `;
  });
  list.innerHTML = html;
}

// opens the form empty (add) or filled (edit)
function openProductForm(productId) {
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('productId').value = '';
  document.getElementById('productFormTitle').textContent = 'Add New Product';

  if (productId) {
    const product = products.find(function (p) { return p.id === productId; });
    if (product) {
      document.getElementById('productFormTitle').textContent = 'Edit Product';
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productCategory').value = product.category;
      document.getElementById('productIcon').value = product.icon;
      document.getElementById('productStock').value = product.stock;
    }
  }

  openModal('productFormModal');
}

document.getElementById('productForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const id = document.getElementById('productId').value;

  const data = {
    name: document.getElementById('productName').value.trim(),
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value,
    icon: document.getElementById('productIcon').value.trim(),
    stock: parseInt(document.getElementById('productStock').value)
  };

  if (id) {
    // UPDATE an existing product
    const product = products.find(function (p) { return p.id === parseInt(id); });
    Object.assign(product, data);
  } else {
    // CREATE a new product
    data.id = nextId(products);
    products.push(data);
  }

  saveData('gm_products', products);
  closeModal('productFormModal');
  renderProductsList();
  renderProducts();
  renderCart();   // cart may show old name or price
});

function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  products = products.filter(function (p) { return p.id !== productId; });
  cart = cart.filter(function (item) { return item.id !== productId; });

  saveData('gm_products', products);
  renderProductsList();
  renderProducts();
  renderCart();
}


// ---------- 12. CUSTOMERS CRUD ----------

function showCustomers() {
  renderCustomersList();
  openModal('customersModal');
}

function renderCustomersList() {
  const list = document.getElementById('customersList');

  if (customers.length === 0) {
    list.innerHTML = '<div class="empty-text">No customers yet. Add your first customer.</div>';
    return;
  }

  let html = '';
  customers.forEach(function (customer) {
    // count how many orders this customer has
    const orderCount = orders.filter(function (o) { return o.customerId === customer.id; }).length;

    html += `
      <div class="list-item">
        <div class="list-info">
          <div class="list-title">👤 ${escapeHtml(customer.name)}</div>
          <div class="list-sub">${escapeHtml(customer.phone || 'No phone')} | ${escapeHtml(customer.email || 'No email')}</div>
          <div class="list-sub">${orderCount} order(s)</div>
        </div>
        <div class="list-side">
          <button class="btn btn-edit" onclick="openCustomerForm(${customer.id})">✏️ Edit</button>
          <button class="btn btn-delete" onclick="deleteCustomer(${customer.id})">🗑️ Delete</button>
        </div>
      </div>
    `;
  });
  list.innerHTML = html;
}

function openCustomerForm(customerId) {
  document.getElementById('customerForm').reset();
  document.getElementById('customerId').value = '';
  document.getElementById('customerFormTitle').textContent = 'Add New Customer';

  if (customerId) {
    const customer = customers.find(function (c) { return c.id === customerId; });
    if (customer) {
      document.getElementById('customerFormTitle').textContent = 'Edit Customer';
      document.getElementById('customerId').value = customer.id;
      document.getElementById('customerName').value = customer.name;
      document.getElementById('customerPhone').value = customer.phone;
      document.getElementById('customerEmail').value = customer.email;
    }
  }

  openModal('customerFormModal');
}

document.getElementById('customerForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const id = document.getElementById('customerId').value;

  const data = {
    name: document.getElementById('customerName').value.trim(),
    phone: document.getElementById('customerPhone').value.trim(),
    email: document.getElementById('customerEmail').value.trim()
  };

  if (id) {
    // UPDATE
    const customer = customers.find(function (c) { return c.id === parseInt(id); });
    Object.assign(customer, data);
  } else {
    // CREATE
    data.id = nextId(customers);
    customers.push(data);
  }

  saveData('gm_customers', customers);
  closeModal('customerFormModal');
  renderCustomersList();
  renderCustomerSelect();
});

function deleteCustomer(customerId) {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  customers = customers.filter(function (c) { return c.id !== customerId; });
  saveData('gm_customers', customers);
  renderCustomersList();
  renderCustomerSelect();
}


// ---------- 15. START THE APP ----------

function init() {
  document.getElementById('headerShopName').textContent = settings.shopName;
  renderProducts();
  renderCustomerSelect();
  renderCart();
}

init();
