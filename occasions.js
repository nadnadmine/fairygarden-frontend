console.log("✅ JavaScript jalan!");

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "all";

  const grid = document.getElementById("product-grid");
  const title = document.getElementById("category-title");
  const desc = document.getElementById("category-desc");
  const sortSelect = document.getElementById("sort");

  const defaultProducts = [
    { id: "rose-harmony", name: "Rose Harmony", price: 250000, category: "mothersday", img: "https://i.pinimg.com/1200x/68/a1/48/68a14894f37c6659176c61a20a57bb0d.jpg", sold: 90, stock: 15 },
    { id: "lily-blossom", name: "Lily Blossom", price: 275000, category: "mothersday", img: "https://i.pinimg.com/736x/99/e2/ab/99e2ab5199035c32e4a4b1f564e76d0c.jpg", sold: 100, stock: 20 },
    { id: "tulip-delight", name: "Tulip Delight", price: 300000, category: "graduation", img: "https://i.pinimg.com/736x/bd/6a/ec/bd6aec14520f3b5763ac221063db719e.jpg", sold: 60, stock: 12 },
    { id: "peony-grace", name: "Peony Grace", price: 285000, category: "anniversary", img: "https://i.pinimg.com/736x/84/86/2b/84862b87ef673479e8487f2dd549c75e.jpg", sold: 110, stock: 18 },
    { id: "sunflower-joy", name: "Sunflower Joy", price: 260000, category: "birthday", img: "https://i.pinimg.com/1200x/93/ab/8c/93ab8c4747d23016d3b6cbc1194c0a63.jpg", sold: 80, stock: 25 },
    { id: "daisy-charm", name: "Daisy Charm", price: 230000, category: "birthday", img: "https://i.pinimg.com/736x/1e/df/fb/1edffbba617cbfe9c3576aead8e823ee.jpg", sold: 95, stock: 30 },
    { id: "orchid-dream", name: "Orchid Dream", price: 350000, category: "justbecause", img: "https://i.pinimg.com/1200x/14/2f/b2/142fb23313806b79364dd24c19447b8a.jpg", sold: 30, stock: 10 },
    { id: "carnation-bliss", name: "Carnation Bliss", price: 240000, category: "mothersday", img: "https://i.pinimg.com/1200x/9e/71/1e/9e711e33e43ad8a805459c941bd8ff01.jpg", sold: 70, stock: 22 },
    { id: "lavender-love", name: "Lavender Love", price: 290000, category: "justbecause", img: "https://i.pinimg.com/736x/7c/ab/1c/7cab1c081e2211b0af3f765c540b3e78.jpg", sold: 50, stock: 15 },
    { id: "blossom-mist", name: "Blossom Mist", price: 320000, category: "anniversary", img: "https://i.pinimg.com/1200x/78/a3/c6/78a3c641f7d072737f7863a717dceffb.jpg", sold: 45, stock: 10 },
    { id: "amber-bloom", name: "Amber Bloom", price: 310000, category: "graduation", img: "https://i.pinimg.com/736x/49/9d/fb/499dfb1283be3f4302e4abcba2caa7f5.jpg", sold: 40, stock: 12 },
    { id: "jasmine-glow", name: "Jasmine Glow", price: 270000, category: "justbecause", img: "https://i.pinimg.com/1200x/46/46/71/4646713996cc34ab86615629f1b60289.jpg", sold: 60, stock: 20 },
    { id: "morning-dew", name: "Morning Dew", price: 260000, category: "birthday", img: "https://i.pinimg.com/736x/d5/6d/23/d56d2305d1527fa33896572a2b18427c.jpg", sold: 70, stock: 18 },
    { id: "cherry-petal", name: "Cherry Petal", price: 255000, category: "justbecause", img: "https://i.pinimg.com/736x/e1/0b/ba/e10bbada0ece4c4c753717fe8b164f92.jpg", sold: 40, stock: 25 },
    { id: "garden-kiss", name: "Garden Kiss", price: 330000, category: "birthday", img: "https://i.pinimg.com/736x/1f/56/0c/1f560c0c5d32f995047c2385301f2cb9.jpg", sold: 40, stock: 10 },
    { id: "magnolia-dream", name: "Magnolia Dream", price: 340000, category: "justbecause", img: "https://i.pinimg.com/1200x/c3/03/a4/c303a4f2e6ece3bbc1261debdff048ed.jpg", sold: 50, stock: 10 },
    { id: "sweet-pea", name: "Sweet Pea", price: 265000, category: "anniversary", img: "https://i.pinimg.com/1200x/72/db/e4/72dbe498c634f83740944007f3a342eb.jpg", sold: 50, stock: 15 },
    { id: "spring-waltz", name: "Spring Waltz", price: 295000, category: "anniversary", img: "https://i.pinimg.com/736x/7f/ac/b2/7facb2844c9179a9cd21f651e662233f.jpg", sold: 80, stock: 12 },
    { id: "evening-charm", name: "Evening Charm", price: 310000, category: "graduation", img: "https://i.pinimg.com/1200x/7c/e7/77/7ce777fc884d61cb2bdb9b70c7e2b407.jpg", sold: 90, stock: 10 },
    { id: "peach-blossom", name: "Peach Blossom", price: 280000, category: "mothersday", img: "https://i.pinimg.com/1200x/3f/2e/13/3f2e131e40a21ee150c3dc15b1aeb0c3.jpg", sold: 45, stock: 15 }
  ];

  const adminProducts = JSON.parse(localStorage.getItem("products")) || [];
  const allProducts = [...defaultProducts, ...adminProducts];

  const categoryTexts = {
    birthday: { title: "BIRTHDAY FLOWERS", desc: "Rayakan ulang tahunmu dengan bunga cantik 🎂"},
    justbecause: { title: "JUST BECAUSE", desc: "Bunga yang dikirim tanpa alasan, tapi tetap penuh cinta 💐" },
    mothersday: { title: "MOTHER’S DAY", desc: "Bunga lembut penuh kasih untuk ibu tercinta 🌷" },
    anniversary: { title: "ANNIVERSARY", desc: "Rayakan momen cinta abadi dengan bunga spesial 💞" },
    graduation: { title: "GRADUATION", desc: "Bunga untuk merayakan pencapaian dan semangat baru 🎓" },
    all: { title: "ALL OCCASIONS", desc: "Temukan bunga terbaik untuk berbagai momen spesial 🌸" },
  };

  title.textContent = categoryTexts[category]?.title || "All Occasions";
  desc.textContent = categoryTexts[category]?.desc || "Temukan bunga terbaik untuk berbagai momen spesial 🌸";

let filtered = category === "all" ? allProducts : allProducts.filter(p => p.category === category);

  function renderProducts(list) {
    // Perbaikan: Pastikan p.id ada sebelum membuat link
    grid.innerHTML = list.map(p => {
      const productId = p.id || p.name.toLowerCase().replace(/\s+/g, '-');
      return `
      <a href="product-detail.html?id=${productId}" class="product-card">
        <img src="${p.img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">Rp. ${p.price.toLocaleString("id-ID")}</p>
      </a>`
  }).join("");
}

  renderProducts(filtered);

  sortSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "lowest") filtered.sort((a,b) => a.price - b.price);
    if (val === "highest") filtered.sort((a,b) => b.price - a.price);
    if (val === "bestselling") filtered.sort((a,b) => (b.sold || 0) - (a.sold || 0));
    renderProducts(filtered);
  });
});