document.addEventListener("DOMContentLoaded", () => {
    const formRecuperar = document.getElementById("formRecuperar");
    const registroContenido = document.getElementById("registroContenido");
    const mensajeExitoso = document.getElementById("mensajeExitoso");
    const emailInput = document.getElementById("emailRecuperar");
    const btnEnviar = document.getElementById("btnEnviar");

    formRecuperar?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = emailInput.value;

        // ⏳ Efecto de carga en el botón
        const textoOriginal = btnEnviar.innerText;
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Enviando...`;

        try {
            // Usamos ruta relativa '/api/...' para que sea más estable
            const res = await fetch('/api/recuperar-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                // ✅ Intercambiamos los bloques visuales
                registroContenido.style.display = "none";
                mensajeExitoso.style.display = "block";
            } else {
                const errorMsg = await res.text();
                alert("Error: " + errorMsg);
                btnEnviar.disabled = false;
                btnEnviar.innerText = textoOriginal;
            }

        } catch (err) {
            console.error("Error de conexión:", err);
            alert("No se pudo conectar con el servidor. Revisa tu terminal de Node.js.");
            btnEnviar.disabled = false;
            btnEnviar.innerText = textoOriginal;
        }
    });
});