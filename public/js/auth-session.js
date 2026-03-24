document.addEventListener("DOMContentLoaded", () => {
    validarIdentidadJadda();
});

function validarIdentidadJadda() {
    // 1. PRIMERO: Revisamos la maleta local (LocalStorage)
    const nombreGuardado = localStorage.getItem("userName");
    
    const display = document.getElementById("userNameDisplay");
    const btnSalir = document.getElementById("btnLogout");
    const botonesInvitado = document.getElementById("guestButtons");

    // 2. Si ya sabemos quién eres localmente, mostramos tu nombre de inmediato
    if (nombreGuardado && nombreGuardado !== "Invitado") {
        const nombreLimpio = nombreGuardado.split(" ")[0].toUpperCase();
        
        if (display) {
            display.textContent = `HOLA, ${nombreLimpio}`;
            display.style.display = "inline-block";
        }
        if (btnSalir) {
            btnSalir.classList.remove("d-none");
            btnSalir.style.display = "inline-block";
        }
        if (botonesInvitado) {
            botonesInvitado.classList.add("d-none");
            botonesInvitado.style.setProperty("display", "none", "important");
        }
        console.log("👤 Sesión local activa: " + nombreLimpio);
        
        // Opcional: Podrías intentar actualizar con el servidor en segundo plano
        // pero sin borrar lo que ya mostramos.
    } else {
        // 3. Si NO hay nada local, le preguntamos al servidor
        fetch('/api/user')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(user => {
                if (display) display.textContent = user.nombre.toUpperCase();
                // ... lógica de botones similar a la de arriba
            })
            .catch(() => {
                // Solo si el servidor y el local fallan, mostramos Invitado
                if (display) display.textContent = "INVITADO";
                if (btnSalir) btnSalir.style.display = "none";
                if (botonesInvitado) botonesInvitado.style.display = "flex";
            });
    }
}

// Función global para todas las páginas
function cerrarSesion() {
    console.log("Cerrando sesión global...");
    localStorage.clear();
    fetch('/logout').finally(() => {
        // Siempre mandamos al inicio al cerrar sesión
        window.location.href = "/html/principal.html";
    });
}