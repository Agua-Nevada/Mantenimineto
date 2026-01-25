(function() {
    document.documentElement.style.display = "none";

    const llaveCorrecta = "8L9]zykR^R,=faETFcxAguaNevada2026";
    const TIEMPO_EXPIRACION = 30 * 60 * 1000; 

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
        const iconoProhibido = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM4 12C4 7.581 7.581 4 12 4C13.848 4 15.535 4.626 16.879 5.678L5.678 16.879C4.626 15.535 4 13.848 4 12ZM12 20C10.152 20 8.465 19.374 7.121 18.322L18.322 7.121C19.374 8.465 20 10.152 20 12C20 16.419 16.419 20 12 20Z" fill="#d9534f"/></svg>`;

        document.documentElement.innerHTML = `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>Acceso Denegado</title>
            <style>
                body { margin:0; padding:0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                .container { height: 100vh; width: 100vw; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .card { background: white; padding: 30px 20px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 85%; max-width: 400px; }
                h1 { color: #d9534f; margin: 15px 0; font-size: 24px; }
                p { font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 20px; }
                .footer-text { font-size: 13px; color: #999; margin: 5px 0; }
                .ip-box { margin-top: 20px; padding: 12px; background: #f8f9fa; border: 1px solid #eee; border-radius: 10px; font-family: monospace; font-size: 13px; color: #444; }
                .divider { width: 40px; border: 1.5px solid #d9534f; margin: 0 auto 20px; border-radius: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div>${iconoProhibido}</div>
                    <h1>Acceso Denegado</h1>
                    <div class="divider"></div>
                    <p>${mensaje}</p>
                    <p style="font-size: 14px; color: #888;">Si es personal autorizado, contacte al supervisor de turno.</p>
                    <div class="ip-box">IDENTIFICADOR DE RED:<br><strong>${ipDetectada}</strong></div>
                    <div style="margin-top:25px;">
                        <div class="footer-text">Agua Envasada Monte Nevada 2026</div>
                        <div class="footer-text" style="font-weight:bold;">Seguridad Industrial</div>
                    </div>
                </div>
            </div>
        </body>`;
        document.documentElement.style.display = "block";
    }

    async function validar() {
        const urlParams = new URLSearchParams(window.location.search);
        const llaveURL = urlParams.get('key');
        
        if (llaveURL) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const accesoSesion = sessionStorage.getItem("accesoPermitido");
        const horaSesion = sessionStorage.getItem("horaAcceso");
        const ahora = Date.now();

        let ipPublica = "Detectando red...";
        let paisCodigo = "";
        
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ipPublica = data.ip;
            paisCodigo = data.country_code; 
        } catch (e) {
            ipPublica = "Error de conexi&oacute;n";
        }

        let tieneCredenciales = (llaveURL === llaveCorrecta) || 
                               (accesoSesion === "true" && (ahora - parseInt(horaSesion) < TIEMPO_EXPIRACION));

        if (paisCodigo !== 'SV' && paisCodigo !== "") {
            mostrarBloqueo("Este sistema solo es accesible dentro del territorio de <b>El Salvador</b>.", ipPublica);
            return;
        }

        if (tieneCredenciales) {
            if (llaveURL === llaveCorrecta) {
                sessionStorage.setItem("accesoPermitido", "true");
                sessionStorage.setItem("horaAcceso", ahora.toString());
            }
            document.documentElement.style.display = "block";
            bloquearInspeccion();
        } else {
            const msg = (accesoSesion === "true") ? 
                "Su sesi&oacute;n ha expirado por seguridad. Por favor, <b>escanee el c&oacute;digo QR</b> nuevamente." : 
                "Contenido privado. Solo puede acceder mediante el <b>c&oacute;digo QR autorizado</b> en planta.";
            mostrarBloqueo(msg, ipPublica);
        }
    }

    validar();
})();