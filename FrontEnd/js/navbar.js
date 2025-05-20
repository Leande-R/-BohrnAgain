async function updateNavbar() {
    try {
        const res = await fetch("/-BohrnAgain/BackEnd/logic/session_status.php");
        const data = await res.json();
        const userNav = document.getElementById("userNav");

        if (!userNav) return;

        if (data.loggedIn) {
            userNav.innerHTML = `
                <span class="navbar-text text-white me-2">Hallo, ${data.username}</span>
                <a class="btn btn-outline-light btn-sm" href="logout.html">Logout</a>
            `;
        } else {
            userNav.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
        }
    } catch (err) {
        console.error("Fehler beim Laden des Login-Status:", err);
    }
}

document.addEventListener("DOMContentLoaded", updateNavbar);
