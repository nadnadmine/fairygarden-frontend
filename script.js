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
// 2. LOAD PRODUK
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
                    
                    alert(`Halo, ${data.user.first_name}!`);
                    if(data.user.role === 'admin') window.location.href = "admin.html";
                    else window.location.href = "profile.html";
                } else alert(data.error || "Login Gagal");
            } catch (err) { alert("Gagal koneksi server"); }
        });
    }
}
// ... (Bagian Register Signup sama, bisa di-skip kalau sudah ada)

// =========================================================
// 5. HALAMAN PROFILE (PERBAIKAN 'UNDEFINED')
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
            // FIX DISINI: Pastikan pakai first_name (bukan firstName)
            const fName = user.first_name || user.firstName || ""; 
            const lName = user.last_name || user.lastName || "";
            
            document.getElementById("greeting").textContent = `Hi, ${fName} ${lName}!`;
            document.getElementById("firstName").value = fName;
            document.getElementById("lastName").value = lName;
            document.getElementById("email").value = user.email;
            document.getElementById("phone").value = user.phone || '';
        }
    } catch (err) { console.error("Gagal load profile", err); }
    
    // Load Order History... (sama seperti sebelumnya)
}

// =========================================================
// 6. ADD TO CART LOGIC (FIX DATABASE ERROR)
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
                const newBtn = addCartBtn.cloneNode(true); // Hapus listener lama
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
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Silakan login dulu! 🌸");
        if(loginModal) loginModal.style.display = "flex";
        return;
    }

    try {
        // PERHATIKAN: HANYA KIRIM DATA INI AGAR TIDAK ERROR DATABASE
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
            // Update Tampilan Browser
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

// ... (Sisa kode Cart Page & Checkout Page tetap sama, sudah benar)