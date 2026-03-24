document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LÓGICA DE SESIÓN (CORREGIDA PARA JADDA SPORTS) ---
    const cargarSesion = () => {
        const fullUserName = localStorage.getItem("userName");
        const nameDisplay = document.getElementById("userNameDisplay");
        const btnLogout = document.getElementById("btnLogout");
        const guestButtons = document.getElementById("guestButtons");

        if (fullUserName && fullUserName !== "Invitado") {
            // Formatear: Tomamos solo el primer nombre
            const nombreLimpio = fullUserName.split(" ")[0].toUpperCase();
            
            if (nameDisplay) {
                nameDisplay.textContent = `HOLA, ${nombreLimpio}`;
                nameDisplay.classList.remove("d-none");
            }

            // Mostrar SALIR y ocultar LOGIN/REGISTRO con d-none
            if (btnLogout) {
                btnLogout.classList.remove("d-none");
                btnLogout.style.display = "inline-block";
            }
            if (guestButtons) {
                guestButtons.classList.add("d-none");
                guestButtons.style.setProperty("display", "none", "important");
            }
            
            console.log("✅ Sesión reconocida en Catálogo: " + nombreLimpio);
        } else {
            // Estado Invitado
            if (nameDisplay) nameDisplay.textContent = "INVITADO";
            if (btnLogout) btnLogout.classList.add("d-none");
            if (guestButtons) {
                guestButtons.classList.remove("d-none");
                guestButtons.style.display = "flex";
            }
        }
    };

    // --- 2. LÓGICA DE PRODUCTOS DE MYSQL (SE MANTIENE IGUAL) ---
    const cargarProductos = () => {
        fetch('/api/productos')
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener productos");
                return res.json();
            })
            .then(productos => {
                const contenedor = document.getElementById("contenedorProductos");
                if (!contenedor) return;

                contenedor.innerHTML = ""; 

                productos.forEach((p, index) => {
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

    cargarSesion();
    cargarProductos();
});

// Función de Salida
function cerrarSesion() {
    localStorage.clear();
    fetch('/logout').finally(() => {
        window.location.href = "/html/principal.html";
    });
}