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

document.addEventListener("DOMContentLoaded", function () {
    fetch('../BackEnd/logic/checkSession.php')
        .then(response => response.json())
        .then(data => {
            const navbar = document.getElementById('navbar');

            if (data.loggedIn) {
                if (data.role === 'admin') {
                    navbar.innerHTML = `
                        <a href="index.html">Home</a>
                        <a href="productsManage.html">Produkte bearbeiten</a>
                        <a href="customersManage.html">Kunden verwalten</a>
                        <a href="../BackEnd/logic/logout.php">Logout</a>
                    `;
                } else {
                    navbar.innerHTML = `
                        <a href="index.html">Home</a>
                        <a href="products.html">Produkte</a>
                        <a href="account.html">Mein Konto</a>
                        <a href="../BackEnd/logic/logout.php">Logout</a>
                    `;
                }
            } else {
                navbar.innerHTML = `
                    <a href="index.html">Home</a>
                    <a href="products.html">Produkte</a>
                    <a href="login.html">Login</a>
                `;
            }
        });
});


function loadNavbarAndInitMenu() {
    fetch('../FrontEnd/sites/navbar.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
        })
        .then(() => initNavigation()); // Danach Links setzen
}

function initNavigation() {
    fetch('../BackEnd/logic/checkSession.php')
        .then(response => response.json())
        .then(data => {
            const navLinks = document.getElementById('nav-links');
            navLinks.innerHTML = '';

            if (data.loggedIn) {
                if (data.role === 'admin') {
                    navLinks.innerHTML = `
                        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="productsManage.html">Produkte bearbeiten</a></li>
                        <li class="nav-item"><a class="nav-link" href="customersManage.html">Kunden verwalten</a></li>
                        <li class="nav-item"><a class="nav-link" href="vouchers.html">Gutscheine</a></li>
                        <li class="nav-item"><a class="nav-link" href="../BackEnd/logic/logout.php">Logout</a></li>
                    `;
                } else {
                    navLinks.innerHTML = `
                        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="products.html">Produkte</a></li>
                        <li class="nav-item"><a class="nav-link" href="account.html">Mein Konto</a></li>
                        <li class="nav-item"><a class="nav-link" href="cart.html">Warenkorb</a></li>
                        <li class="nav-item"><a class="nav-link" href="../BackEnd/logic/logout.php">Logout</a></li>
                    `;
                }
            } else {
                navLinks.innerHTML = `
                    <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="products.html">Produkte</a></li>
                    <li class="nav-item"><a class="nav-link" href="cart.html">Warenkorb</a></li>
                    <li class="nav-item"><a class="nav-link" href="../FrontEnd/sites/login.html">Login</a></li>
                `;
            }
        });
}

// Starte alles, wenn DOM geladen ist
document.addEventListener("DOMContentLoaded", loadNavbarAndInitMenu);

