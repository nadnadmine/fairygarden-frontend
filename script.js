// =========================================================
// 1. KONFIGURASI API (LINK VERCEL BACKEND)
// =========================================================
const API_URL = "https://fairygarden-backend.vercel.app/api"; 

let products = {}; 

// Elemen Modal
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const forgotModal = document.getElementById("forgotModal");
const closeBtns = document.querySelectorAll(".close-btn");
const signupLinks = document.querySelectorAll(".signup-link");
const loginLinks = document.querySelectorAll(".login-link");

// =========================================================
// 2. LOAD PRODUK DARI DATABASE NEON
// =========================================================
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Gagal load produk");
        const data = await response.json();

        data.forEach(item => {
            let imageSrc = item.image_url;
            // Fix path gambar jika dari upload lokal
            if (imageSrc && !imageSrc.startsWith('http')) {
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

        // Refresh detail page jika sedang dibuka
        initProductDetail();

    } catch (error) {
        console.error("Error:", error);
    }
}
loadProducts(); 

// =========================================================
// 3. GLOBAL EVENT LISTENER
// =========================================================
document.addEventListener("click", (e) => {
    // Tombol User (Profile/Login)
    if (e.target.matches(".fa-user") || e.target.closest("#userButton")) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (token) window.location.href = "profile.html";
        else if (loginModal) loginModal.style.display = "flex";
    }

    // Close Modal
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === signupModal) signupModal.style.display = "none";

    // Quantity Cart
    if (e.target.classList.contains("plus") || e.target.classList.contains("minus")) {
        handleQuantityChange(e);
    }
});

// =========================================================
// 4. AUTH HANDLERS (LOGIN & REGISTER)
// =========================================================
// --- LOGIN ---
if (loginModal) {
    const loginBtn = document.getElementById("mainLoginBtn") || loginModal.querySelector(".login-btn");
    const loginInputs = loginModal.querySelectorAll("input");

    if (loginBtn) {
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

        newLoginBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const email = loginInputs[0].value.trim();
            const password = loginInputs[1].value.trim();

            if (!email || !password) return alert("Isi email & password");

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password})
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userData", JSON.stringify(data.user)); // Simpan data user
                    
                    alert(`Halo, ${data.user.first_name}! 🌸`);
                    if(data.user.role === 'admin') window.location.href = "admin.html";
                    else window.location.href = "profile.html";
                } else {
                    alert(data.error || "Login Gagal");
                }
            } catch (err) { alert("Gagal koneksi server"); }
        });
    }
}

// --- SIGNUP ---
if (signupModal) {
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        const newSignupForm = signupForm.cloneNode(true);
        signupForm.parentNode.replaceChild(newSignupForm, signupForm);

        newSignupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            // Ambil value input
            const firstName = document.getElementById("firstName").value;
            const lastName = document.getElementById("lastName").value;
            const phone = document.getElementById("phone").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ first_name: firstName, last_name: lastName, phone, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert("Register Berhasil! Silakan Login.");
                    signupModal.style.display = "none";
                    loginModal.style.display = "flex";
                } else {
                    alert(data.error);
                }
            } catch (err) { alert("Error koneksi"); }
        });
    }
}

// Modal Tabs Logic
closeBtns.forEach(btn => btn.addEventListener("click", () => [loginModal, signupModal].forEach(m => m && (m.style.display="none"))));
signupLinks.forEach(l => l.addEventListener("click", (e) => { e.preventDefault(); loginModal.style.display="none"; signupModal.style.display="flex"; }));
loginLinks.forEach(l => l.addEventListener("click", (e) => { e.preventDefault(); signupModal.style.display="none"; loginModal.style.display="flex"; }));


// =========================================================
// 5. PRODUCT DETAIL & CART LOGIC
// =========================================================
function initProductDetail() {
    if (window.location.pathname.includes("product-detail.html")) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
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
    const existing = cart.find(i => i.id == product.id); 
    if (existing) existing.quantity++;
    else cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, quantity: 1 });
    
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Masuk keranjang! 🌸");
    window.location.href = "cart.html";
}

// =========================================================
// 6. CART PAGE RENDER
// =========================================================
if (window.location.pathname.includes("cart.html")) renderCartPage();

function renderCartPage() {
    const cartItems = document.querySelector(".cart-items");
    const totalEl = document.getElementById("cartTotal");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cartItems) return;
    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Keranjang kosong 🌸</p>";
        if(totalEl) totalEl.textContent = "Rp. 0";
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
            <p>Delivery</p>
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

    if(totalEl) totalEl.textContent = `Rp. ${total.toLocaleString("id-ID")}`;
}

function handleQuantityChange(e) {
    const id = e.target.dataset.id;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let updated = [];
    let changed = false;

    cart.forEach(item => {
        if (item.id == id) {
            if (e.target.classList.contains("plus")) item.quantity++;
            else if (e.target.classList.contains("minus")) {
                if (item.quantity > 1) item.quantity--;
                else { if(!confirm("Hapus item?")) {updated.push(item); return;} changed=true; return; }
            }
            changed = true;
        }
        updated.push(item);
    });

    if (changed) {
        localStorage.setItem("cart", JSON.stringify(updated));
        if (window.location.pathname.includes("cart.html")) renderCartPage();
    }
}

window.checkoutCart = function() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (!localStorage.getItem("token")) {
        alert("Silakan Login dulu!");
        if(loginModal) loginModal.style.display="flex";
        return;
    }
    const note = document.querySelector(".notes textarea");
    if(note) localStorage.setItem("orderNote", note.value);
    localStorage.setItem("checkoutCart", JSON.stringify(cart));
    window.location.href = "checkout.html";
};


// =========================================================
// 7. HALAMAN CHECKOUT (LOGIC BARU SESUAI PDF)
// =========================================================
if (window.location.pathname.includes("checkout.html")) {
    
    // A. Render Ringkasan Pesanan
    const itemsContainer = document.getElementById("checkoutItems");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");
    const cart = JSON.parse(localStorage.getItem("checkoutCart")) || [];
    
    let subtotal = 0;
    const deliveryFee = 25000;
    const handlingFee = 1000;

    if (itemsContainer) {
        itemsContainer.innerHTML = "";
        cart.forEach(item => {
            const rowTotal = item.price * item.quantity;
            subtotal += rowTotal;
            itemsContainer.innerHTML += `
            <div class="checkout-item-row" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <div style="display:flex; gap:10px; align-items:center;">
                    <img src="${item.img}" style="width:40px; height:40px; border-radius:4px;">
                    <div><p style="margin:0; font-weight:bold;">${item.name}</p><small>x${item.quantity}</small></div>
                </div>
                <p style="margin:0;">Rp ${rowTotal.toLocaleString("id-ID")}</p>
            </div>`;
        });
        subtotalEl.textContent = `Rp. ${subtotal.toLocaleString("id-ID")}`;
        totalEl.textContent = `Rp. ${(subtotal + deliveryFee + handlingFee).toLocaleString("id-ID")}`;
    }

    // B. Logic Tombol PAY NOW (Kirim JSON ke API)
    const payBtn = document.getElementById("payNow");
    if (payBtn) {
        payBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");

            // Ambil Input HTML Baru
            const recipientName = document.getElementById("recipientName")?.value;
            const recipientPhone = document.getElementById("recipientPhone")?.value;
            const senderPhone = document.getElementById("senderPhone")?.value;
            const address = document.getElementById("address")?.value;
            const province = document.getElementById("province")?.value;
            const postalCode = document.getElementById("postalCode")?.value;
            const deliveryType = document.getElementById("deliveryType")?.value;
            const deliveryDate = document.getElementById("deliveryDate")?.value;
            const deliveryTime = document.getElementById("deliveryTime")?.value;
            const messageCard = document.getElementById("checkoutAdditional")?.value;

            // Validasi
            if (!recipientName || !recipientPhone || !address || !deliveryDate) {
                return alert("Mohon lengkapi Nama Penerima, Alamat, dan Tanggal Kirim!");
            }

            payBtn.textContent = "Processing...";
            payBtn.disabled = true;

            try {
                // Fetch API Checkout
                const res = await fetch(`${API_URL}/orders/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        recipient_name: recipientName,
                        recipient_phone: recipientPhone,
                        sender_phone: senderPhone || "-",
                        address_line: address,
                        province: province || "Jakarta",
                        postal_code: postalCode || "00000",
                        delivery_type: deliveryType,
                        delivery_date: deliveryDate,
                        delivery_time: deliveryTime || "09:00 - 15:00",
                        message_card: messageCard
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    alert("✅ Pesanan Berhasil! Terima kasih.");
                    localStorage.removeItem("cart");
                    localStorage.removeItem("checkoutCart");
                    window.location.href = "profile.html";
                } else {
                    throw new Error(data.error);
                }
            } catch (err) {
                alert("Gagal: " + err.message);
                payBtn.textContent = "PAY NOW";
                payBtn.disabled = false;
            }
        });
    }
}