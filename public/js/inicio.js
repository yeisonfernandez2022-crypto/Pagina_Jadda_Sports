document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById('loginForm');
    const errorMensaje = document.getElementById('errorMensaje');
    const checkbox = document.getElementById('verPassword');
    const passwordInput = document.getElementById('password');

    // 👁️ Mostrar / ocultar contraseña
    checkbox?.addEventListener("change", () => {
        if (passwordInput) {
            passwordInput.type = checkbox.checked ? "text" : "password";
        }
    });

    // 🔐 LOGIN
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorMensaje.style.display = 'none';
        errorMensaje.innerText = "";

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            aplicarShake(); 
            errorMensaje.style.display = 'block';
            errorMensaje.innerText = "Por favor, completa todos los campos.";
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const text = await response.text();

            if (response.ok) {
                const data = JSON.parse(text);
                if(data.token) localStorage.setItem('token', data.token);

                let nombreReal = data.nombre || "Usuario"; 
                const nombreFormateado = nombreReal.charAt(0).toUpperCase() + nombreReal.slice(1).toLowerCase();

                localStorage.setItem('userName', nombreFormateado);
                window.location.href = "/html/principal.html";

            } else {
                aplicarShake(); 
                errorMensaje.style.display = 'block';

                if (text.includes("Confirma")) {
                    errorMensaje.innerText = "⚠️ Debes verificar tu correo";
                } else {
                    errorMensaje.innerText = text;
                }
            }

        } catch (err) {
            console.error(err);
            aplicarShake(); 
            errorMensaje.style.display = 'block';
            errorMensaje.innerText = "Error de conexión con el servidor.";
        }
    });

    // ✨ FUNCIÓN PARA LA ANIMACIÓN (Corregida)
    function aplicarShake() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // 1. Quitamos la clase por si ya estaba puesta
        loginForm.classList.remove("shake-error");
        
        // 2. Forzamos el "reflujo" (esto es lo que le faltaba)
        void loginForm.offsetWidth; 
        
        // 3. Volvemos a poner la clase en el siguiente "tick" del reloj
        setTimeout(() => {
            loginForm.classList.add("shake-error");
            console.log("🔥 Sacudiendo formulario...");
        }, 10);

        // 4. La quitamos después de que termine la animación (0.4s)
        setTimeout(() => {
            loginForm.classList.remove("shake-error");
        }, 410);
    }
}

});