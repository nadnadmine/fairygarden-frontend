// =========================================================
// 1. KONFIGURASI API
// =========================================================
const API_URL = "https://fairygarden-backend.vercel.app/api"; 

let products = {}; 

// Elemen Modal
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const closeBtns = document.querySelectorAll(".close-btn");
const signupLinks = document.querySelectorAll(".signup-link");
const loginLinks = document.querySelectorAll(".login-link");

// =========================================================
// 2. LOAD PRODUK (AUTO RUN)
// =========================================================
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Gagal load produk");
        const data = await response.json();

        data.forEach(item => {
            let imageSrc = item.image_url;
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
        initProductDetail();
    } catch (error) { console.error("Error:", error); }
}
loadProducts(); 

// =========================================================
// 3. GLOBAL LISTENERS
// =========================================================
document.addEventListener("click", (e) => {
    if (e.target.matches(".fa-user") || e.target.closest("#userButton")) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (token) window.location.href = "profile.html";
        else if (loginModal) loginModal.style.display = "flex";
    }
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === signupModal) signupModal.style.display = "none";
    if (e.target.classList.contains("plus") || e.target.classList.contains("minus")) {
        handleQuantityChange(e);
    }
});

// =========================================================
// 4. AUTH (LOGIN & REGISTER)
// =========================================================
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
                    alert(`Halo, ${data.user.first_name}!`);
                    if(data.user.role === 'admin') window.location.href = "admin.html";
                    else window.location.href = "profile.html";
                } else alert(data.error || "Login Gagal");
            } catch (err) { alert("Gagal koneksi server"); }
        });
    }
}

if (signupModal) {
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        const newSignupForm = signupForm.cloneNode(true);
        signupForm.parentNode.replaceChild(newSignupForm, signupForm);
        newSignupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
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
                } else alert(data.error);
            } catch (err) { alert("Error koneksi"); }
        });
    }
}
closeBtns.forEach(btn => btn.addEventListener("click", () => [loginModal, signupModal].forEach(m => m && (m.style.display="none"))));
signupLinks.forEach(l => l.addEventListener("click", (e) => { e.preventDefault(); loginModal.style.display="none"; signupModal.style.display="flex"; }));
loginLinks.forEach(l => l.addEventListener("click", (e) => { e.preventDefault(); signupModal.style.display="none"; loginModal.style.display="flex"; }));

// =========================================================
// 5. HALAMAN PROFILE (INI YANG BIKIN DATA MUNCUL)
// =========================================================
if (window.location.pathname.includes("profile.html")) {
    initProfilePage();
}

async function initProfilePage() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Silakan login dulu.");
        window.location.href = "index.html";
        return;
    }

    // A. AMBIL DATA USER TERBARU (GET /auth/me)
    try {
        const resUser = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resUser.ok) {
            const user = await resUser.json();
            // Isi Form Profile
            document.getElementById("welcomeName").textContent = `Hi, ${user.first_name}!`;
            document.getElementById("profileFirstName").value = user.first_name || "";
            document.getElementById("profileLastName").value = user.last_name || "";
            document.getElementById("profileEmail").value = user.email || "";
            document.getElementById("profilePhone").value = user.phone || "";
        }
    } catch (err) { console.error("Gagal load profile", err); }

    // B. AMBIL HISTORY ORDER (GET /orders)
    try {
        const resOrder = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orderListEl = document.getElementById("orderHistoryList");
        
        if (resOrder.ok) {
            const orders = await resOrder.json();
            if (orders.length === 0) {
                orderListEl.innerHTML = "<p>Belum ada pesanan.</p>";
            } else {
                orderListEl.innerHTML = ""; // Bersihkan loading
                orders.forEach(order => {
                    // Hitung total item
                    const itemCount = order.OrderItems ? order.OrderItems.length : 0;
                    
                    const div = document.createElement("div");
                    div.className = "order-card";
                    div.innerHTML = `
                        <div class="order-header">
                            <div>
                                <strong>Order ID: #${order.order_id}</strong><br>
                                <small>${new Date(order.created_at).toLocaleDateString()}</small>
                            </div>
                            <div style="text-align:right;">
                                <span class="status-badge status-${order.status}">${order.status}</span><br>
                                <small>${order.payment_status}</small>
                            </div>
                        </div>
                        <p>Total: <b>Rp. ${parseFloat(order.total_price).toLocaleString("id-ID")}</b></p>
                        <p>Penerima: ${order.recipient_name} (${order.delivery_type})</p>
                        <p><small>${itemCount} Item Bunga</small></p>
                    `;
                    orderListEl.appendChild(div);
                });
            }
        }
    } catch (err) { 
        document.getElementById("orderHistoryList").innerHTML = "<p>Gagal memuat pesanan.</p>";
    }

    // C. UPDATE PROFILE HANDLER
    const profileForm = document.getElementById("profileForm");
    if(profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const first_name = document.getElementById("profileFirstName").value;
            const last_name = document.getElementById("profileLastName").value;
            const phone = document.getElementById("profilePhone").value;
            const password = document.getElementById("profilePassword").value;

            try {
                const bodyData = { first_name, last_name, phone };
                if(password) bodyData.password = password;

                const res = await fetch(`${API_URL}/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(bodyData)
                });
                
                if(res.ok) alert("Profil berhasil diupdate!");
                else alert("Gagal update profil.");
            } catch(err) { alert("Error koneksi."); }
        });
    }
}


// =========================================================
// 6. CART & CHECKOUT LOGIC
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
async function addToCartLogic(product) {
    // 1. Cek Login Dulu
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Silakan login dulu untuk belanja! 🌸");
        if(loginModal) loginModal.style.display = "flex";
        return;
    }

    try {
        // 2. Kirim ke Back-End (Database)
        const response = await fetch(`${API_URL}/carts/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: product.id,
                quantity: 1
            })
        });

        const data = await response.json();

        if (response.ok) {
            // 3. Jika Sukses di Server, Baru Simpan di LocalStorage (Buat Tampilan)
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
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
            alert("Berhasil masuk keranjang! (Tersimpan di Database) 🌸");
            window.location.href = "cart.html";
        } else {
            throw new Error(data.error || "Gagal menambah ke keranjang");
        }

    } catch (err) {
        console.error(err);
        alert("Gagal: " + err.message);
    }
}
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

if (window.location.pathname.includes("checkout.html")) {
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
    const payBtn = document.getElementById("payNow");
    if (payBtn) {
        payBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");
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

            if (!recipientName || !recipientPhone || !address || !deliveryDate) return alert("Mohon lengkapi Nama Penerima, Alamat, dan Tanggal Kirim!");
            
            payBtn.textContent = "Processing...";
            payBtn.disabled = true;

            try {
                const res = await fetch(`${API_URL}/orders/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                } else throw new Error(data.error);
            } catch (err) { alert("Gagal: " + err.message); payBtn.textContent = "PAY NOW"; payBtn.disabled = false; }
        });
    }
}