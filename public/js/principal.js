document.addEventListener("DOMContentLoaded", () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({ 
            duration: 1000, // Un poco más lento para que se aprecie el efecto
            once: false,    // Ponlo en 'false' para que la animación se repita al subir y bajar
            mirror: true,   // Ayuda a que detecte mejor el movimiento
            offset: 120,    // La animación empieza un poco antes de que el elemento sea visible
            storeEvents: false 
        });
        
        // TRUCO EXTRA: Forzar el refresco de animaciones después de un momento
        setTimeout(() => {
            AOS.refresh();
        }, 500);
    }
});

    
    try {
        const userNameDisplay = document.getElementById("userNameDisplay");
        const btnLogout = document.getElementById("btnLogout");
        const guestButtons = document.getElementById("guestButtons");

        // Obtenemos el nombre guardado en LocalStorage
        const fullUserName = localStorage.getItem("userName");

        if (fullUserName && fullUserName !== "Invitado") {
            // 1. Formatear nombre: Tomamos solo el primer pedazo
            const nombreLimpio = fullUserName.split(" ")[0].toUpperCase();
            
            // 2. Mostrar nombre
            if (userNameDisplay) {
                userNameDisplay.textContent = `HOLA, ${nombreLimpio}`;
                userNameDisplay.classList.remove("d-none");
            }

            // 3. Mostrar botón SALIR
            if (btnLogout) {
                btnLogout.classList.remove("d-none");
                btnLogout.style.display = "inline-block";
            }

            // 4. OCULTAR LOGIN Y REGISTRO (Usando d-none de Bootstrap)
            if (guestButtons) {
                guestButtons.classList.add("d-none");
                guestButtons.style.setProperty("display", "none", "important");
            }
            
            console.log("✅ Interfaz de usuario activa: " + nombreLimpio);
        } else {
            // Lógica para INVITADO
            if (userNameDisplay) userNameDisplay.textContent = "";
            if (btnLogout) btnLogout.classList.add("d-none");
            if (guestButtons) {
                guestButtons.classList.remove("d-none");
                guestButtons.style.display = "flex";
            }
        }
    } catch (error) {
        console.error("Error en la lógica de sesión:", error);
    }

function cerrarSesion() {
    console.log("Cerrando sesión...");
    localStorage.clear();
    // Redirigir para limpiar el estado de la página
    window.location.href = "/html/principal.html";
}