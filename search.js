document.addEventListener("DOMContentLoaded", () => {
  const defaultProducts = [
    { id: "rose-harmony", name: "Rose Harmony", category: "Birthday", stock: 15, price: 250000, img: "https://i.pinimg.com/1200x/68/a1/48/68a14894f37c6659176c61a20a57bb0d.jpg", sold: 90 },
    { id: "lily-blossom", name: "Lily Blossom", category: "Mother's Day", stock: 20, price: 275000, img: "https://i.pinimg.com/736x/99/e2/ab/99e2ab5199035c32e4a4b1f564e76d0c.jpg", sold: 100 },
    { id: "tulip-delight", name: "Tulip Delight", category: "Graduation", stock: 12, price: 300000, img: "https://i.pinimg.com/736x/bd/6a/ec/bd6aec14520f3b5763ac221063db719e.jpg", sold: 60},
    { id: "peony-grace", name: "Peony Grace", category: "Anniversary", stock: 18, price: 285000, img: "https://i.pinimg.com/736x/84/86/2b/84862b87ef673479e8487f2dd549c75e.jpg", sold: 110 },
    { id: "sunflower-joy", name: "Sunflower Joy", category: "Birthday", stock: 25, price: 260000, img: "https://i.pinimg.com/1200x/93/ab/8c/93ab8c4747d23016d3b6cbc1194c0a63.jpg", sold: 80 },
    { id: "daisy-charm", name: "Daisy Charm", category: "Birthday", stock: 30, price: 230000, img: "https://i.pinimg.com/736x/1e/df/fb/1edffbba617cbfe9c3576aead8e823ee.jpg", sold: 95 },
    { id: "orchid-dream", name: "Orchid Dream", category: "Just Because", stock: 10, price: 350000, img: "https://i.pinimg.com/1200x/14/2f/b2/142fb23313806b79364dd24c19447b8a.jpg", sold: 30},
    { id: "carnation-bliss", name: "Carnation Bliss", category: "Mother's Day", stock: 22, price: 240000, img: "https://i.pinimg.com/1200x/9e/71/1e/9e711e33e43ad8a805459c941bd8ff01.jpg", sold: 75 }
    // ... (Tambahkan semua produk default di sini)
  ];

  const productsFromStorage = JSON.parse(localStorage.getItem("products"));
  const products = (productsFromStorage && productsFromStorage.length > 0) 
    ? productsFromStorage 
    : defaultProducts;

  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q")?.toLowerCase().trim() || "";
  const searchTitle = document.getElementById("searchTitle");
  const searchGrid = document.getElementById("searchGrid");

  const results = products.filter(p =>
    (p.name + " " + p.id).toLowerCase().includes(query)
  );

  if (query) {
    searchTitle.textContent = `${results.length} Results for "${query}"`;
  } else {
    searchTitle.textContent = "No keyword entered.";
  }

  if (results.length > 0) {
    searchGrid.innerHTML = results.map(p => `
      <a href="product-detail.html?id=${p.id}" class="product-card">
        <div class="product-box">
          <img src="${p.img}" alt="${p.name}">
        </div>
        <b>${p.name}</b>
        <div>Rp. ${p.price.toLocaleString("id-ID")}</div>
      </a>
    `).join("");
  } else {
    searchGrid.innerHTML = `<p style="grid-column: 1 / -1;">No results found for "${query}".</p>`;
  }

  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const keyword = searchInput.value.trim();
      if (keyword) {
        window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const keyword = searchInput.value.trim();
        if (keyword) {
          window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
        }
      }
    });
  }
});