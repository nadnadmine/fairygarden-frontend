// ==========================================
// 1. KONFIGURASI KONEKSI (HUBUNGKAN KE VERCEL)
// ==========================================
const API_URL = "https://fairygarden-backend.vercel.app/api"; 

// Variabel penampung produk (akan diisi oleh Database)
let products = {}; 

// Elemen Modal & Tombol
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const forgotModal = document.getElementById("forgotModal");
const closeBtns = document.querySelectorAll(".close-btn");
const signupLinks = document.querySelectorAll(".signup-link");
const loginLinks = document.querySelectorAll(".login-link");
const forgotLinks = document.querySelectorAll(".forgot");
const cancelBtns = document.querySelectorAll(".cancel-btn");

// ==========================================
// 2. FUNGSI AMBIL PRODUK DARI DATABASE (AUTO RUN)
// ==========================================
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) throw new Error("Gagal mengambil data produk");

        const data = await response.json();

        // Masukkan data dari Database ke variabel products
        data.forEach(item => {
            // Logic Gambar: Jika link http/https pakai langsung, jika nama file sesuaikan path
            let imageSrc = item.image_url;
            if (imageSrc && !imageSrc.startsWith('http')) {
                // Hapus /api di ujung link untuk akses folder uploads
                imageSrc = `${API_URL.replace('/api', '')}/uploads/${imageSrc}`;
            }

            products[item.product_id] = {
                id: item.product_id,
                name: item.product_name,
                price: parseInt(item.price),
                desc: item.description,
                img: imageSrc,
                stock: item.stock
            };
        });

        // Jika user sedang membuka halaman detail, refresh tampilannya
        initProductDetail();

    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// Jalankan fungsi ini saat website pertama kali dibuka
loadProducts();


// ==========================================
// 3. GLOBAL EVENT LISTENER (NAVIGASI & KLIK)
// ==========================================
document.addEventListener("click", (e) => {
    
    // A. LOGIC TOMBOL PROFIL (ICON USER)
    if (e.target.matches(".fa-user") || e.target.closest("#userButton") || e.target.closest(".fa-user")) {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (token) {
            // Jika punya token, masuk ke profile
            window.location.href = "profile.html";
        } else {
            // Jika tidak, buka modal login
            if (loginModal) loginModal.style.display = "flex";
        }
    }

    // B. LOGIC TUTUP MODAL (KLIK DI LUAR)
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === signupModal) signupModal.style.display = "none";
    if (e.target === forgotModal) forgotModal.style.display = "none";

    // C. LOGIC QUANTITY CART (+/-)
    if (e.target.classList.contains("plus") || e.target.classList.contains("minus")) {
        handleQuantityChange(e);
    }
});


// ==========================================
// 4. LOGIN HANDLER (CONNECT KE BACKEND)
// ==========================================
if (loginModal) {
    const loginBtn = document.getElementById("mainLoginBtn") || loginModal.querySelector(".login-btn");
    const loginInputs = loginModal.querySelectorAll("input");

    if (loginBtn) {
        // Clone node untuk menghapus event listener lama (mencegah double submit)
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

        newLoginBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const email = loginInputs[0].value.trim();
            const password = loginInputs[1].value.trim();

            if (!email || !password) {
                alert("Mohon isi email dan password.");
                return;
            }

            try {
                // Tembak API Login Vercel
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Simpan Token & Data User
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("isLoggedIn", "true");
                    
                    const userForFrontend = {
                        firstName: data.user.first_name,
                        lastName: data.user.last_name || "",
                        email: data.user.email,
                        phone: data.user.phone || "",
                        role: data.user.role
                    };
                    localStorage.setItem("userData", JSON.stringify(userForFrontend));
                    
                    // Simpan raw user data untuk keperluan checkout nanti
                    localStorage.setItem("user", JSON.stringify(data.user));

                    alert(`Selamat datang kembali, ${data.user.first_name}! 🌸`);
                    
                    if (data.user.role === 'admin') window.location.href = "admin.html";
                    else window.location.href = "profile.html";

                } else {
                    alert("Login Gagal: " + (data.error || "Email atau password salah."));
                }
            } catch (error) {
                console.error("Login Error:", error);
                alert("Gagal terhubung ke server.");
            }
        });
    }
}


// ==========================================
// 5. SIGNUP HANDLER (CONNECT KE BACKEND)
// ==========================================
if (signupModal) {
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        const newSignupForm = signupForm.cloneNode(true);
        signupForm.parentNode.replaceChild(newSignupForm, signupForm);

        newSignupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById("firstName").value.trim();
            const lastName = document.getElementById("lastName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        first_name: firstName, 
                        last_name: lastName, 
                        phone, 
                        email, 
                        password 
                    })
                });
                
                const data = await response.json();

                if (response.ok) {
                    alert("Akun berhasil dibuat! Silakan Login 🌷");
                    signupModal.style.display = "none";
                    loginModal.style.display = "flex";
                } else {
                    alert("Register Gagal: " + (data.error || "Terjadi kesalahan."));
                }
            } catch (err) {
                console.error(err);
                alert("Gagal terhubung ke server.");
            }
        });
    }
}


// ==========================================
// 6. NAVIGASI MODAL (TABS)
// ==========================================
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


// ==========================================
// 7. PRODUCT DETAIL & ADD TO CART
// ==========================================
function initProductDetail() {
    if (window.location.pathname.includes("product-detail.html")) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        
        // Ambil dari variabel global 'products' yang sudah diisi fungsi loadProducts()
        const product = products[id];

        if (product) {
            document.querySelector(".product-image img").src = product.img;
            document.querySelector(".product-info h2").textContent = product.name;
            document.querySelector(".price").textContent = `Rp. ${product.price.toLocaleString("id-ID")}`;
            document.querySelector(".desc").textContent = product.desc;

            const addCartBtn = document.querySelector(".add-cart");
            if (addCartBtn) {
                const newBtn = addCartBtn.cloneNode(true);
                addCartBtn.parentNode.replaceChild(newBtn, addCartBtn);
                newBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    addToCartLogic(product);
                });
            }
        }
    }
}

function addToCartLogic(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    // Gunakan loose equality (==) karena ID dari URL string, ID dari DB integer
    const existing = cart.find(i => i.id == product.id); 
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ 
            id: product.id, 
            name: product.name, 
            price: product.price, 
            img: product.img, 
            quantity: 1 
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} berhasil ditambahkan ke keranjang! 🌸`);
    window.location.href = "cart.html";
}


// ==========================================
// 8. CART PAGE LOGIC
// ==========================================
if (window.location.pathname.includes("cart.html")) {
    renderCartPage();
}

function renderCartPage() {
    const cartItems = document.querySelector(".cart-items");
    const totalEl = document.getElementById("cartTotal");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cartItems) return;

    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Keranjang kosong 🌸</p>";
        if (totalEl) totalEl.textContent = "Rp. 0";
        return;
    }

    const orderDetails = JSON.parse(localStorage.getItem("orderDetails") || "{}");
    const deliveryText = orderDetails.deliveryOption || "Delivery"; 

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
            <p>${deliveryText}</p>
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

    if (totalEl) totalEl.textContent = `Rp. ${total.toLocaleString("id-ID")}`;
}

function handleQuantityChange(e) {
    const id = e.target.dataset.id;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let updatedCart = [];
    let changed = false;

    cart.forEach(item => {
        if (item.id == id) {
            if (e.target.classList.contains("plus")) {
                item.quantity++;
            } else if (e.target.classList.contains("minus")) {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    if (!confirm(`Hapus ${item.name} dari keranjang?`)) {
                        updatedCart.push(item);
                        return; 
                    }
                    changed = true;
                    return; 
                }
            }
            changed = true;
        }
        updatedCart.push(item);
    });

    if (changed) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        if (window.location.pathname.includes("cart.html")) {
            renderCartPage();
        }
    }
}

// Fungsi yang dipanggil oleh tombol Checkout di cart.html
window.checkoutCart = function() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Keranjang kamu masih kosong 🌸");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Silakan login terlebih dahulu untuk checkout! 🌸");
        if (loginModal) loginModal.style.display = "flex";
        return;
    }

    const noteInput = document.querySelector(".notes textarea");
    if (noteInput) localStorage.setItem("orderNote", noteInput.value);

    // Snapshot cart untuk halaman checkout
    localStorage.setItem("checkoutCart", JSON.stringify(cart));

    window.location.href = "checkout.html";
};