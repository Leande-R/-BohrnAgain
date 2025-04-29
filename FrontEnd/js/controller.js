document.addEventListener("DOMContentLoaded", function () {
    fetch('../BackEnd/config/products.php')
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
                    <img src="../BackEnd/productpictures/${product.image}" class="card-img-top" alt="${product.name}">
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








