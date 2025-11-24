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
// 2. LOAD PRODUK (UNTUK HALAMAN HOME & SHOP)
// =========================================================
async function loadProducts() {
    // Hanya jalankan jika BUKAN di halaman detail (agar tidak double fetch)
    if (window.location.pathname.includes("product-detail.html")) return;

    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Gagal load produk");
        const data = await response.json();

        // Render produk di halaman Home/Shop jika ada elemennya
        // (Logika render card produk biasanya ada di sini atau file HTML terpisah)
        // Kita simpan ke global variable untuk keperluan lain
        data.forEach(item => {
            products[item.product_id] = item;
        });
    } catch (error) { console.error("Error:", error); }
}
loadProducts(); 

// =========================================================
// 3. GLOBAL LISTENERS
// =========================================================
document.addEventListener("click", (e) => {
    // Tombol User Icon
    if (e.target.matches(".fa-user") || e.target.closest("#userButton")) {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        
        if (token) {
            if(userData.role === 'admin') window.location.href = "admin.html";
            else window.location.href = "profile.html";
        } else if (loginModal) {
            loginModal.style.display = "flex";
        }
    }
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === signupModal) signupModal.style.display = "none";
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
                    localStorage.setItem("userData", JSON.stringify(data.user)); 
                    
                    const fName = data.user.first_name || data.user.firstName || "User";
                    alert(`Halo, ${fName}!`);
                    
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
// 5. HALAMAN PROFILE
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

    try {
        const resUser = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resUser.ok) {
            const user = await resUser.json();
            const fName = user.first_name || user.firstName || ""; 
            const lName = user.last_name || user.lastName || "";
            document.getElementById("greeting").textContent = `Hi, ${fName} ${lName}!`;
            if(document.getElementById("firstName")) document.getElementById("firstName").value = fName;
            if(document.getElementById("lastName")) document.getElementById("lastName").value = lName;
            if(document.getElementById("email")) document.getElementById("email").value = user.email;
            if(document.getElementById("phone")) document.getElementById("phone").value = user.phone || '';
        }
    } catch (err) { console.error("Gagal load profile", err); }
    
    // Load Order History
    try {
        const resOrder = await fetch(`${API_URL}/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
        const orderListEl = document.getElementById("ordersList");
        
        if (resOrder.ok && orderListEl) {
            const orders = await resOrder.json();
            if (orders.length === 0) {
                orderListEl.innerHTML = "<p style='text-align:center; padding:20px;'>Belum ada pesanan.</p>";
            } else {
                orderListEl.innerHTML = ""; 
                orders.forEach(order => {
                    const firstItem = (order.OrderItems && order.OrderItems.length > 0) ? order.OrderItems[0] : { Product: { product_name: 'Unknown', image_url: '' } };
                    let imgUrl = firstItem.Product?.image_url || 'https://via.placeholder.com/70';
                    if (imgUrl && !imgUrl.startsWith('http')) imgUrl = `${API_URL.replace('/api', '')}/uploads/${imgUrl}`;

                    const div = document.createElement("div");
                    div.className = "order-item";
                    div.innerHTML = `
                        <div class="order-left">
                            <img src="${imgUrl}" alt="img" class="order-thumb">
                            <div class="order-info">
                                <b>Order #${order.order_id} - ${order.status}</b>
                                <p>To: ${order.recipient_name} | Total: Rp ${parseFloat(order.total_price).toLocaleString("id-ID")}</p>
                            </div>
                        </div>
                    `;
                    orderListEl.appendChild(div);
                });
            }
        }
    } catch (err) { if(document.getElementById("ordersList")) document.getElementById("ordersList").innerHTML = "<p>Gagal memuat pesanan.</p>"; }
}

// =========================================================
// 6. HALAMAN DETAIL PRODUK (UPDATE MANDIRI)
// =========================================================
if (window.location.pathname.includes("product-detail.html")) {
    initProductDetail();
}

async function initProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        // Jika tidak ada ID, jangan lakukan apa-apa (atau redirect)
        console.error("ID Produk tidak ditemukan di URL");
        return;
    }

    try {
        // FETCH LANGSUNG DATA PRODUK SPESIFIK DARI SERVER
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error("Produk tidak ditemukan");
        
        const product = await response.json();

        // Fix Gambar URL
        let imgUrl = product.image_url;
        if (imgUrl && !imgUrl.startsWith('http')) {
            imgUrl = `${API_URL.replace('/api', '')}/uploads/${imgUrl}`;
        }

        // UPDATE TAMPILAN
        const imgEl = document.querySelector(".product-image img");
        if(imgEl) {
            imgEl.src = imgUrl;
            imgEl.alt = product.product_name;
        }

        const nameEl = document.querySelector(".product-info h2");
        if(nameEl) nameEl.textContent = product.product_name;

        const priceEl = document.querySelector(".price");
        if(priceEl) priceEl.textContent = `Rp. ${parseInt(product.price).toLocaleString("id-ID")}`;

        const descEl = document.querySelector(".desc");
        if(descEl) descEl.textContent = product.description || "Tidak ada deskripsi.";

        // SETUP TOMBOL ADD TO CART
        const addCartBtn = document.querySelector(".add-cart");
        if (addCartBtn) {
            const newBtn = addCartBtn.cloneNode(true);
            addCartBtn.parentNode.replaceChild(newBtn, addCartBtn);
            
            newBtn.addEventListener("click", (e) => {
                e.preventDefault();
                // Siapkan data object yang bersih untuk Cart
                const productDataForCart = {
                    id: product.product_id,
                    name: product.product_name,
                    price: product.price,
                    img: imgUrl
                };
                addToCartLogic(productDataForCart);
            });
        }

    } catch (err) {
        console.error(err);
        const infoEl = document.querySelector(".product-info");
        if(infoEl) infoEl.innerHTML = "<p>Gagal memuat informasi produk. Pastikan ID produk benar.</p>";
    }
}

// LOGIC ADD TO CART
async function addToCartLogic(product) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Silakan login dulu! 🌸");
        if(loginModal) loginModal.style.display = "flex";
        return;
    }

    try {
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
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            const existing = cart.find(i => i.id == product.id); 
            if (existing) existing.quantity++;
            else cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, quantity: 1 });
            
            localStorage.setItem("cart", JSON.stringify(cart));
            alert("Berhasil masuk keranjang! 🌸");
            window.location.href = "cart.html";
        } else {
            throw new Error(data.error || "Gagal menambah ke keranjang");
        }
    } catch (err) { alert("Gagal: " + err.message); }
}

// =========================================================
// 7. CART PAGE & CHECKOUT
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
          <a href="product-detail.html?id=${item.id}"><img src="${item.img}" alt="${item.name}"></a>
          <div class="cart-info"><b>${item.name}</b><p>Ready Stock</p></div>
        </div>
        <div class="cart-right">
          <div class="qty-control"><span>${item.quantity} x</span></div>
          <b>Rp. ${subtotal.toLocaleString("id-ID")}</b>
        </div>`;
        cartItems.appendChild(div);
    });
    if(totalEl) totalEl.textContent = `Rp. ${total.toLocaleString("id-ID")}`;
}

window.checkoutCart = function() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (!localStorage.getItem("token")) return alert("Silakan Login dulu!");
    localStorage.setItem("checkoutCart", JSON.stringify(cart));
    window.location.href = "checkout.html";
};

if (window.location.pathname.includes("checkout.html")) {
    const itemsContainer = document.getElementById("checkoutItems");
    const subtotalEl = document.getElementById("subtotal");
    const deliveryEl = document.getElementById("delivery");
    const totalEl = document.getElementById("total");
    const deliveryTypeSelect = document.getElementById("deliveryType");
    const cart = JSON.parse(localStorage.getItem("checkoutCart")) || [];
    const handlingFee = 1000;
    let subtotal = 0;

    if (itemsContainer) {
        itemsContainer.innerHTML = "";
        cart.forEach(item => {
            const rowTotal = item.price * item.quantity;
            subtotal += rowTotal;
            itemsContainer.innerHTML += `<div class="checkout-item-row" style="display:flex; justify-content:space-between; margin-bottom:10px;"><div style="display:flex; gap:10px; align-items:center;"><img src="${item.img}" style="width:40px; height:40px; border-radius:4px;"><div><p style="margin:0; font-weight:bold;">${item.name}</p><small>x${item.quantity}</small></div></div><p style="margin:0;">Rp ${rowTotal.toLocaleString("id-ID")}</p></div>`;
        });
        subtotalEl.textContent = `Rp. ${subtotal.toLocaleString("id-ID")}`;
    }

    function calculateTotal() {
        const type = deliveryTypeSelect.value;
        let deliveryFee = (type === "Delivery") ? 25000 : 0;
        const grandTotal = subtotal + deliveryFee + handlingFee;
        deliveryEl.textContent = `Rp. ${deliveryFee.toLocaleString("id-ID")}`;
        totalEl.textContent = `Rp. ${grandTotal.toLocaleString("id-ID")}`;
    }

    if (deliveryTypeSelect) {
        deliveryTypeSelect.addEventListener("change", calculateTotal);
        calculateTotal(); 
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

            if (!recipientName || !recipientPhone || !deliveryDate) return alert("Mohon lengkapi Nama, HP, dan Tanggal!");
            if (deliveryType === "Delivery" && !address) return alert("Alamat wajib diisi untuk Delivery!");

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
                        address_line: address || "Ambil Sendiri",
                        province: province || "-",
                        postal_code: postalCode || "-",
                        delivery_type: deliveryType,
                        delivery_date: deliveryDate,
                        delivery_time: deliveryTime || "09:00 - 15:00",
                        message_card: messageCard
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    alert("✅ Pesanan Berhasil!");
                    localStorage.removeItem("cart");
                    localStorage.removeItem("checkoutCart");
                    window.location.href = "profile.html";
                } else throw new Error(data.error);
            } catch (err) { alert("Gagal: " + err.message); payBtn.textContent = "PAY NOW"; payBtn.disabled = false; }
        });
    }
}