document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Prüfe Login-Status
        const sessionRes = await fetch("/-BohrnAgain/BackEnd/logic/session_status.php");
        const sessionData = await sessionRes.json();

        if (!sessionData.loggedIn) {
            window.location.href = "login.html?redirect=1";
            return;
        }

        // Lade Warenkorb für Checkout
        const cartRes = await fetch("/-BohrnAgain/BackEnd/logic/cart.php");
        const cartItems = await cartRes.json();

        renderCheckoutCart(cartItems);
    } catch (err) {
        console.error("Fehler beim Laden des Checkouts:", err);
        showMessage("Fehler beim Laden der Bestelldaten.", "danger");
    }

    document.getElementById("place-order-btn").addEventListener("click", placeOrder);
});

function renderCheckoutCart(items) {
    const container = document.getElementById("checkout-cart");
    const totalDiv = document.getElementById("checkout-total");
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p>Dein Warenkorb ist leer.</p>';
        totalDiv.textContent = '';
        document.getElementById("place-order-btn").disabled = true;
        return;
    }

    let totalSum = 0;

    items.forEach(item => {
        totalSum += item.total;

        const card = document.createElement('div');
        card.className = 'card mb-2';

        card.innerHTML = `
            <div class="card-body d-flex gap-3">
                <img src="/-BohrnAgain/BackEnd/productpictures/${item.image}" alt="${item.name}" style="width: 100px; height: auto;">
                <div>
                    <h5>${item.name}</h5>
                    <p>${item.quantity} × ${item.price.toFixed(2)} €</p>
                    <strong>${item.total.toFixed(2)} €</strong>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    totalDiv.textContent = `Gesamtsumme: ${totalSum.toFixed(2)} €`;
}

async function placeOrder() {
    try {
        const res = await fetch("/-BohrnAgain/BackEnd/logic/place_order.php", {
            method: "POST"
        });
        const result = await res.json();

        if (result.success) {
            showMessage("Bestellung erfolgreich aufgegeben!", "success");
            setTimeout(() => window.location.href = "index.html", 1500);
        } else {
            showMessage(result.error || "Bestellung fehlgeschlagen.", "danger");
        }
    } catch (err) {
        console.error("Fehler beim Abschicken der Bestellung:", err);
        showMessage("Serverfehler beim Bestellen.", "danger");
    }
}

function showMessage(msg, type) {
    const div = document.getElementById("order-msg");
    div.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}

// Message für nicht eingeloggte Benutzer, die versuchen, auf den Checkout zuzugreifen
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("redirect") === "1") {
    showMessage("⚠️ Sie müssen eingeloggt sein, um fortzufahren.", "warning");
}

