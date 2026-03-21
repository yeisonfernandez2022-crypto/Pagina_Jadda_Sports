document.addEventListener("DOMContentLoaded", () => {

    AOS.init({
        duration: 800, // Duración de la animación en milisegundos
        once: true,    // Si quieres que solo se anime la primera vez que bajas
    });

});
  const userNameDisplay = document.getElementById("userNameDisplay");
  const btnLogout = document.getElementById("btnLogout");
  const guestButtons = document.getElementById("guestButtons");

  // --- 1. CAPTURAR NOMBRE DE GOOGLE ---
  const urlParams = new URLSearchParams(window.location.search);
  const userFromGoogle = urlParams.get('user');

  if (userFromGoogle) {
    localStorage.setItem('userName', decodeURIComponent(userFromGoogle));
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // --- 2. LÓGICA DE VISUALIZACIÓN (SIN REDIRECCIÓN) ---
  const fullUserName = localStorage.getItem("userName");

  if (fullUserName && fullUserName !== "Invitado") {
    // ✅ CASO: USUARIO LOGEADO
    const primerNombre = fullUserName.trim().split(" ")[0].split("@")[0]; // Corta en espacio o en @
    const nombreFormateado = primerNombre.charAt(0).toUpperCase() + primerNombre.slice(1).toLowerCase();

    if (userNameDisplay) userNameDisplay.textContent = `Hola, ${nombreFormateado}`;
    if (btnLogout) btnLogout.style.display = "inline-block";
    if (guestButtons) guestButtons.style.display = "none";

  } else {
    // 👤 CASO: INVITADO (O SESIÓN CERRADA)
    if (userNameDisplay) userNameDisplay.textContent = "Invitado";
    if (btnLogout) btnLogout.style.display = "none";
    if (guestButtons) guestButtons.style.display = "block";
  }

  // --- 3. LOGOUT (QUEDÁNDOSE EN LA PÁGINA) ---
  btnLogout?.addEventListener("click", (e) => {
    e.preventDefault(); 
    
    // Borramos los datos de sesión
    localStorage.clear(); 
    
    // En lugar de redirigir, solo recargamos la página actual
    // Esto hará que el código de arriba se ejecute de nuevo y vea que ya no hay usuario
    window.location.reload(); 
  });
