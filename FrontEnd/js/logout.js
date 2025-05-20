document.addEventListener("DOMContentLoaded", async () => {
    try {
        await fetch("/-BohrnAgain/BackEnd/logic/logout.php", { method: "POST" });
        // Der Server zerstört Session und Cookie
    } catch (err) {
        console.error("Fehler beim Logout:", err);
    }
});
