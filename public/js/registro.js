document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("registroForm");
  const registroContenido = document.getElementById("registroContenido"); // Nuevo
  const mensajeExitosoDiv = document.getElementById("mensajeExitoso");

  const inputPassword = document.getElementById("password");
  const help = document.getElementById("passwordHelp");

  // 🔐 VALIDACIÓN + ENVÍO
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btnRegistro = form.querySelector('button[type="submit"]');
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmar = document.getElementById("confirmar").value;

    // --- 🛡️ VALIDACIONES EXTRAS ---
    if (!email.includes("@")) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
    }

    if (password.length < 8) {
        alert("La contraseña debe tener al menos 8 caracteres.");
        return;
    }

    if (password !== confirmar) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    // --- ⏳ EFECTO DE CARGA ---
    const textoOriginal = btnRegistro.innerText;
    btnRegistro.disabled = true; // Evita múltiples clics
    btnRegistro.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Registrando...`;

    try {
        const response = await fetch('http://localhost:3000/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre: document.getElementById("nombre").value,
                apellido: document.getElementById("apellido").value,
                email, 
                telefono: document.getElementById("telefono").value,
                direccion: document.getElementById("direccion").value,
                password 
            })
        });

        const text = await response.text();

        if (response.ok) {
            document.getElementById("registroContenido").style.display = "none";
            document.getElementById("mensajeExitoso").style.display = "block";
        } else {
            alert(text);
            // Restaurar botón si hay error
            btnRegistro.disabled = false;
            btnRegistro.innerText = textoOriginal;
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor.");
        btnRegistro.disabled = false;
        btnRegistro.innerText = textoOriginal;
    }
});

  // 🔥 BARRA DE SEGURIDAD (Se mantiene igual)
  inputPassword?.addEventListener("focus", () => {
    help.style.display = "block";
  });

  inputPassword?.addEventListener("input", () => {
    const value = inputPassword.value;
    let fuerza = 0;

    if (/[A-Z]/.test(value)) {
      document.getElementById("mayus").style.color = "green";
      fuerza++;
    } else {
      document.getElementById("mayus").style.color = "red";
    }

    if (/[\W_]/.test(value)) {
      document.getElementById("simbolo").style.color = "green";
      fuerza++;
    } else {
      document.getElementById("simbolo").style.color = "red";
    }

    if (value.length >= 7) {
      document.getElementById("longitud").style.color = "green";
      fuerza++;
    } else {
      document.getElementById("longitud").style.color = "red";
    }

    const barra = document.getElementById("barraSeguridad");

    if (fuerza === 1) {
      barra.style.width = "33%";
      barra.className = "progress-bar bg-danger";
    } else if (fuerza === 2) {
      barra.style.width = "66%";
      barra.className = "progress-bar bg-warning";
    } else if (fuerza === 3) {
      barra.style.width = "100%";
      barra.className = "progress-bar bg-success";
    } else {
      barra.style.width = "0%";
    }
  });
});