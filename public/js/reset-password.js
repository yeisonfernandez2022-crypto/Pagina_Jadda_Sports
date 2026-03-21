document.addEventListener("DOMContentLoaded", () => {
    const formReset = document.getElementById("formReset");
    const newPass = document.getElementById("newPass");
    const confirmPass = document.getElementById("confirmPass");
    const help = document.getElementById("passwordHelp");
    const barra = document.getElementById("barraSeguridad");

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // 🛡️ LÓGICA DE BARRA DE SEGURIDAD
    newPass.addEventListener("focus", () => help.style.display = "block");

    newPass.addEventListener("input", () => {
        const val = newPass.value;
        let fuerza = 0;

        const hasMayus = /[A-Z]/.test(val);
        const hasSimbolo = /[\W_]/.test(val);
        const hasLongitud = val.length >= 7;

        document.getElementById("mayus").style.color = hasMayus ? "#28a745" : "#e73737";
        document.getElementById("simbolo").style.color = hasSimbolo ? "#28a745" : "#e73737";
        document.getElementById("longitud").style.color = hasLongitud ? "#28a745" : "#e73737";

        if (hasMayus) fuerza++;
        if (hasSimbolo) fuerza++;
        if (hasLongitud) fuerza++;

        const niveles = ["0%", "33%", "66%", "100%"];
        const colores = ["", "bg-danger", "bg-warning", "bg-success"];
        
        barra.style.width = niveles[fuerza];
        barra.className = `progress-bar ${colores[fuerza]}`;
    });

    // 🚀 ENVÍO DEL FORMULARIO
    formReset.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const errorPrevio = document.getElementById("error-match");
        if (errorPrevio) errorPrevio.remove();

        const password = newPass.value;
        const confirm = confirmPass.value;

        // --- 🛡️ PASO 1: ¿COINCIDEN? ---
        if (password !== confirm) {
            mostrarErrorVisual("Las contraseñas no coinciden. Inténtalo de nuevo.");
            confirmPass.classList.add("is-invalid");
            return;
        }

        // --- 🛡️ PASO 2: ¿ES SEGURA? ---
        const regex = /^(?=.*[A-Z])(?=.*[\W_]).{7,}$/;
        if (!regex.test(password)) {
            mostrarErrorVisual("La contraseña debe tener al menos 7 caracteres, incluir una letra mayúscula y un símbolo.");
            return;
        }

        try {
            const btn = document.getElementById("btnActualizar");
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> ACTUALIZANDO...`;

            const res = await fetch('/api/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            if (res.ok) {
                document.getElementById("contenedorReset").style.display = "none";
                document.getElementById("exitoReset").style.display = "block";
            } else if (res.status === 409) {
                // 🔥 AQUÍ CAPTURAMOS EL ERROR DE "CONTRASEÑA IGUAL"
                mostrarErrorVisual("La nueva contraseña no puede ser igual a la que ya tenías.");
                btn.disabled = false;
                btn.innerText = "ACTUALIZAR CLAVE";
            } else {
                mostrarErrorVisual("El enlace ha expirado o es inválido.");
                btn.disabled = false;
                btn.innerText = "ACTUALIZAR CLAVE";
            }
        } catch (err) {
            mostrarErrorVisual("Error de conexión con el servidor.");
        }
    });

    // Limpiar errores al escribir
    confirmPass.addEventListener("input", () => {
        confirmPass.classList.remove("is-invalid");
        const errorPrevio = document.getElementById("error-match");
        if (errorPrevio) errorPrevio.remove();
    });

    // --- 🎨 FUNCIÓN PARA MOSTRAR EL ERROR (ESTA ES LA QUE TE FALTABA) ---
    function mostrarErrorVisual(mensaje) {
        const btn = document.getElementById("btnActualizar");
        const errorPrevio = document.getElementById("error-match");
        if (errorPrevio) errorPrevio.remove();

        const divError = document.createElement("div");
        divError.id = "error-match";
        divError.style.color = "#e73737";
        divError.style.fontSize = "14px";
        divError.style.fontFamily = "'Poppins', sans-serif";
        divError.style.fontWeight = "600";
        divError.style.textAlign = "center";
        divError.style.marginBottom = "10px";
        divError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensaje}`;

        btn.parentNode.insertBefore(divError, btn);
    }
});