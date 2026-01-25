(function() {
    // 0. Ocultar contenido inmediatamente
    document.documentElement.style.display = "none";

    const llaveCorrecta = "8L9]zykR^R,=faETFcxAguaNevada2026";
    const TIEMPO_EXPIRACION = 30 * 60 * 1000; // 30 minutos

    function bloquearInspeccion() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || (e.shiftKey && (e.key === 'i' || e.key === 'I'))) || e.key === 'F12') {
                e.preventDefault();
            }
        });
    }

    function mostrarBloqueo(mensaje, ipDetectada = "Verificando...") {
        window.stop();
        document.documentElement.innerHTML = `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Acceso Denegado</title>
        </head>
        <body style="margin:0; padding:0; background-color: #f8f9fa;">
            <div style="
                height: 100vh; width: 100vw;
                display: flex; flex-direction: column; 
                justify-content: center; align-items: center; 
                font-family: sans-serif; color: #333; text-align: center; position: fixed; top:0; left:0; z-index: 999999;">
                
                <div style="font-size: 50px; margin-bottom: 20px;">??</div>
                <h1 style="color: #d9534f;">Acceso Denegado</h1>
                <p style="font-size: 18px; max-width: 450px; line-height: 1.5; padding: 0 20px;">
                    ${mensaje}
                </p>
                <hr style="width: 50px; border: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 14px; color: #777;">Si usted es personal autorizado y no puede ingresar, contacte al supervisor.</p>
                <div style="margin-top: 10px; color: #888; font-size: 14px;">Agua Envasada Monte Nevada 2026</div>
                <div style="margin-top: 5px; color: #888; font-size: 14px;">Nos reservamos el derecho de acceso</div>
                <div style="margin-top: 15px; padding: 8px 15px; background: #eee; border-radius: 5px; font-family: monospace; font-size: 12px; color: #555;">
                    SU IP: ${ipDetectada}
                </div>
            </div>
        </body>`;
        document.documentElement.style.display = "block";
    }

    async function validar() {
        const urlParams = new URLSearchParams(window.location.search);
        const llaveURL = urlParams.get('key');
        
        // --- LIMPIEZA INMEDIATA DE LA URL ---
        if (llaveURL) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const accesoSesion = sessionStorage.getItem("accesoPermitido");
        const horaSesion = sessionStorage.getItem("horaAcceso");
        const ahora = Date.now();

        // 1. Obtener datos de IP y Pa赤s
        let ipPublica = "No detectada";
        let paisCodigo = "";
        
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ipPublica = data.ip;
            paisCodigo = data.country_code; 
        } catch (e) {
            console.error("Error al verificar IP");
        }

        // 2. L車gica de validaci車n
        let tieneCredenciales = (llaveURL === llaveCorrecta) || 
                               (accesoSesion === "true" && (ahora - parseInt(horaSesion) < TIEMPO_EXPIRACION));

        // 3. Verificaci車n de Pa赤s (Solo El Salvador = SV)
        // Permitimos el acceso si estamos en SV o si la IP no pudo determinarse (para evitar bloqueos por errores de API)
        if (paisCodigo !== 'SV' && paisCodigo !== "") {
            mostrarBloqueo("La p芍gina solo puede ser visible desde El Salvador y con las credenciales correctas.", ipPublica);
            return;
        }

        // 4. Verificaci車n de Credenciales
        if (tieneCredenciales) {
            if (llaveURL === llaveCorrecta) {
                sessionStorage.setItem("accesoPermitido", "true");
                sessionStorage.setItem("horaAcceso", ahora.toString());
            }
            document.documentElement.style.display = "block";
            bloquearInspeccion();
        } else {
            const msg = (accesoSesion === "true") ? 
                "Su sesi車n ha expirado. Solo puede acceder <b>escaneando el c車digo QR autorizado</b>." : 
                "Esta p芍gina contiene informaci車n privada. Solo puede acceder <b>escaneando el c車digo QR autorizado</b>.";
            mostrarBloqueo(msg, ipPublica);
        }
    }

    validar();
})();