let currentUser = {};

document.addEventListener("DOMContentLoaded", () => {
    fetch('/-BohrnAgain/BackEnd/logic/session_status.php')
        .then(res => {
            if (!res.ok) throw new Error("Fehler beim Laden der Sessiondaten");
            return res.json();
        })
        .then(session => {
            if (!session.loggedIn) {
                document.getElementById('unauthorized').classList.remove('d-none');
                return;
            }

            // ✅ Eingeloggt – jetzt Benutzerdaten laden
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
                })
                .catch(err => {
                    console.error('Fehler beim Laden der Benutzerdaten:', err.message);
                    document.getElementById('unauthorized').classList.remove('d-none');
                });
        })
        .catch(err => {
            console.error('Fehler bei Sessionprüfung:', err.message);
            document.getElementById('unauthorized').classList.remove('d-none');
        });

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

                if (result.success) {
                    currentUser = data.user;
                    window.location.href = 'user.html'; // redirect nach erfolgreichem Speichern
                }
            });
    });
});

function updateUserView(user) {
    document.getElementById('view-salutation').textContent = user.salutation || '';
    document.getElementById('view-name').textContent = `${user.firstname} ${user.lastname}`;
    document.getElementById('view-address').textContent = user.address;
    document.getElementById('view-location').textContent = `${user.PLZ} ${user.city}`;
    document.getElementById('view-email').textContent = user.email;
    document.getElementById('view-username').textContent = user.username;
    document.getElementById('view-payment').textContent = user.payment_info;
}

function fillForm(user) {
    for (const key in user) {
        const el = document.getElementById(key);
        if (el) el.value = user[key];
    }
}
