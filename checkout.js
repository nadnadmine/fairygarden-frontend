document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("checkout.html")) return;

  const itemsContainer = document.getElementById("checkoutItems");
  const subtotalEl = document.getElementById("subtotal");
  const deliveryEl = document.getElementById("delivery");
  const serviceEl = document.getElementById("service");
  const totalEl = document.getElementById("total");
  const payBtn = document.getElementById("payNow");
  const qrisRadio = document.getElementById("qris");
  const qrisDetail = document.getElementById("qrisDetail");
  const hideQris = document.getElementById("hideQris");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const orderDetails = JSON.parse(localStorage.getItem("orderDetails")) || {};
  const deliveryForm = JSON.parse(localStorage.getItem("checkoutDelivery")) || {};
  const user = JSON.parse(localStorage.getItem("userData")) || null;

  const deliveryFee = 25000;
  const serviceFee = 10000;

  function fmt(num) {
    return "Rp. " + (num || 0).toLocaleString("id-ID");
  }

  // === ORDER ID GENERATOR ===
  function generateOrderID() {
  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  return allOrders.length + 1;
}


  // === RENDER CHECKOUT ITEMS ===
 function renderCheckout() {
  itemsContainer.innerHTML = "";
  
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const div = document.createElement("div");
    div.className = "checkout-item";

    div.innerHTML = `
      <div class="item-image">
        <img src="${item.img}" alt="${item.name}" 
             width="80" height="80"
             style="border-radius:8px;object-fit:cover;">
      </div>

      <div class="item-details">
        <div class="item-name">${item.name}</div>

        <div class="item-info">
          <p>Delivery Option: ${orderDetails.deliveryOption || "-"}</p>
          <p>Delivery Date: ${orderDetails.deliveryDate || "-"}</p>
          <p>Delivery Time: ${orderDetails.deliveryTime || "-"}</p>

          <p>Sender Name: ${orderDetails.senderName || "-"}</p>
          <p>Sender Phone: ${orderDetails.senderPhone || "-"}</p>

          <p>From: ${orderDetails.msgFrom || "-"}</p>
          <p>To: ${orderDetails.msgTo || "-"}</p>
          <p>Message: ${orderDetails.msgText || "-"}</p>

          <p><b>Order Note:</b> ${localStorage.getItem("orderNote") || "-"}</p>
        </div>
      </div>

      <div class="item-price">${fmt(itemTotal)}</div>
    `;

    itemsContainer.appendChild(div);
  });

  // === UPDATE SUMMARY ===
  subtotalEl.textContent = fmt(subtotal);
  deliveryEl.textContent = fmt(deliveryFee);
  serviceEl.textContent = fmt(serviceFee);
  totalEl.textContent = fmt(subtotal + deliveryFee + serviceFee);
}

renderCheckout();

  // === PILIH QRIS ===
  if (qrisRadio) {
    qrisRadio.addEventListener("change", () => {
      if (qrisRadio.checked) {
        qrisDetail.style.display = "block";
        qrisDetail.scrollIntoView({ behavior: "smooth" });
      } else {
        qrisDetail.style.display = "none";
      }
    });
  }

  // === PAY NOW ===
  if (payBtn) {
    payBtn.addEventListener("click", () => {
      if (!qrisRadio.checked) {
        alert("Pilih metode pembayaran terlebih dahulu 🌸");
        return;
      }

      const additionalInfo =
        document.getElementById("checkoutAdditional")?.value || "-";

      const address = document.getElementById("address").value || "-";
      const province = document.getElementById("province").value || "-";
      const postalCode = document.getElementById("postal").value || "-";
      const phone = document.getElementById("phone").value || "-";

      let allOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const userEmail = user?.email || "guest@example.com";

      cart.forEach(item => {
        allOrders.push({
          orderID: generateOrderID(),
          createdAt: Date.now(), // <— WAJIB untuk admin dashboard

          userEmail,
          name: item.name,
          img: item.img,
          quantity: item.quantity,

          price: fmt(item.price * item.quantity),
          totalPrice: fmt(item.price * item.quantity + deliveryFee + serviceFee),

          deliveryOption: orderDetails.deliveryOption || "-",
          deliveryDate: orderDetails.deliveryDate || "-",
          deliveryTime: orderDetails.deliveryTime || "-",
          senderName: orderDetails.senderName || "-",
          senderPhone: orderDetails.senderPhone || "-",
          msgFrom: orderDetails.msgFrom || "-",
          msgTo: orderDetails.msgTo || "-",
          msgText: orderDetails.msgText || "-",

          orderNote: localStorage.getItem("orderNote") || "-",

          address,
          province,
          postalCode,
          phone,

          deliveryInfo: additionalInfo
        });
      });

      localStorage.setItem("orders", JSON.stringify(allOrders));
      localStorage.removeItem("cart");
      localStorage.removeItem("orderDetails");
      localStorage.removeItem("checkoutDelivery");

      alert("Pembayaran berhasil! Pesanan kamu sudah masuk ke profil 💐");
      window.location.href = "profile.html";
    });
  }

  // === TUTUP QR TANPA BAYAR ===
  if (hideQris) {
    hideQris.addEventListener("click", () => {
      qrisDetail.style.display = "none";
    });
  }
});