(function() {
    // 1. BLOQUEO VISUAL INICIAL
    document.documentElement.style.display = "none";
    
    // Bloqueos de seguridad (clic derecho y teclas de inspección)
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && (e.key === 'u' || e.key === 's')) || (e.ctrlKey && e.shiftKey && e.key === 'i')) {
            e.preventDefault();
        }
    });

    // ===== CONFIGURACIÓN MAESTRA MONTE NEVADO =====
    const LLAVE_QR = "8L9]zykR^R,=faETFcxAguaNevada2026";
    const CLAVE_TECNICA = "Agua2026_Admin"; 
    const TIEMPO_EXPIRACION = 15 * 60 * 1000; 

    const EMPLEADOS = [
		"Gerson Ivan Patrocionio Ramos",
		"Hamilton Vladimir Herrera Alvarez",
		"Jose Antonio Pablo Amaya",
		"Jose Guillermo Alvarez",
		"Juan Filadelfo Alvarez Murillo",
		"Julio Alberto Rodriguez",
		"Kevin Adonay Gonzalez Angulo",
		"Neris Antonio Hernandez Chicas",
		"Paola Berenice Zavala Alfaro",
		"Ramon Alfredo Saravia Juarez",
		"Yohanan Bladimir Berrillos Montecinos"
    ];

    const CARPETA_DIPLOMAS = "Diplomas/";
    const CARPETA_CARNETS = "Carnets/";
    const CARPETA_MEDICOS = "Medicos/";

    function limpiarURL() {
        const urlLimpia = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, urlLimpia);
    }

    // --- INTERFAZ DE DOCUMENTOS ---
    function mostrarPanelEmpleados() {
        const contenedorDestino = document.getElementById('lista-empleados-destino');
        if (!contenedorDestino) return;

        let htmlInyectar = "";
        EMPLEADOS.forEach((nombre, index) => {
            // Reemplaza espacios por guiones bajos para los archivos PDF
            const slug = nombre.replace(/\s+/g, '_');
            
            htmlInyectar += `
            <div class="empleado-card">
                <div class="name-bar" onclick="window.toggleDocs(${index})">
                    <span>👤 ${nombre}</span>
                    <span id="flecha-${index}">+</span>
                </div>
                <div id="docs-${index}" class="docs-area">
                    <a href="${CARPETA_MEDICOS}${slug}_Constancias.pdf" target="_blank" class="doc-link">
                        <span class="icon">📋</span> Constancia Médica
                    </a>
                    <a href="${CARPETA_CARNETS}${slug}_Carnet.pdf" target="_blank" class="doc-link">
                        <span class="icon">🪪</span> Carnet de Manipulación
                    </a>
                    <a href="${CARPETA_DIPLOMAS}${slug}_Diploma.pdf" target="_blank" class="doc-link">
                        <span class="icon">🎓</span> Diploma de Curso
                    </a>
                </div>
            </div>`;
        });
        contenedorDestino.innerHTML = htmlInyectar;
    }

    // Función global para el acordeón
    window.toggleDocs = (i) => {
        const d = document.getElementById(`docs-${i}`);
        const f = document.getElementById(`flecha-${i}`);
        if(!d) return;
        const isOpen = d.style.display === 'block';
        d.style.display = isOpen ? 'none' : 'block';
        f.innerText = isOpen ? '+' : '-';
    };

    window.intentarAccesoManual = function() {
        const pass = prompt("SISTEMA MONTE NEVADO\nIngrese clave de administrador:");
        if (pass === CLAVE_TECNICA) {
            sessionStorage.setItem("accesoPermitido", "true");
            sessionStorage.setItem("horaAcceso", Date.now().toString());
            location.reload(); // Recarga la página actual con el acceso ya concedido
        } else if (pass !== null) {
            alert("Clave incorrecta.");
        }
    };

    function mostrarPantallaError(mensaje, ipDetectada = "Verificando...") {
        window.stop();
        // Nota: Aquí usamos las clases de tu archivo styles.css
        document.documentElement.innerHTML = `
        <head>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="styles.css">
        </head>
        <body class="lock-screen">
            <div class="lock-card">
                <div style="font-size:50px;">🚫</div>
                <h1>Acceso Restringido</h1>
                <p>${mensaje}</p>
                <div class="btn-manual" onclick="window.intentarAccesoManual()">Entrar con contraseña</div>
                <div class="ip-box">ID CONEXIÓN:<br><strong>${ipDetectada}</strong></div>
            </div>
        </body>`;
        document.documentElement.style.display = "block";
    }

    async function validar() {
        const urlParams = new URLSearchParams(window.location.search);
        const llaveURL = urlParams.get('key');
        const accesoSesion = sessionStorage.getItem("accesoPermitido");
        const horaSesion = sessionStorage.getItem("horaAcceso");
        const ahora = Date.now();
        const paginaActual = window.location.pathname.split("/").pop();

        let concedido = false;

        // 1. Validar por URL (QR)
        if (llaveURL === LLAVE_QR) {
            sessionStorage.setItem("accesoPermitido", "true");
            sessionStorage.setItem("horaAcceso", ahora.toString());
            limpiarURL();
            concedido = true;
        } 
        // 2. Validar por Sesión activa
        else if (accesoSesion === "true" && horaSesion) {
            if (ahora - parseInt(horaSesion) < TIEMPO_EXPIRACION) {
                concedido = true;
            } else {
                sessionStorage.clear();
            }
        }

        if (concedido) {
            // 3. Verificar País (El Salvador)
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data.country_code !== 'SV' && data.country_code !== undefined) {
                    mostrarPantallaError("Solo accesible en El Salvador.", data.ip);
                    return;
                }
            } catch (e) { console.log("Validación local"); }
            
            // 4. Ejecutar renderizado si estamos en empleados.html
            if (paginaActual === "empleados.html") {
                mostrarPanelEmpleados();
            } 
            
            document.documentElement.style.display = "block";
            return;
        }

        // 5. Si nada funciona, mostrar error
        mostrarPantallaError("Se requiere llave QR autorizada o la sesión ha expirado.");
    }

    validar();
})();