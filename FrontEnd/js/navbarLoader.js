document.addEventListener("DOMContentLoaded", function () {
    fetch("navbar.html")
        .then(response => response.text())
        .then(data => {
            const navbarContainer = document.getElementById("navbar-placeholder");
            if (navbarContainer) {
                navbarContainer.innerHTML = data;
            }
        })
        .catch(error => console.error("Fehler beim Laden der Navbar:", error));
});
