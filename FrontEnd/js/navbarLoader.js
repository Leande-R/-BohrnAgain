document.addEventListener("DOMContentLoaded", function () {
    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            const navbarContainer = document.getElementById("navbar-placeholder");
            if (navbarContainer) {
                navbarContainer.innerHTML = data;

                // Sobald die Navbar geladen ist → Login-Status prüfen
                updateNavbar();
            }
        })
        .catch(error => console.error("Fehler beim Laden der Navbar:", error));
});

async function updateNavbar() {
    try {
        const res = await fetch("/-BohrnAgain/BackEnd/logic/session_status.php");
        const data = await res.json();
        const userNav = document.getElementById("userNav");
        const adminNav = document.getElementById("adminNav");

        if (!userNav) return;

        if (data.loggedIn) {
            userNav.innerHTML = `
                <a class="btn btn-outline-light btn-sm me-2" href="user.html">${data.username}</a>
                <a class="btn btn-outline-light btn-sm" href="logout.html">Logout</a>
            `;

            // Wenn Admin eingeloggt -> Admin-Menü einblenden
            if (data.role === "admin" && adminNav) {
                adminNav.innerHTML = `
                    <a class="nav-link text-warning" href="admin_products.html">Produkte bearbeiten</a>
                    <a class="nav-link text-warning" href="admin_users.html">Kunden verwalten</a>
                `;
            }

        } else {
            userNav.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
            if (adminNav) adminNav.innerHTML = ""; // sicherheitshalber leeren
        }

    } catch (err) {
        console.error("Fehler beim Laden des Login-Status:", err);
    }
}


