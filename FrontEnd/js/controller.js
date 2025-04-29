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
document.addEventListener("DOMContentLoaded", function() {
    fetch('../BackEnd/logic/categoryController.php')
        .then(response => response.json())
        .then(data => {
            const categoryBar = document.getElementById('category-bar');
            data.forEach(category => {
                const link = document.createElement('a');
                link.href = `index.html?category_id=${category.id}`; // später Filter
                link.textContent = category.name;
                link.classList.add('btn', 'btn-outline-primary', 'me-2'); // Bootstrap Style
                categoryBar.appendChild(link);
            });
        })
        .catch(error => console.error('Fehler beim Laden der Kategorien:', error));
});









