// =========================================================
// 1. KONFIGURASI API
// =========================================================
const API_URL = "https://fairygarden-backend.vercel.app/api"; 
let products = {}; 

// =========================================================
// 2. LOAD PRODUK (RENDER OTOMATIS)
// =========================================================
async function loadProducts() {
    // A. Logic Halaman Detail
    if (window.location.pathname.includes("product-detail.html")) {
        initProductDetail(); 
        return; 
    }

    // B. Logic Halaman Home / View-All
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Gagal load produk");
        const data = await response.json();

        // Simpan ke global
        data.forEach(item => { products[item.product_id] = item; });

        // Render ke wadah (jika ada)
        const container = document.getElementById("productContainer") || document.getElementById("viewall-grid");
        
        if (container) {
            container.innerHTML = ""; 
            data.forEach(item => {
                let imgUrl = item.image_url;
                if (imgUrl && !imgUrl.startsWith('http')) {
                    imgUrl = `${API_URL.replace('/api', '')}/uploads/${imgUrl}`;
                }

                const productCard = `
                    <div class="product-card">
                        <a href="product-detail.html?id=${item.product_id}" style="text-decoration:none; color:inherit;">
                            <img src="${imgUrl}" alt="${item.product_name}">
                            <b>${item.product_name}</b>
                            <div>Rp ${parseInt(item.price).toLocaleString("id-ID")}</div>
                        </a>
                    </div>
                `;
                container.innerHTML += productCard;
            });
        }
    } catch (error) { console.error("Error:", error); }
}
loadProducts(); 

// =========================================================
// 3. GLOBAL LISTENERS (VERSI DEBUG & PEKA)
// =========================================================
document.addEventListener("click", (e) => {
    
    // --- A. LOGIC TOMBOL USER (PROFILE) ---
    // Gunakan .closest() untuk menangkap klik baik di Icon maupun di Link pembungkusnya
    const userBtn = e.target.closest("#userButton") || e.target.closest(".fa-user");

    if (userBtn) {
        e.preventDefault(); // Mencegah halaman melompat ke atas (href="#")
        console.log("✅ Tombol User DIKLIK!"); // Cek di Console Browser

        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        if (token) {
            console.log("Status: Sudah Login -> Redirect");
            if (userData.role === 'admin') window.location.href = "admin.html";
            else window.location.href = "profile.html";
        } else {
            console.log("Status: Belum Login -> Buka Modal");
            const modal = document.getElementById("loginModal");
            if (modal) modal.style.display = "flex";
            else alert("Modal Login tidak ditemukan! Cek koneksi internet.");
        }
        return; // Stop eksekusi agar tidak bentrok dengan logic lain
    }

    // --- B. LOGIC TOMBOL TUTUP MODAL (X) ---
    if (e.target.matches(".close-btn")) {
        const modal = e.target.closest(".modal");
        if (modal) modal.style.display = "none";
    }

    // --- C. LOGIC KLIK BACKGROUND MODAL (TUTUP) ---
    if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
    }

    // --- D. SWITCH LOGIN <-> REGISTER ---
    if (e.target.matches(".signup-link")) {
        e.preventDefault();
        const loginM = document.getElementById("loginModal");
        const signupM = document.getElementById("signupModal");
        if(loginM) loginM.style.display = "none";
        if(signupM) signupM.style.display = "flex";
    }
    if (e.target.matches(".login-link")) {
        e.preventDefault();
        const loginM = document.getElementById("loginModal");
        const signupM = document.getElementById("signupModal");
        if(signupM) signupM.style.display = "none";
        if(loginM) loginM.style.display = "flex";
    }

    // --- E. TOMBOL LOGIN (DI DALAM MODAL) ---
    if (e.target.matches(".login-btn") && e.target.id === "mainLoginBtn") {
        handleLogin(e);
    }
});

// =========================================================
// 4. LOGIC LOGIN & REGISTER (FUNGSI TERPISAH)
// =========================================================
async function handleLogin(e) {
    e.preventDefault();
    // Cari input SECARA DINAMIS (karena modal baru muncul)
    const emailInput = document.querySelector("#loginModal input[type='email']");
    const passInput = document.querySelector("#loginModal input[type='password']");
    
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passInput ? passInput.value.trim() : "";

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
            
            // Tutup modal
            const loginM = document.getElementById("loginModal");
            if(loginM) loginM.style.display = "none";

            if(data.user.role === 'admin') window.location.href = "admin.html";
            else window.location.href = "profile.html";
        } else alert(data.error || "Login Gagal");
    } catch (err) { alert("Gagal koneksi server"); }
}

// Event Listener Khusus Form Signup (Delegated)
document.addEventListener("submit", async (e) => {
    if (e.target.id === "signupForm") {
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
                document.getElementById("signupModal").style.display = "none";
                document.getElementById("loginModal").style.display = "flex";
            } else alert(data.error);
        } catch (err) { alert("Error koneksi"); }
    }
});

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
    
    // Load Order History (Sama seperti sebelumnya)
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
                        </div>`;
                    orderListEl.appendChild(div);
                });
            }
        }
    } catch (err) { if(document.getElementById("ordersList")) document.getElementById("ordersList").innerHTML = "<p>Gagal memuat pesanan.</p>"; }
}

// =========================================================
// 6. HALAMAN DETAIL PRODUK
// =========================================================
if (window.location.pathname.includes("product-detail.html")) {
    initProductDetail();
}

async function initProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error("Produk tidak ditemukan");
        
        const product = await response.json();
        let imgUrl = product.image_url;
        if (imgUrl && !imgUrl.startsWith('http')) imgUrl = `${API_URL.replace('/api', '')}/uploads/${imgUrl}`;

        if(document.querySelector(".product-image img")) document.querySelector(".product-image img").src = imgUrl;
        if(document.querySelector(".product-info h2")) document.querySelector(".product-info h2").textContent = product.product_name;
        if(document.querySelector(".price")) document.querySelector(".price").textContent = `Rp. ${parseInt(product.price).toLocaleString("id-ID")}`;
        if(document.querySelector(".desc")) document.querySelector(".desc").textContent = product.description || "Tidak ada deskripsi.";

        const addCartBtn = document.querySelector(".add-cart");
        if (addCartBtn) {
            const newBtn = addCartBtn.cloneNode(true);
            addCartBtn.parentNode.replaceChild(newBtn, addCartBtn);
            newBtn.addEventListener("click", (e) => {
                e.preventDefault();
                addToCartLogic(product);
            });
        }
    } catch (err) { console.error(err); }
}

async function addToCartLogic(product) {
    const token = localStorage.getItem("token");
    if (!token) {
        const loginM = document.getElementById("loginModal");
        if(loginM) loginM.style.display = "flex";
        else alert("Silakan login dulu!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/carts/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ product_id: product.product_id || product.id, quantity: 1 })
        });
        const data = await response.json();
        if (response.ok) {
            // Alert lebih cantik atau biasa
            alert("Berhasil masuk keranjang! 🌸");
            window.location.href = "cart.html";
        } else throw new Error(data.error);
    } catch (err) { alert("Gagal: " + err.message); }
}

// =========================================================
// 7. CART & CHECKOUT (SAMA SEPERTI SEBELUMNYA)
// =========================================================
if (window.location.pathname.includes("cart.html")) renderCartPage();

function renderCartPage() {
    const cartItems = document.querySelector(".cart-items");
    const totalEl = document.getElementById("cartTotal");
    if (!cartItems) return;
    
    const token = localStorage.getItem("token");
    if(!token) {
        cartItems.innerHTML = "<p>Silakan login untuk melihat keranjang.</p>";
        return;
    }

    // Fetch Cart dari Server (Bukan LocalStorage, biar sinkron)
    fetch(`${API_URL}/carts`, { headers: { 'Authorization': `Bearer ${token}` }})
    .then(res => res.json())
    .then(cart => {
        cartItems.innerHTML = "";
        let total = 0;
        if (!cart.CartItems || cart.CartItems.length === 0) {
            cartItems.innerHTML = "<p>Keranjang kosong 🌸</p>";
            if(totalEl) totalEl.textContent = "Rp. 0";
            return;
        }

        cart.CartItems.forEach(item => {
            const p = item.Product;
            const subtotal = parseFloat(p.price) * item.quantity;
            total += subtotal;
            
            let img = p.image_url;
            if (img && !img.startsWith('http')) img = `${API_URL.replace('/api', '')}/uploads/${img}`;

            cartItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-left">
                    <img src="${img}" alt="${p.product_name}">
                    <div class="cart-info"><b>${p.product_name}</b><p>Ready Stock</p></div>
                </div>
                <div class="cart-right">
                    <div class="qty-control"><span>${item.quantity} x</span></div>
                    <b>Rp. ${subtotal.toLocaleString("id-ID")}</b>
                </div>
            </div>`;
        });
        if(totalEl) totalEl.textContent = `Rp. ${total.toLocaleString("id-ID")}`;
        
        // Simpan data cart ke localStorage untuk checkout page
        localStorage.setItem("checkoutCart", JSON.stringify(cart.CartItems.map(i => ({
            id: i.product_id,
            name: i.Product.product_name,
            price: parseFloat(i.Product.price),
            img: i.Product.image_url && !i.Product.image_url.startsWith('http') ? `${API_URL.replace('/api', '')}/uploads/${i.Product.image_url}` : i.Product.image_url,
            quantity: i.quantity
        }))));
    })
    .catch(e => console.error(e));
}

window.checkoutCart = function() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Silakan Login dulu!");
    // Cek apakah cart kosong lewat localStorage checkoutCart yang baru disimpan
    const c = JSON.parse(localStorage.getItem("checkoutCart"));
    if(!c || c.length === 0) return alert("Keranjang kosong!");
    
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
        if(subtotalEl) subtotalEl.textContent = `Rp. ${subtotal.toLocaleString("id-ID")}`;
    }

    function calculateTotal() {
        const type = deliveryTypeSelect ? deliveryTypeSelect.value : "Delivery";
        let deliveryFee = (type === "Delivery") ? 25000 : 0;
        const grandTotal = subtotal + deliveryFee + handlingFee;
        if(deliveryEl) deliveryEl.textContent = `Rp. ${deliveryFee.toLocaleString("id-ID")}`;
        if(totalEl) totalEl.textContent = `Rp. ${grandTotal.toLocaleString("id-ID")}`;
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
            const deliveryDate = document.getElementById("deliveryDate")?.value;
            
            if (!recipientName || !recipientPhone || !deliveryDate) return alert("Mohon lengkapi Nama, HP, dan Tanggal!");

            payBtn.textContent = "Processing...";
            payBtn.disabled = true;

            try {
                const res = await fetch(`${API_URL}/orders/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        recipient_name: recipientName,
                        recipient_phone: recipientPhone,
                        sender_phone: document.getElementById("senderPhone")?.value || "-",
                        address_line: document.getElementById("address")?.value || "Ambil Sendiri",
                        province: document.getElementById("province")?.value || "-",
                        postal_code: document.getElementById("postalCode")?.value || "-",
                        delivery_type: deliveryTypeSelect ? deliveryTypeSelect.value : "Delivery",
                        delivery_date: deliveryDate,
                        delivery_time: document.getElementById("deliveryTime")?.value || "09:00 - 15:00",
                        message_card: document.getElementById("checkoutAdditional")?.value
                    })
                });
                if (res.ok) {
                    alert("✅ Pesanan Berhasil!");
                    localStorage.removeItem("checkoutCart");
                    window.location.href = "profile.html";
                } else {
                    const d = await res.json();
                    throw new Error(d.error);
                }
            } catch (err) { alert("Gagal: " + err.message); payBtn.textContent = "PAY NOW"; payBtn.disabled = false; }
        });
    }
}