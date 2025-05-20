document.addEventListener("DOMContentLoaded", function () {
    fetch('/-BohrnAgain/BackEnd/logic/productController.php')
        .then(response => response.json())
        .then(products => renderProducts(products))
        .catch(error => console.error('Fehler beim Laden der Produkte:', error));
});

function renderProducts(products) {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    products.forEach(product => {
        const card = `
            <div class="col-md-4">
                <div class="card mb-4">
                    <img src="/-BohrnAgain/BackEnd/productpictures/${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p><strong>${parseFloat(product.price).toFixed(2)} €</strong></p>
                        <p>Bewertung: ${product.rating} / 5</p>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });

}
document.addEventListener("DOMContentLoaded", function () {
    fetch('/-BohrnAgain/BackEnd/logic/categoryController.php')
        .then(response => response.json())
        .then(data => {
            const categoryBar = document.getElementById('category-bar');
            categoryBar.innerHTML = '';

            data.forEach((category, index) => {
                const link = document.createElement('button');
                link.textContent = category.name;
                link.classList.add('btn', 'btn-outline-primary', 'me-2');
                if (index === 0) {
                    link.classList.add('active');
                    fetchAndRenderProducts(category.id);
                }
                link.addEventListener('click', () => {
                    document.querySelectorAll('#category-bar .btn').forEach(btn => btn.classList.remove('active'));
                    link.classList.add('active');
                    fetchAndRenderProducts(category.id);
                });
                categoryBar.appendChild(link);
            });
        })
        .catch(error => console.error('Fehler beim Laden der Kategorien:', error));
});

function fetchAndRenderProducts(categoryId) {
    fetch('/-BohrnAgain/BackEnd/logic/productController.php?category_id=' + categoryId)
        .then(response => response.json())
        .then(products => renderProducts(products))
        .catch(error => console.error('Fehler beim Laden der Produkte:', error));
}

function renderProducts(products) {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-4';

        card.innerHTML = `
            <div class="card mb-4">
                <img src="/-BohrnAgain/BackEnd/productpictures/${product.image}" class="card-img-top; style="width: 500px; height: 500px; object-fit: cover;" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p><strong>${parseFloat(product.price).toFixed(2)} €</strong></p>
                    <p>Bewertung: ${product.rating} / 5</p>
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
        headers: {
            'Content-Type': 'application/json'
        },
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

document.addEventListener("DOMContentLoaded", function () {
    fetch('/-BohrnAgain/BackEnd/logic/cart.php')
        .then(response => response.json())
        .then(data => updateCartCount(data.cartCount))
        .catch(error => console.error('Fehler beim Abrufen der Warenkorbanzahl:', error));
});









