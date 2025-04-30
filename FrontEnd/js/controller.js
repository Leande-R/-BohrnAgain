// Produkte laden und anzeigen
document.addEventListener("DOMContentLoaded", function () {
    fetch('../BackEnd/config/products.php')
        .then(response => response.json())
        .then(products => renderProducts(products))
        .catch(error => console.error('Fehler beim Laden der Produkte:', error));
});

// Kategorien laden und anzeigen
document.addEventListener("DOMContentLoaded", function () {
    fetch('../BackEnd/logic/categoryController.php')
        .then(response => response.json())
        .then(data => {
            const categoryBar = document.getElementById('category-bar');
            data.forEach(category => {
                const link = document.createElement('a');
                link.href = `index.html?category_id=${category.id}`; // später Filter
                link.textContent = category.name;
                link.classList.add('btn', 'btn-outline-primary', 'me-2');
                categoryBar.appendChild(link);
            });
        })
        .catch(error => console.error('Fehler beim Laden der Kategorien:', error));
});

// Produkte rendern inkl. "In den Warenkorb"-Button
function renderProducts(products) {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-4';

        card.innerHTML = `
            <div class="card mb-4">
                <img src="../BackEnd/productpictures/${product.image}" class="card-img-top" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Kein+Bild';">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p><strong>${parseFloat(product.price).toFixed(2)} €</strong></p>
                    <p>Bewertung: ${product.rating} / 5</p>
                </div>
            </div>
        `;

        const button = document.createElement('button');
        button.textContent = "In den Warenkorb";
        button.classList.add('btn', 'btn-primary', 'mt-2');
        button.addEventListener('click', () => {
            addToCart(product);
            button.textContent = "Hinzugefügt";
            button.disabled = true;
        });

        card.querySelector('.card-body').appendChild(button);
        container.appendChild(card);
    });
}

// Produkt zum localStorage-Warenkorb hinzufügen
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Zähler im Warenkorb aktualisieren
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').textContent = cart.length;
}

// Bei jedem Laden: Zähler sofort setzen
document.addEventListener("DOMContentLoaded", updateCartCount);

function removeFromCartBackend(productId) {
    fetch('../BackEnd/logic/cartController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log("Produkt entfernt:", productId);
            renderCart(); // oder eine andere Funktion zum Aktualisieren
        } else {
            console.error("Fehler:", data.message);
        }
    })
    .catch(err => console.error("Netzwerkfehler:", err));
}

button.addEventListener('click', () => {
    removeFromCartBackend(item.id);
});