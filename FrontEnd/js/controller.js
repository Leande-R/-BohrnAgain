let allProducts = [];
let selectedCategoryId = null;

document.addEventListener("DOMContentLoaded", function () {
    const categoryBar = document.getElementById('category-bar');
    const searchInput = document.getElementById('search-input');

    // 1. Erst Produkte laden (einmalig)
    fetch('/-BohrnAgain/BackEnd/logic/productController.php')
        .then(response => response.json())
        .then(products => {
            allProducts = products;
            renderProducts(allProducts);
        })
        .catch(error => console.error('Fehler beim Laden der Produkte:', error));

    // 2. Kategorien laden und Buttons setzen
    fetch('/-BohrnAgain/BackEnd/logic/categoryController.php')
        .then(response => response.json())
        .then(categories => {
            categoryBar.innerHTML = '';

            // Button: "Alle Produkte"
            const allBtn = document.createElement('button');
            allBtn.textContent = 'Alle Produkte';
            allBtn.classList.add('btn', 'btn-outline-primary', 'me-2', 'active');
            allBtn.addEventListener('click', () => {
                activateCategoryButton(allBtn, null);
                renderProducts(allProducts); // Alle anzeigen
            });
            categoryBar.appendChild(allBtn);

            // Kategorie-Buttons
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

        })
        .catch(error => console.error('Fehler beim Laden der Kategorien:', error));

    // 3. Suche live filtern
    if (searchInput) {
    searchInput.addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();

        let filtered = allProducts;

        if (selectedCategoryId !== null) {
            filtered = filtered.filter(p => p.category_id == selectedCategoryId);
        }

        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query)
        );

        renderProducts(filtered);
    });
}

    // 4. Warenkorb-Status abrufen
    fetch('/-BohrnAgain/BackEnd/logic/cart.php')
        .then(response => response.json())
        .then(data => updateCartCount(data.cartCount))
        .catch(error => console.error('Fehler beim Abrufen der Warenkorbanzahl:', error));
});

function activateCategoryButton(activeBtn, categoryId = null) {
    document.querySelectorAll('#category-bar .btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
    document.getElementById('search-input').value = ''; // Suche leeren beim Kategorie-Wechsel
    selectedCategoryId = categoryId; // merken, was ausgewählt ist
}


function filterByCategory(categoryId) {
    const filtered = allProducts.filter(product => product.category_id == categoryId);
    renderProducts(filtered);
}

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

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    fetch('/-BohrnAgain/BackEnd/logic/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId })
    })
        .then(response => {
            if (!response.ok) throw new Error("Serverfehler");
            return response.json();
        })
        .then(data => {
            if (data.success) {
                updateCartCount(data.cartCount);
            } else {
                console.error("Fehler beim Hinzufügen:", data.error);
            }
        })
        .catch(error => console.error('Fehler beim Hinzufügen zum Warenkorb:', error));
}

function updateCartCount(count) {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}
