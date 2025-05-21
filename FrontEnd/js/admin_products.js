document.addEventListener("DOMContentLoaded", async () => {
    const msgBox = document.getElementById("admin-msg");
    const productForm = document.getElementById("productForm");

    // Adminprüfung
    const sessionRes = await fetch("/-BohrnAgain/BackEnd/logic/session_status.php");
    const sessionData = await sessionRes.json();

    if (!sessionData.loggedIn || sessionData.role !== "admin") {
        msgBox.innerHTML = `<div class="alert alert-danger">Fehlende Berechtigung.</div>`;
        productForm.remove();
        return;
    }

    loadCategories();
    loadProducts();

    productForm.addEventListener("submit", createHandler);
});

// ========== PRODUKTE LADEN ==========
async function loadProducts() {
    const container = document.getElementById("productList");
    container.innerHTML = "Lade Produkte...";

    const res = await fetch("/-BohrnAgain/BackEnd/logic/productController.php");
    const products = await res.json();
    container.innerHTML = "";

    products.forEach(product => {
        const col = document.createElement("div");
        col.className = "col";

        col.innerHTML = `
            <div class="card">
                <img src="/-BohrnAgain/BackEnd/productpictures/${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p>${product.description}</p>
                    <p><strong>${parseFloat(product.price).toFixed(2)} €</strong> | Bewertung: ${product.rating}</p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-warning btn-sm" onclick='editProduct(${JSON.stringify(product)})'>Bearbeiten</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Löschen</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// ========== KATEGORIEN LADEN ==========
async function loadCategories() {
    const select = document.getElementById("category_id");

    try {
        const res = await fetch("/-BohrnAgain/BackEnd/logic/categoryController.php");
        const categories = await res.json();

        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (err) {
        showMessage("Fehler beim Laden der Kategorien.", "danger");
    }
}

// ========== PRODUKT ANLEGEN ==========
function createHandler(e) {
    e.preventDefault();

    const form = document.getElementById("productForm");
    const fileInput = document.getElementById("image");
    const file = fileInput.files[0];
    const allowedTypes = ["image/jpeg", "image/png"];

    const name = document.getElementById("name").value.trim();
    const price = parseFloat(document.getElementById("price").value);
    const rating = parseFloat(document.getElementById("rating").value);
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category_id").value;

    if (!name || !price || !rating || !description || !category) {
        showMessage("Bitte fülle alle Felder aus.", "danger");
        return;
    }

    if (!file || !allowedTypes.includes(file.type)) {
        showMessage("Nur JPG- und PNG-Dateien erlaubt.", "danger");
        return;
    }

    const formData = new FormData(form);
    formData.append("action", "create");

    fetch("/-BohrnAgain/BackEnd/logic/productController.php", {
        method: "POST",
        body: formData,
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            showMessage("Produkt erfolgreich hinzugefügt.", "success");
            form.reset();
            loadProducts();
        } else {
            showMessage("Fehler: " + result.error, "danger");
        }
    });
}

// ========== PRODUKT BEARBEITEN ==========
function editProduct(product) {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const form = document.getElementById("productForm");

    document.getElementById("name").value = product.name;
    document.getElementById("price").value = product.price;
    document.getElementById("rating").value = product.rating;
    document.getElementById("description").value = product.description;
    document.getElementById("category_id").value = product.category_id;

    let hiddenId = document.getElementById("product-id");
    if (hiddenId) hiddenId.value = product.id;
    else {
        hiddenId = document.createElement("input");
        hiddenId.type = "hidden";
        hiddenId.name = "id";
        hiddenId.id = "product-id";
        hiddenId.value = product.id;
        form.appendChild(hiddenId);
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.textContent = "Produkt aktualisieren";
    submitBtn.classList.remove("btn-primary");
    submitBtn.classList.add("btn-warning");

    form.removeEventListener("submit", createHandler);
    form.addEventListener("submit", updateHandler);
}

function updateHandler(e) {
    e.preventDefault();

    const form = document.getElementById("productForm");
    const fileInput = document.getElementById("image");
    const file = fileInput.files[0];
    const allowedTypes = ["image/jpeg", "image/png"];

    const formData = new FormData(form);
    formData.append("action", "update");

    // Nur prüfen, wenn ein Bild vorhanden ist
    if (file) {
        if (!allowedTypes.includes(file.type)) {
            showMessage("Nur JPG- und PNG-Dateien erlaubt.", "danger");
            return;
        }
    }

    fetch("/-BohrnAgain/BackEnd/logic/productController.php", {
        method: "POST",
        body: formData,
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            showMessage("Produkt aktualisiert.", "success");
            form.reset();
            loadProducts();

            const submitBtn = form.querySelector("button[type=submit]");
            submitBtn.textContent = "Produkt anlegen";
            submitBtn.classList.remove("btn-warning");
            submitBtn.classList.add("btn-primary");

            const hiddenId = document.getElementById("product-id");
            if (hiddenId) hiddenId.remove();

            form.removeEventListener("submit", updateHandler);
            form.addEventListener("submit", createHandler);
        } else {
            showMessage("Fehler beim Aktualisieren: " + result.error, "danger");
        }
    });
}

// ========== PRODUKT LÖSCHEN ==========
async function deleteProduct(id) {
    const confirmed = confirm("Möchtest du dieses Produkt wirklich löschen?");
    if (!confirmed) return;

    const res = await fetch("/-BohrnAgain/BackEnd/logic/productController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
    });

    const result = await res.json();
    if (result.success) {
        showMessage("Produkt gelöscht.", "success");
        loadProducts();
    } else {
        showMessage("Fehler beim Löschen.", "danger");
    }
}

// ========== MELDUNG ANZEIGEN ==========
function showMessage(msg, type) {
    const box = document.getElementById("admin-msg");
    box.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
}
