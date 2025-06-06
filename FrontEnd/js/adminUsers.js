// Wird ausgeführt, sobald die Seite vollständig geladen ist
document.addEventListener("DOMContentLoaded", () => {
    // Prüfe ob der Benutzer als Admin eingeloggt ist
    fetch("/-BohrnAgain/BackEnd/logic/session_status.php")
        .then(res => res.json())
        .then(session => {
            if (!session.loggedIn || session.role !== 'admin') {
                document.getElementById("admin-msg").textContent = "Zugriff verweigert – nur Administratoren erlaubt.";
                return;
            }
            // Wenn Admin: Lade alle User
            loadAllUsers();
        });
});

// Holt alle Benutzer vom Server
function loadAllUsers() {
    fetch("/-BohrnAgain/BackEnd/logic/userController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getAllUsers" })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) renderUsers(data.users);
            else document.getElementById("admin-msg").textContent = data.error || "Fehler beim Laden der Benutzer.";
        });
}

// Baut die User-Tabelle im HTML dynamisch auf
function renderUsers(users) {
    const tbody = document.getElementById("user-table-body");
    tbody.innerHTML = "";

    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.firstname} ${user.lastname}</td>
            <td>${user.email}</td>
            <td>${user.city}</td>
            <td>${user.is_active ? "Aktiv" : "Deaktiviert"}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="loadUserOrders(${user.id})">Bestellungen</button>
                <button class="btn btn-sm btn-danger" onclick="deactivateUser(${user.id})" ${!user.is_active ? 'disabled' : ''}>Deaktivieren</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Holt Bestellungen eines bestimmten Benutzers
function loadUserOrders(userId) {
    fetch("/-BohrnAgain/BackEnd/logic/userController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getUserOrdersByAdmin", user_id: userId })
    })
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("user-orders");
            if (!data.success) {
                container.innerHTML = `<div class="text-danger">${data.error || "Fehler beim Laden der Bestellungen."}</div>`;
                return;
            }

            // Ausgabeformat für Bestellungen
            let html = `<h4>Bestellungen von User #${userId}</h4>`;
            if (data.orders.length === 0) {
                html += `<p>Keine Bestellungen vorhanden.</p>`;
            } else {
                html += `<table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Rechnungsnr.</th>
                                    <th>Gesamt</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>`;
                data.orders.forEach(order => {
                    html += `
                        <tr>
                            <td>${new Date(order.order_date).toLocaleDateString()}</td>
                            <td>${order.invoice_number}</td>
                            <td>${parseFloat(order.total).toFixed(2)} €</td>
                            <td>${order.status}</td>
                        </tr>
                        <tr>
                            <td colspan="4">
                                <button class="btn btn-sm btn-secondary mb-2" onclick="loadOrderDetails(${order.id}, this)">Details anzeigen</button>
                                <div class="order-details mt-2"></div>
                            </td>
                        </tr>
                    `;
                });
                html += `</tbody></table>`;
            }
            container.innerHTML = html;
        });
}

function loadOrderDetails(orderId, button) {
    const detailsDiv = button.nextElementSibling;

    // Falls schon Daten geladen, nur ein-/ausblenden
    if (detailsDiv.dataset.loaded === "true") {
        detailsDiv.classList.toggle("d-none");
        return;
    }

    fetch("/-BohrnAgain/BackEnd/logic/userController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getOrderDetailsByAdmin", order_id: orderId })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                detailsDiv.innerHTML = `<div class="text-danger">${data.error || "Fehler beim Laden der Details."}</div>`;
                return;
            }

            if (data.items.length === 0) {
                detailsDiv.innerHTML = "<p>Keine Artikel in dieser Bestellung.</p>";
            } else {
                let innerHtml = `
                    <table class="table table-bordered table-sm">
                        <thead><tr><th>Artikel</th><th>Menge</th><th>Stückpreis</th></tr></thead>
                        <tbody>`;
                data.items.forEach(item => {
                    innerHtml += `<tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${parseFloat(item.price).toFixed(2)} €</td>
                    </tr>`;
                });
                innerHtml += "</tbody></table>";
                detailsDiv.innerHTML = innerHtml;
            }

            detailsDiv.dataset.loaded = "true";
        });
}
// Deaktiviert einen Benutzer (setzt is_active auf 0)
function deactivateUser(userId) {
    if (!confirm("Möchtest du diesen Nutzer wirklich deaktivieren?")) return;

    fetch("/-BohrnAgain/BackEnd/logic/userController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivateUser", user_id: userId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) loadAllUsers(); // Tabelle neu laden
            else alert(data.error || "Fehler beim Deaktivieren.");
        });
}
