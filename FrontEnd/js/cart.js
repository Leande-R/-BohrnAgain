document.addEventListener("DOMContentLoaded", function () {
    // Holt die Inhalte des Warenkorbs vom Server und zeigt sie an
    fetch('/-BohrnAgain/BackEnd/logic/cart.php')
        .then(response => response.json())
        .then(data => renderCart(data));

    // Separater Request nur für die Anzahl der Artikel im Warenkorb
    fetch('/-BohrnAgain/BackEnd/logic/cart.php', {
        headers: { 'X-Cart-Count': '1' }
    })
        .then(response => response.json())
        .then(data => {
            if (data.cartCount !== undefined) {
                updateCartCount(data.cartCount);
            }
        });
});

// Baut die Warenkorb-Anzeige dynamisch auf
function renderCart(items) {
    const container = document.getElementById('cart-items');
    const totalDiv = document.getElementById('cart-total');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p>Dein Warenkorb ist leer.</p>';
        totalDiv.textContent = '';
        return;
    }

    let totalSum = 0;

    items.forEach(item => {
        totalSum += item.total;

        const card = document.createElement('div');
        card.className = 'card mb-2';

        // HTML-Block für jedes Produkt im Warenkorb
        card.innerHTML = `
            <div class="card-body d-flex gap-3">
                <img src="/-BohrnAgain/BackEnd/productpictures/${item.image}" alt="${item.name}" style="width: 100px;">
                <div class="flex-grow-1">
                    <h5>${item.name}</h5>
                    <div class="input-group input-group-sm" style="max-width: 160px;">
                        <button class="btn btn-outline-secondary btn-decrease" data-id="${item.id}">−</button>
                        <input type="number" class="form-control text-center quantity-input" min="1" value="${item.quantity}" data-id="${item.id}">
                        <button class="btn btn-outline-secondary btn-increase" data-id="${item.id}">+</button>
                    </div>
                    <p class="mt-2">${item.price.toFixed(2)} € pro Stück</p>
                    <p>${item.description}</p>
                </div>
                <div class="text-end">
                    <strong>${item.total.toFixed(2)} €</strong><br>
                    <button class="btn btn-sm btn-danger mt-2 btn-remove" data-id="${item.id}">Entfernen</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    totalDiv.textContent = `Gesamtsumme: ${totalSum.toFixed(2)} €`;

    // Verknüpft Buttons mit ihren Funktionen
    attachQuantityHandlers();
}

// Aktiviert die Button- und Input-Logik für Mengenanpassung und Löschen
function attachQuantityHandlers() {
    // Menge erhöhen
    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const input = document.querySelector(`input.quantity-input[data-id="${id}"]`);
            input.value = parseInt(input.value) + 1;
            updateQuantity(id, input.value);
        });
    });

    // Menge verringern
    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const input = document.querySelector(`input.quantity-input[data-id="${id}"]`);
            const newVal = Math.max(1, parseInt(input.value) - 1);
            input.value = newVal;
            updateQuantity(id, newVal);
        });
    });

    // Direkte Eingabe einer Menge
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.getAttribute('data-id');
            const val = Math.max(1, parseInt(input.value));
            input.value = val;
            updateQuantity(id, val);
        });
    });

    // Entfernt ein Produkt aus dem Warenkorb
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

// Sendet eine DELETE-Anfrage, um ein Produkt aus dem Warenkorb zu löschen
function removeFromCart(productId) {
    fetch('/-BohrnAgain/BackEnd/logic/cart.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            fetch('/-BohrnAgain/BackEnd/logic/cart.php')
                .then(res => res.json())
                .then(data => renderCart(data));

            if (typeof updateCartCount === 'function') {
                updateCartCount(data.cartCount);
            }
        }
    });
}

// Aktualisiert die Menge eines Produkts im Warenkorb
function updateQuantity(productId, quantity) {
    fetch('/-BohrnAgain/BackEnd/logic/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            fetch('/-BohrnAgain/BackEnd/logic/cart.php')
                .then(res => res.json())
                .then(data => renderCart(data));

            if (typeof updateCartCount === 'function') {
                updateCartCount(data.cartCount);
            }
        }
    });
}

// Aktualisiert die Zahl neben dem Warenkorb-Icon
function updateCartCount(count) {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// Beim Klick auf „Zur Kasse“ wird geprüft, ob der Nutzer eingeloggt ist
document.getElementById("checkout-btn")?.addEventListener("click", async () => {
    try {
        const res = await fetch("/-BohrnAgain/BackEnd/logic/session_status.php");
        const data = await res.json();

        if (data.loggedIn) {
            window.location.href = "checkout.html";
        } else {
            window.location.href = "login.html?redirect=checkout";
        }
    } catch (err) {
        console.error("Fehler bei der Session-Prüfung:", err);
        alert("Beim Weiterleiten zur Kasse ist ein Fehler aufgetreten.");
    }
});
