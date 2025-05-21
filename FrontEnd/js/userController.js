let currentUser = {}; // Speichert eingeloggte Benutzerdaten

document.addEventListener("DOMContentLoaded", () => {
    // Prüft Session und lädt Benutzerdaten, wenn eingeloggt
    fetch('/-BohrnAgain/BackEnd/logic/session_status.php')
        .then(res => res.json())
        .then(session => {
            if (!session.loggedIn) {
                // Falls nicht eingeloggt: Fehlermeldung anzeigen
                document.getElementById('unauthorized').classList.remove('d-none');
                return;
            }

            // Benutzerdaten vom Server abrufen
            fetch('/-BohrnAgain/BackEnd/logic/userController.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getUserData' })
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) throw new Error(data.error);
                    currentUser = data.user;
                    updateUserView(currentUser);
                    document.getElementById('user-view').classList.remove('d-none');

                    // Bestellungen abrufen und anzeigen
                    fetch('/-BohrnAgain/BackEnd/logic/userController.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'getUserOrders' })
                    })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                renderOrders(result.orders);
                                document.getElementById('order-section').classList.remove('d-none');
                            }
                        });
                })
                .catch(err => {
                    console.error('Fehler beim Laden der Benutzerdaten:', err.message);
                    document.getElementById('unauthorized').classList.remove('d-none');
                });
        });

    // Umschalten zwischen Anzeige und Bearbeitungsmodus
    document.getElementById('edit-btn').addEventListener('click', () => {
        fillForm(currentUser);
        document.getElementById('user-form').classList.remove('d-none');
        document.getElementById('user-view').classList.add('d-none');
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
        document.getElementById('user-form').classList.add('d-none');
        document.getElementById('user-view').classList.remove('d-none');
        document.getElementById('feedback').textContent = '';
    });

    // Speichern geänderter Benutzerdaten
    document.getElementById('user-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const data = {
            action: 'updateUserData',
            user: {
                salutation: document.getElementById('salutation').value,
                firstname: document.getElementById('firstname').value,
                lastname: document.getElementById('lastname').value,
                address: document.getElementById('address').value,
                PLZ: document.getElementById('PLZ').value,
                city: document.getElementById('city').value,
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                payment_info: document.getElementById('payment_info').value,
                password: document.getElementById('passwordConfirm').value
            }
        };

        // Daten an Server senden
        fetch('/-BohrnAgain/BackEnd/logic/userController.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(result => {
                const feedback = document.getElementById('feedback');
                feedback.textContent = result.message;
                feedback.className = result.success ? 'text-success' : 'text-danger';

                // Bei Erfolg: Seite neu laden
                if (result.success) {
                    currentUser = data.user;
                    window.location.href = 'user.html';
                }
            });
    });
});

// Zeigt die Benutzerdaten im Lesemodus
function updateUserView(user) {
    document.getElementById('view-salutation').textContent = user.salutation || '';
    document.getElementById('view-name').textContent = `${user.firstname} ${user.lastname}`;
    document.getElementById('view-address').textContent = user.address;
    document.getElementById('view-location').textContent = `${user.PLZ} ${user.city}`;
    document.getElementById('view-email').textContent = user.email;
    document.getElementById('view-username').textContent = user.username;
    document.getElementById('view-payment').textContent = user.payment_info;
}

// Füllt das Formular mit den Benutzerdaten
function fillForm(user) {
    for (const key in user) {
        const el = document.getElementById(key);
        if (el) el.value = user[key];
    }
}

// Rendert alle Bestellungen des Nutzers in einer Tabelle
function renderOrders(orders) {
    const tbody = document.getElementById('order-body');
    tbody.innerHTML = '';

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(order.order_date).toLocaleDateString()}</td>
            <td>${order.invoice_number}</td>
            <td>${parseFloat(order.total).toFixed(2)} €</td>
            <td>${order.status}</td>
            <td>
                <button class="btn btn-sm btn-info me-2" onclick="loadOrderDetails(${order.id})">Details</button>
                <a class="btn btn-sm btn-outline-secondary" href="/-BohrnAgain/BackEnd/logic/invoice.php?order_id=${order.id}" target="_blank">Rechnung</a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Holt und zeigt die Bestellpositionen zu einer bestimmten Bestellung
function loadOrderDetails(orderId) {
    fetch('/-BohrnAgain/BackEnd/logic/userController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getOrderDetails', order_id: orderId })
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                const container = document.getElementById('order-details');
                container.innerHTML = `<h5>Details für Bestellung #${orderId}</h5>`;
                let html = '<ul class="list-group">';
                result.items.forEach(item => {
                    html += `<li class="list-group-item">${item.quantity} × ${item.name} @ ${parseFloat(item.price).toFixed(2)} €</li>`;
                });
                html += '</ul>';
                container.innerHTML += html;
            }
        });
}
