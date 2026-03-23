document.addEventListener("DOMContentLoaded", () => {
    checkUserSession();
});

function checkUserSession() {
    fetch('/api/user')
        .then(res => {
            if (!res.ok) throw new Error("No session");
            return res.json();
        })
        .then(user => {
            // Si hay usuario logueado
            const nameDisplay = document.getElementById("userNameDisplay");
            const btnLogout = document.getElementById("btnLogout");
            const guestButtons = document.getElementById("guestButtons");

            if (nameDisplay) nameDisplay.textContent = user.nombre;
            if (btnLogout) btnLogout.style.display = "inline-block";
            if (guestButtons) guestButtons.style.display = "none";
        })
        .catch(() => {
            // Si es invitado
            const nameDisplay = document.getElementById("userNameDisplay");
            const guestButtons = document.getElementById("guestButtons");
            const btnLogout = document.getElementById("btnLogout");

            if (nameDisplay) nameDisplay.textContent = "Invitado";
            if (guestButtons) guestButtons.style.display = "inline-block";
            if (btnLogout) btnLogout.style.display = "none";
        });
}

function cerrarSesion() {
    fetch('/logout')
        .then(() => {
            window.location.reload();
        })
        .catch(err => console.error("Error al salir:", err));
}