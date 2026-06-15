const seller = {
  email: "seller@example.com",
  phone: "923214700326"
};

const products = [
  {
    id: "battery-120",
    name: "Heavy Duty Battery",
    category: "Electrical",
    price: "Quote",
    sku: "PL-BAT-120",
    status: "Ready quote",
    detail: "12V battery for tractors, loaders, and small industrial machines.",
    image: "assets/battery.svg"
  },
  {
    id: "hydraulic-filter",
    name: "Hydraulic Filter",
    category: "Filters",
    price: "Quote",
    sku: "PL-FIL-240",
    status: "Common part",
    detail: "Replacement oil filter for hydraulic systems and service kits.",
    image: "assets/filter.svg"
  },
  {
    id: "drive-belt",
    name: "Industrial Drive Belt",
    category: "Belts",
    price: "Quote",
    sku: "PL-BLT-315",
    status: "Size needed",
    detail: "Durable belt for pumps, compressors, harvesters, and generators.",
    image: "assets/belt.svg"
  },
  {
    id: "starter-motor",
    name: "Starter Motor",
    category: "Electrical",
    price: "Quote",
    sku: "PL-STR-410",
    status: "Model match",
    detail: "Starter motor for diesel machinery and workshop replacements.",
    image: "assets/starter.svg"
  },
  {
    id: "bearing-set",
    name: "Bearing Set",
    category: "Mechanical",
    price: "Quote",
    sku: "PL-BRG-520",
    status: "Kit option",
    detail: "Bearing kit for rotating machinery, shafts, and gear assemblies.",
    image: "assets/bearing.svg"
  },
  {
    id: "engine-oil",
    name: "Engine Oil Pack",
    category: "Service",
    price: "Quote",
    sku: "PL-OIL-680",
    status: "Service item",
    detail: "Lubricant pack for regular servicing of heavy machinery engines.",
    image: "assets/oil.svg"
  }
];

const cart = new Map();
const productGrid = document.querySelector("#productGrid");
const categoryFilter = document.querySelector("#categoryFilter");
const searchInput = document.querySelector("#searchInput");
const sortFilter = document.querySelector("#sortFilter");
const cartItems = document.querySelector("#cartItems");
const itemCount = document.querySelector("#itemCount");
const orderForm = document.querySelector("#orderForm");
const statusMessage = document.querySelector("#statusMessage");
const whatsappOrder = document.querySelector("#whatsappOrder");

function init() {
  const categories = [...new Set(products.map((product) => product.category))].sort();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });

  searchInput.addEventListener("input", renderProducts);
  categoryFilter.addEventListener("change", renderProducts);
  sortFilter.addEventListener("change", renderProducts);
  document.querySelectorAll("#orderForm input, #orderForm textarea, #orderForm select").forEach((field) => {
    field.addEventListener("input", updateShareLinks);
    field.addEventListener("change", updateShareLinks);
  });
  document.querySelector("#clearOrder").addEventListener("click", clearOrder);
  document.querySelector("#copyOrder").addEventListener("click", copyOrder);
  orderForm.addEventListener("submit", sendOrder);
  renderProducts();
  renderCart();
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const visibleProducts = products
    .filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesSearch = [product.name, product.category, product.detail, product.sku]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return matchesCategory && matchesSearch;
    })
    .sort(sortProducts);

  productGrid.innerHTML = visibleProducts
    .map((product) => {
      const qty = cart.get(product.id) || 0;
      return `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-body">
            <div class="card-top">
              <span class="tag">${product.category}</span>
              <span class="stock-badge">${product.status}</span>
            </div>
            <div>
              <h3>${product.name}</h3>
              <p class="meta">${product.detail}</p>
              <span class="sku">${product.sku}</span>
            </div>
            <div class="price-row">
              <span class="price">${product.price}</span>
              <div class="qty-control" aria-label="${product.name} quantity">
                <button type="button" onclick="changeQty('${product.id}', -1)">-</button>
                <span>${qty}</span>
                <button type="button" onclick="changeQty('${product.id}', 1)">+</button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function sortProducts(a, b) {
  if (sortFilter.value === "name") {
    return a.name.localeCompare(b.name);
  }

  if (sortFilter.value === "category") {
    return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
  }

  return products.indexOf(a) - products.indexOf(b);
}

function changeQty(productId, amount) {
  const currentQty = cart.get(productId) || 0;
  const nextQty = Math.max(0, currentQty + amount);

  if (nextQty === 0) {
    cart.delete(productId);
  } else {
    cart.set(productId, nextQty);
  }

  renderProducts();
  renderCart();
}

function getOrderLines() {
  return [...cart.entries()].map(([productId, qty]) => {
    const product = products.find((item) => item.id === productId);
    return { ...product, qty };
  });
}

function renderCart() {
  const lines = getOrderLines();
  const totalQty = lines.reduce((sum, item) => sum + item.qty, 0);
  itemCount.textContent = totalQty;

  if (!lines.length) {
    cartItems.className = "cart-items empty";
    cartItems.textContent = "Select parts from the catalog to build an order.";
  } else {
    cartItems.className = "cart-items";
    cartItems.innerHTML = lines
      .map(
        (item) => `
          <div class="cart-line">
            <div>
              <strong>${item.name}</strong>
              <span>${item.category}</span>
            </div>
            <strong>x ${item.qty}</strong>
          </div>
        `
      )
      .join("");
  }

  updateShareLinks();
}

function clearOrder() {
  cart.clear();
  renderProducts();
  renderCart();
  statusMessage.textContent = "Order cleared.";
}

function updateShareLinks() {
  whatsappOrder.href = `https://wa.me/${seller.phone}?text=${encodeURIComponent(buildOrderMessage())}`;
}

function buildOrderMessage() {
  const lines = getOrderLines();
  const name = document.querySelector("#customerName").value.trim() || "Not provided";
  const phone = document.querySelector("#customerPhone").value.trim() || "Not provided";
  const location = document.querySelector("#customerLocation").value.trim() || "Not provided";
  const delivery = document.querySelector("#deliveryOption").value;
  const urgency = document.querySelector("#urgencyOption").value;
  const requiredDate = document.querySelector("#requiredDate").value || "Not provided";
  const contactMethod = document.querySelector("#contactMethod").value;
  const note = document.querySelector("#customerNote").value.trim() || "No extra requirement";
  const items = lines.length
    ? lines.map((item) => `- ${item.name} (${item.sku}, ${item.category}) x ${item.qty}`).join("\n")
    : "- No products selected";

  return `New machinery parts order

Customer: ${name}
Phone: ${phone}
Location: ${location}
Delivery option: ${delivery}
Urgency: ${urgency}
Required date: ${requiredDate}
Preferred contact: ${contactMethod}

Items:
${items}

Extra requirement:
${note}`;
}

async function copyOrder() {
  const message = buildOrderMessage();
  try {
    await navigator.clipboard.writeText(message);
    statusMessage.textContent = "Order details copied.";
  } catch (error) {
    statusMessage.textContent = "Copy failed. Select and copy the WhatsApp or email message instead.";
  }
}

function sendOrder(event) {
  event.preventDefault();

  if (!cart.size) {
    statusMessage.textContent = "Please select at least one part.";
    return;
  }

  const subject = encodeURIComponent("New machinery parts order");
  const body = encodeURIComponent(buildOrderMessage());
  window.location.href = `mailto:${seller.email}?subject=${subject}&body=${body}`;
  statusMessage.textContent = "Opening email app with order details.";
}

window.changeQty = changeQty;
init();
