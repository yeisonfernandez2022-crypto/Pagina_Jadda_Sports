document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LÓGICA DE SESIÓN (NOMBRE DE USUARIO) ---
    const cargarSesion = () => {
        fetch('/api/user')
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(user => {
                const nameDisplay = document.getElementById("userNameDisplay");
                const btnLogout = document.getElementById("btnLogout");
                
                if (nameDisplay) nameDisplay.textContent = user.nombre;
                if (btnLogout) btnLogout.style.display = "inline-block";
            })
            .catch(() => {
                const nameDisplay = document.getElementById("userNameDisplay");
                const guestButtons = document.getElementById("guestButtons");
                
                if (nameDisplay) nameDisplay.textContent = "Invitado";
                if (guestButtons) guestButtons.style.display = "inline-block";
            });
    };

    // --- 2. LÓGICA DE PRODUCTOS DE MYSQL ---
    const cargarProductos = () => {
        fetch('/api/productos')
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener productos");
                return res.json();
            })
            .then(productos => {
                const contenedor = document.getElementById("contenedorProductos");
                if (!contenedor) return;

                contenedor.innerHTML = ""; // Limpiamos

                productos.forEach((p, index) => {
                    // Usamos las columnas exactas de tu DB: IMAGEN, NOMBRE, PRECIO
                    contenedor.innerHTML += `
                        <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${index * 50}">
                            <div class="card h-100 shadow-sm product-card border-0">
                                <div class="img-container">
                                    <img src="${p.IMAGEN}" class="img-fluid product-img" 
                                         onerror="this.src='https://placehold.co/400x400?text=Jadda+Sports'">
                                </div>
                                <div class="card-body text-center">
                                    <h5 class="card-title fw-bold text-uppercase" style="font-family: 'Bebas Neue';">${p.NOMBRE}</h5>
                                    <p class="card-text text-danger fs-5 fw-bold">$${Number(p.PRECIO).toLocaleString('es-CO')}</p>
                                    <button class="btn btn-dark w-100 fw-bold btn-buy">
                                        <i class="fas fa-shopping-cart me-2"></i>VER DETALLES
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                // 🔥 ¡CLAVE! Refrescar AOS para que las cards recién creadas se animen
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
            })
            .catch(err => {
                console.error("Error cargando productos:", err);
                const cont = document.getElementById("contenedorProductos");
                if(cont) cont.innerHTML = "<p class='text-center w-100'>Error al conectar con la base de datos.</p>";
            });
    };

    // Ejecutamos ambas funciones al cargar la página
    cargarSesion();
    cargarProductos();

});


function cerrarSesion() {
    fetch('/logout')
        .then(() => {
            // Recarga la misma página donde estás parado
            window.location.reload();
        })
        .catch(err => console.error("Error al cerrar sesión", err));
}