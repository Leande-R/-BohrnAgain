    document.addEventListener("DOMContentLoaded", () => {

    //  Registrierung
    const form = document.getElementById("registerForm");
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Formulardaten in ein Objekt umwandeln
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Passwortabgleich
            if (data.password !== data.confirm_password) {
                showMessage("Die eingegebenen Passwörter stimmen nicht überein.", "danger");
                return;
            }

            // Registrierung via API
            try {
                const response = await fetch("/-BohrnAgain/BackEnd/logic/userController.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "register", user: data })
                });

                const result = await response.json();
                if (result.success) {
                    showMessage("Registrierung erfolgreich abgeschlossen. Du wirst jetzt weitergeleitet…", "success");
                    setTimeout(() => window.location.href = "login.html", 2000);
                } else {
                    showMessage(result.error || "Ein Fehler ist bei der Registrierung aufgetreten.", "danger");
                }

            } catch (err) {
                showMessage("Beim Serveraufruf ist ein Fehler aufgetreten.", "danger");
            }
        });
    }

    //  Login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch("/-BohrnAgain/BackEnd/logic/userController.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "login", ...data })
                });

                const result = await response.json();

                if (result.success) {
                    // „Angemeldet bleiben“ (Token wird als Cookie gespeichert)
                    if (data.rememberMe === "on") {
                        document.cookie = `rememberUser=${result.token}; path=/; max-age=604800`; // 7 Tage
                    }

                    // Nach dem Login ggf. zurück zum Checkout
                    const redirect = new URLSearchParams(window.location.search).get("redirect");
                    const target = redirect === "checkout"
                        ? "/-BohrnAgain/Frontend/sites/checkout.html"
                        : "/-BohrnAgain/Frontend/sites/index.html";

                    showMessage("Anmeldung erfolgreich.", "success");
                    setTimeout(() => window.location.href = target, 1000);
                } else {
                    showMessage(result.error || "Benutzername oder Passwort sind ungültig.", "danger");
                }

            } catch (err) {
                showMessage("Beim Serveraufruf ist ein Fehler aufgetreten.", "danger");
            }
        });
    }

    //  Zeigt Fehlermeldungen oder Bestätigungen oben auf der Seite an
    function showMessage(msg, type) {
        const div = document.getElementById("registerMsg") || document.getElementById("loginMsg");
        if (div) {
            div.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${msg}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;
        }
    }

});
