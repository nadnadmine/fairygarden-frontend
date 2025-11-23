// Pastikan baris ini sudah mengarah ke Vercel Backend kamu
const API_URL = "https://fairygarden-backend.vercel.app/api";

// ========== MODAL LOGIN / SIGNUP / FORGOT PASSWORD ==========
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const forgotModal = document.getElementById("forgotModal");

const userIcon = document.querySelector("header .fa-user"); // ✅ lebih spesifik
const closeBtns = document.querySelectorAll(".close-btn");
const signupLinks = document.querySelectorAll(".signup-link");
const loginLinks = document.querySelectorAll(".login-link");
const forgotLinks = document.querySelectorAll(".forgot");
const cancelBtns = document.querySelectorAll(".cancel-btn");

// === OPEN MODALS ===
if (userIcon) {
  userIcon.addEventListener("click", (e) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      // Sudah login → ke profile
      window.location.href = "profile.html";
    } else {
      // Belum login → buka modal login
      e.preventDefault();
      if (loginModal) loginModal.style.display = "flex";
    }
  });
}

// ========== LOGIN HANDLER ==========
if (loginModal) {
  const loginBtn = document.getElementById("mainLoginBtn") || loginModal.querySelector(".login-btn");
  const loginInputs = loginModal.querySelectorAll("input");

  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const email = loginInputs[0].value.trim().toLowerCase();
      const password = loginInputs[1].value.trim();

      // === ADMIN LOGIN ===
      if (email === "admin@fairygarden.com" && password === "admin123") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        alert("Login berhasil sebagai ADMIN 🌸");
        window.location.href = "admin.html";
        return;
      }

      // === USER LOGIN ===
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const found = users.find(u => u.email.toLowerCase() === email && u.password === password);

      if (found) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "user");
        localStorage.setItem("userData", JSON.stringify(found)); // ini yg dibaca profile.html
        alert(`Selamat datang kembali, ${found.firstName}! 🌸`);
        window.location.href = "profile.html";
      } else {
        alert("Email atau password salah.");
      }
    });
  }
}

/* === SIGN UP === */
if (signupModal) {
  const signupForm = document.getElementById("signupForm");

  // Pastikan tidak double listener
  signupForm.replaceWith(signupForm.cloneNode(true));
  const newSignupForm = document.getElementById("signupForm");

  newSignupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newUser = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim().toLowerCase(),
      password: document.getElementById("password").value.trim(),
    };

    // Validasi input wajib
    if (!newUser.firstName || !newUser.email || !newUser.password) {
      alert("Mohon isi semua data wajib 🌸");
      return;
    }

    // Ambil user list
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Cek duplikat email
    const exists = users.some(u => u.email && u.email.toLowerCase() === newUser.email);
    if (exists) {
      alert("Email sudah terdaftar 🌸 Silakan gunakan email lain atau login.");
      return;
    }

    // Simpan akun baru
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Langsung login otomatis
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", "user");
    localStorage.setItem("userData", JSON.stringify(newUser));

    alert(`Akun berhasil dibuat! Selamat datang, ${newUser.firstName} 🌷`);

    // Tutup modal dan langsung ke profile
    signupModal.classList.remove("show");
    window.location.href = "profile.html";
  });
}

// ========== CLOSE MODAL ==========
closeBtns.forEach(btn => btn.addEventListener("click", () => {
  [loginModal, signupModal, forgotModal].forEach(m => m && (m.style.display = "none"));
}));

signupLinks.forEach(link => link.addEventListener("click", e => {
  e.preventDefault();
  if (loginModal) loginModal.style.display = "none";
  if (signupModal) signupModal.style.display = "flex";
}));

loginLinks.forEach(link => link.addEventListener("click", e => {
  e.preventDefault();
  [signupModal, forgotModal].forEach(m => m && (m.style.display = "none"));
  if (loginModal) loginModal.style.display = "flex";
}));

forgotLinks.forEach(link => link.addEventListener("click", e => {
  e.preventDefault();
  if (loginModal) loginModal.style.display = "none";
  if (forgotModal) forgotModal.style.display = "flex";
}));

cancelBtns.forEach(btn => btn.addEventListener("click", () => {
  if (forgotModal) forgotModal.style.display = "none";
  if (loginModal) loginModal.style.display = "flex";
}));

window.addEventListener("click", (e) => {
  if ([loginModal, signupModal, forgotModal].includes(e.target)) {
    [loginModal, signupModal, forgotModal].forEach(m => m && (m.style.display = "none"));
  }
});

// ========== PRODUK DATABASE ==========
const products = {
  "rose-harmony": { name: "Rose Harmony", price: 250000, desc: "Kombinasi mawar merah muda dan putih.", img: "https://i.pinimg.com/564x/7e/f4/26/7ef426d43798f93b8e3dc0f2ad8bbcd5.jpg" },
  "daisy-charm": { name: "Daisy Charm", price: 230000, desc: "Rangkaian bunga daisy putih.", img: "https://i.pinimg.com/736x/1e/df/fb/1edffbba617cbfe9c3576aead8e823ee.jpg" },
  "sunflower-joy": { name: "Sunflower Joy", price: 260000, desc: "Bunga matahari ceria.", img: "https://i.pinimg.com/1200x/93/ab/8c/93ab8c4747d23016d3b6cbc1194c0a63.jpg" },
  "orchid-dream": { name: "Orchid Dream", price: 350000, desc: "Anggrek ungu elegan.", img: "https://i.pinimg.com/1200x/14/2f/b2/142fb23313806b79364dd24c19447b8a.jpg" },
};

// ========== PRODUK DETAIL ==========
if (window.location.pathname.includes("product-detail.html")) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = products[id];

  if (product) {
    document.querySelector(".product-image img").src = product.img;
    document.querySelector(".product-info h2").textContent = product.name;
    document.querySelector(".price").textContent = `Rp. ${product.price.toLocaleString("id-ID")}`;
    document.querySelector(".desc").textContent = product.desc;
  }

  const addCartBtn = document.querySelector(".add-cart");
  if (addCartBtn) {
    addCartBtn.addEventListener("click", (e) => {
      e.preventDefault();

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(i => i.id === id);

      if (existing) {
        existing.quantity++;
      } else {
        cart.push({
          id,
          name: product.name,
          price: product.price,
          img: product.img,
          quantity: 1
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${product.name} berhasil ditambahkan ke keranjang! 🌸`);
      window.location.href = "cart.html";
    });
  }
}

// ========== CART PAGE ==========
if (window.location.pathname.includes("cart.html")) {
  const cartItems = document.querySelector(".cart-items");
  const totalEl = document.getElementById("cartTotal");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Ambil data delivery dari product-detail
  const orderDetails = JSON.parse(localStorage.getItem("orderDetails") || "{}");
  orderDetails.orderNote = localStorage.getItem("orderNote") || "-";
  const deliveryOption = orderDetails.deliveryOption || "-";
  const deliveryTime = orderDetails.deliveryTime || "-";

  function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItems.innerHTML = "<p>Keranjang kosong 🌸</p>";
      totalEl.textContent = "Rp. 0";
      return;
    }

    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div class="cart-left">
          <a href="product-detail.html?id=${item.id}">
            <img src="${item.img}" alt="${item.name}">
          </a>
          <div class="cart-info">
            <b>${item.name}</b>
            <p>Delivery Option: ${deliveryOption}</p>
            <p>Delivery Time: ${deliveryTime}</p>
          </div>
        </div>
        <div class="cart-right">
          <div class="qty-control">
            <button class="minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="plus" data-id="${item.id}">+</button>
          </div>
          <b>Rp. ${subtotal.toLocaleString("id-ID")}</b>
        </div>`;
      cartItems.appendChild(div);
    });

    totalEl.textContent = `Rp. ${total.toLocaleString("id-ID")}`;
  }

  renderCart();

  // === HANDLE +/- quantity ===
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("plus") || e.target.classList.contains("minus")) {
      const id = e.target.dataset.id;
      let updatedCart = [];

      cart.forEach(item => {
        if (item.id === id) {
          if (e.target.classList.contains("plus")) {
            item.quantity++;
            updatedCart.push(item);
          } else if (e.target.classList.contains("minus")) {
            if (item.quantity > 1) {
              item.quantity--;
              updatedCart.push(item);
            } else if (!confirm(`Hapus ${item.name} dari keranjang?`)) {
              updatedCart.push(item);
            }
          }
        } else updatedCart.push(item);
      });

      cart = updatedCart;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  });
}

function checkoutCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert("Keranjang kamu masih kosong 🌸");
    return;
  }

  // Simpan catatan pesanan
  const orderNote = document.querySelector(".notes textarea").value.trim();
  localStorage.setItem("orderNote", orderNote);

  // Simpan total dan data cart untuk ditampilkan di checkout
  localStorage.setItem("checkoutCart", JSON.stringify(cart));

  window.location.href = "checkout.html";
}