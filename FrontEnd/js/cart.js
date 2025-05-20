document.addEventListener("DOMContentLoaded", function () {
    // Warenkorb-Inhalt laden und rendern
    fetch('/-BohrnAgain/BackEnd/logic/cart.php')
        .then(response => response.json())
        .then(data => renderCart(data))
        .catch(error => console.error('Fehler beim Laden des Warenkorbs:', error));

    // Warenkorb-Zähler separat laden
    fetch('/-BohrnAgain/BackEnd/logic/cart.php', {
        headers: {
            'X-Cart-Count': '1'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.cartCount !== undefined) {
                updateCartCount(data.cartCount);
            }
        })
        .catch(error => console.error('Fehler beim Abrufen des Warenkorbzählers:', error));
});


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

        card.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h5>${item.name}</h5>
                    <div class="input-group input-group-sm" style="max-width: 160px;">
                        <button class="btn btn-outline-secondary btn-decrease" data-id="${item.id}">−</button>
                        <input type="number" class="form-control text-center quantity-input" min="1" value="${item.quantity}" data-id="${item.id}">
                        <button class="btn btn-outline-secondary btn-increase" data-id="${item.id}">+</button>
                    </div>
                    <p class="mt-2">${item.price.toFixed(2)} € pro Stück</p>
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

    // Buttons und Inputs aktivieren
    attachQuantityHandlers();
}


function attachQuantityHandlers() {
    // + Button
    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const input = document.querySelector(`input.quantity-input[data-id="${id}"]`);
            input.value = parseInt(input.value) + 1;
            updateQuantity(id, input.value);
        });
    });

    // - Button
    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const input = document.querySelector(`input.quantity-input[data-id="${id}"]`);
            const newVal = Math.max(1, parseInt(input.value) - 1);
            input.value = newVal;
            updateQuantity(id, newVal);
        });
    });

    // Direkteingabe
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', () => {
            const id = input.getAttribute('data-id');
            const val = Math.max(1, parseInt(input.value));
            input.value = val;
            updateQuantity(id, val);
        });
    });

    // Entfernen-Button
document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        removeFromCart(id);
    });
});

}
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
        } else {
            console.error('Fehler beim Entfernen des Produkts:', data.message);
        }
    })
    .catch(err => console.error('Serverfehler beim Entfernen:', err));
}


function updateQuantity(productId, quantity) {
    fetch('/-BohrnAgain/BackEnd/logic/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Optional: Warenkorb neu laden
            fetch('/-BohrnAgain/BackEnd/logic/cart.php')
                .then(res => res.json())
                .then(data => renderCart(data));

            if (typeof updateCartCount === 'function') {
                updateCartCount(data.cartCount);
            }
        } else {
            console.error('Fehler beim Aktualisieren der Menge:', data.message);
        }
    })
    .catch(err => console.error('Serverfehler beim Ändern der Menge:', err));
}

function updateCartCount(count) {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}


