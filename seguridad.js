(function() {
    // 0. Ocultar todo desde el segundo 1
    document.documentElement.style.display = "none";

    const llaveCorrecta = "8L9]zykR^R,=faETFcxAguaNevada2026";
    const TIEMPO_EXPIRACION = 30 * 60 * 1000; // 30 minutos

    function bloquearInspeccion() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || (e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J'))) || e.key === 'F12') {
                e.preventDefault();
            }
        });
    }

    function mostrarBloqueo() {
        // Detener carga de la página original
        window.stop();
        
        const mensajeHTML = `
            <div style="height: 100vh; width: 100vw; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif; background-color: #f8f9fa; color: #333; text-align: center; position: fixed; top:0; left:0; z-index: 9999999;">
                <div style="font-size: 60px; margin-bottom: 20px;">🚫</div>
                <h1 style="color: #d9534f; margin: 0 0 15px 0;">Acceso Restringido o Expirado</h1>
                <p style="font-size: 18px; max-width: 450px; line-height: 1.6; padding: 0 20px;">
                    Su sesión ha caducado o la llave es incorrecta.<br>
                    Por favor, <b>escanee el código QR autorizado</b> para ingresar al sistema de mantenimiento.
                </p>
                <div style="margin-top: 20px; color: #888; font-size: 14px;">Agua Envasada Monte Nevada 2026</div>
				<div style="margin-top: 20px; color: #888; font-size: 14px;">Nos Reservamos el derecho de Acceso</div>
            </div>`;

        // Inyectar directamente en el body y forzar visibilidad
        document.documentElement.innerHTML = `<head><title>Acceso Restringido</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${mensajeHTML}</body>`;
        document.documentElement.style.display = "block";
    }

    // 1. Verificar Sesión Existente
    const acceso = sessionStorage.getItem("accesoPermitido");
    const horaInicio = sessionStorage.getItem("horaAcceso");
    const ahora = Date.now();

    let autorizado = false;

    if (acceso === "true" && horaInicio) {
        if (ahora - parseInt(horaInicio) < TIEMPO_EXPIRACION) {
            autorizado = true;
        } else {
            sessionStorage.clear();
        }
    }

    // 2. Verificar si viene con nueva llave en URL
    const urlParams = new URLSearchParams(window.location.search);
    const llaveIngresada = urlParams.get('key');

    if (llaveIngresada === llaveCorrecta) {
        sessionStorage.setItem("accesoPermitido", "true");
        sessionStorage.setItem("horaAcceso", ahora.toString());
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
        autorizado = true;
    }

    // 3. Decisión final
    if (autorizado) {
        document.documentElement.style.display = "block";
        bloquearInspeccion();
    } else {
        mostrarBloqueo();
    }
})();