(function() {
    // 0. Ocultar el contenido inmediatamente
    document.documentElement.style.visibility = "hidden";

    const llaveCorrecta = "8L9]zykR^R,=faETFcxAguaNevada2026";
    const TIEMPO_EXPIRACION = 30 * 60 * 1000; // 30 minutos en milisegundos

    // --- FUNCIÓN DE BLOQUEO DE CTRL+U Y CLIC DERECHO ---
    function bloquearInspeccion() {
        // Bloquear clic derecho
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Bloquear atajos de teclado
        document.addEventListener('keydown', e => {
            // Bloquea Ctrl+U (Ver código fuente)
            // Bloquea Ctrl+Shift+I (Inspeccionar)
            // Bloquea F12 (Consola)
            // Bloquea Ctrl+S (Guardar)
            if (
                e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                return false;
            }
        });
    }

    // --- LÓGICA DE SESIÓN CON TIEMPO ---
    function verificarAcceso() {
        const acceso = sessionStorage.getItem("accesoPermitido");
        const horaInicio = sessionStorage.getItem("horaAcceso");
        const ahora = Date.now();

        if (acceso === "true" && horaInicio) {
            if (ahora - horaInicio < TIEMPO_EXPIRACION) {
                // Sesión aún válida
                document.documentElement.style.visibility = "visible";
                document.documentElement.style.display = "block";
                bloquearInspeccion();
                return true;
            } else {
                // Sesión expirada
                sessionStorage.clear();
            }
        }
        return false;
    }

    // 1. Ejecutar verificación inicial
    if (verificarAcceso()) return;

    // 2. Buscar la llave en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const llaveIngresada = urlParams.get('key');

    if (llaveIngresada === llaveCorrecta) {
        sessionStorage.setItem("accesoPermitido", "true");
        sessionStorage.setItem("horaAcceso", Date.now().toString());
        
        window.history.replaceState({}, document.title, window.location.pathname);
        document.documentElement.style.visibility = "visible";
        document.documentElement.style.display = "block";
        bloquearInspeccion();
    } else {
        // 3. Mostrar pantalla de bloqueo
        window.stop();
        
        const htmlBloqueo = `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Acceso Restringido</title>
            <style>
                body { margin:0; padding:0; background-color: #f8f9fa; color: #333; font-family: sans-serif; overflow: hidden; }
                .container { height: 100vh; width: 100vw; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .icon { font-size: 60px; margin-bottom: 20px; }
                h1 { color: #d9534f; }
                p { font-size: 18px; max-width: 420px; line-height: 1.6; padding: 0 25px; }
            </style>
        </head>
        <body oncontextmenu="return false;">
            <div class="container">
                <div class="icon">🚫</div>
                <h1>Acceso Restringido o Expirado</h1>
                <p>Por seguridad, la sesión dura 30 minutos.<br>
                   Por favor, <b>escanee el código QR autorizado</b> nuevamente.</p>
            </div>
        </body>`;

        document.open();
        document.write(htmlBloqueo);
        document.close();
        document.documentElement.style.visibility = "visible";
    }
})();