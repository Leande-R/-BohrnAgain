let allProducts = [];           // Alle Produkte (global gespeichert)
let selectedCategoryId = null; // Aktuell ausgewählte Kategorie

document.addEventListener("DOMContentLoaded", function () {
    const categoryBar = document.getElementById('category-bar');
    const searchInput = document.getElementById('search-input');

    // 1. Produkte einmalig vom Server laden und anzeigen
    fetch('/-BohrnAgain/BackEnd/logic/productController.php')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            renderProducts(allProducts);
        });

    // 2. Kategorien laden und Buttons dynamisch erzeugen
    fetch('/-BohrnAgain/BackEnd/logic/categoryController.php')
        .then(response => response.json())
        .then(categories => {
            categoryBar.innerHTML = '';

            // Button für „Alle Produkte“
            const allBtn = document.createElement('button');
            allBtn.textContent = 'Alle Produkte';
            allBtn.classList.add('btn', 'btn-outline-primary', 'me-2', 'active');
            allBtn.addEventListener('click', () => {
                activateCategoryButton(allBtn, null);
                renderProducts(allProducts);
            });
            categoryBar.appendChild(allBtn);

            // Buttons für jede einzelne Kategorie
            categories.forEach(category => {
                const btn = document.createElement('button');
                btn.textContent = category.name;
                btn.classList.add('btn', 'btn-outline-primary', 'me-2');
                btn.addEventListener('click', () => {
                    activateCategoryButton(btn, category.id);
                    filterByCategory(category.id);
                });
                categoryBar.appendChild(btn);
            });
        });

    // 3. Produktsuche über Eingabefeld (live)
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.trim().toLowerCase();
            let filtered = allProducts;

            // Optional nach Kategorie filtern
            if (selectedCategoryId !== null) {
                filtered = filtered.filter(p => p.category_id == selectedCategoryId);
            }

            // Produktsuche nach Name
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query)
            );

            renderProducts(filtered);
        });
    }

    // 4. Anzahl der Artikel im Warenkorb anzeigen
    fetch('/-BohrnAgain/BackEnd/logic/cart.php')
        .then(response => response.json())
        .then(data => updateCartCount(data.cartCount));
});

// Markiert aktiven Kategorie-Button visuell und setzt Filter zurück
function activateCategoryButton(activeBtn, categoryId = null) {
    document.querySelectorAll('#category-bar .btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
    document.getElementById('search-input').value = ''; // Suchfeld zurücksetzen
    selectedCategoryId = categoryId;
}

// Filtert Produktliste nach gewählter Kategorie
function filterByCategory(categoryId) {
    const filtered = allProducts.filter(product => product.category_id == categoryId);
    renderProducts(filtered);
}

// Baut die Produktkarten im DOM
function renderProducts(products) {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    if (!products || products.length === 0) {
        container.innerHTML = '<p>Keine Produkte gefunden.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-4';

        card.innerHTML = `
            <div class="card mb-4">
                <img src="/-BohrnAgain/BackEnd/productpictures/${product.image}" class="card-img-top product-image" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p><strong>${parseFloat(product.price).toFixed(2)} €</strong></p>
                    <p>Bewertung:⭐ ${product.rating} / 5</p>
                    <button class="btn btn-success add-to-cart-btn" data-id="${product.id}">In den Warenkorb</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // „In den Warenkorb“-Buttons aktivieren
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

// Fügt ein Produkt zum Warenkorb hinzu (POST)
function addToCart(productId) {
    fetch('/-BohrnAgain/BackEnd/logic/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartCount(data.cartCount);
        } else {
            console.error("Fehler beim Hinzufügen:", data.error);
        }
    });
}

// Aktualisiert die Warenkorbanzahl in der Navbar
function updateCartCount(count) {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}
