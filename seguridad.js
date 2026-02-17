(function() {
    // 1. Bloqueo visual inicial
    document.documentElement.style.display = "none";

    // ===== CONFIGURACIÓN MAESTRA =====
    const LLAVE_QR = "8L9]zykR^R,=faETFcxAguaNevada2026";
    const CLAVE_TECNICA = "Agua2026_Admin"; 
    const TIEMPO_EXPIRACION = 30 * 60 * 1000; // 30 Minutos
    const PLANTA = { lat: 13.341861, lon: -88.444417 }; 
    const RADIO_PERMITIDO_KM = 0.075; // 75 Metros

    const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 2. UTILIDADES
    function calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function limpiarURL() {
        const urlLimpia = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, urlLimpia);
    }

    function mostrarBloqueo(mensaje, ipDetectada = "Verificando...") {
        window.stop();
        const icono = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM4 12C4 7.581 7.581 4 12 4C13.848 4 15.535 4.626 16.879 5.678L5.678 16.879C4.626 15.535 4 13.848 4 12ZM12 20C10.152 20 8.465 19.374 7.121 18.322L18.322 7.121C19.374 8.465 20 10.152 20 12C20 16.419 16.419 20 12 20Z" fill="#d9534f"/></svg>`;
        document.documentElement.innerHTML = `
        <head>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin:0; background:#f0f2f5; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; }
                .card { background:white; padding:30px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.1); width:85%; max-width:400px; text-align:center; }
                h1 { color:#d9534f; font-size:22px; margin: 15px 0; }
                p { color: #555; line-height: 1.5; font-size: 15px; }
                .ip-box { margin-top:20px; padding:10px; background:#f8f9fa; border-radius:10px; font-family:monospace; font-size:11px; color: #777; }
            </style>
        </head>
        <body>
            <div class="card">
                <div>${icono}</div>
                <h1>Acceso Denegado</h1>
                <p>${mensaje}</p>
                <div class="ip-box">IDENTIFICADOR DE RED:<br><strong>${ipDetectada}</strong></div>
            </div>
        </body>`;
        document.documentElement.style.display = "block";
    }

    function solicitarClave(mensajePrompt) {
        limpiarURL(); // La llave desaparece antes de que el usuario pueda copiarla
        const pass = prompt(mensajePrompt);
        if (pass === CLAVE_TECNICA) {
            sessionStorage.setItem("accesoPermitido", "true");
            sessionStorage.setItem("horaAcceso", Date.now().toString());
            document.documentElement.style.display = "block";
        } else {
            alert("Clave incorrecta o acción cancelada.");
            location.reload();
        }
    }

    // 3. LÓGICA DE VALIDACIÓN
    async function validar() {
        const urlParams = new URLSearchParams(window.location.search);
        const llaveURL = urlParams.get('key');
        const accesoSesion = sessionStorage.getItem("accesoPermitido");
        const horaSesion = sessionStorage.getItem("horaAcceso");
        const ahora = Date.now();

        // Obtener IP y validar país
        let ipPublica = "Detectando...";
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ipPublica = data.ip;
            if (data.country_code !== 'SV' && data.country_code !== undefined) {
                mostrarBloqueo("Sistema accesible únicamente en <b>El Salvador</b>.", ipPublica);
                return;
            }
        } catch (e) { ipPublica = "Red Local"; }

        // Verificar si la sesión sigue activa
        if (accesoSesion === "true" && (ahora - parseInt(horaSesion) < TIEMPO_EXPIRACION)) {
            limpiarURL();
            document.documentElement.style.display = "block";
            return;
        }

        // Bloqueo si no hay llave en la URL
        if (llaveURL !== LLAVE_QR) {
            mostrarBloqueo("Contenido privado. Debe escanear el <b>código QR autorizado</b> dentro de la planta.", ipPublica);
            return;
        }

        // Proceso según dispositivo con llave válida
        if (esMovil) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const dist = calcularDistancia(pos.coords.latitude, pos.coords.longitude, PLANTA.lat, PLANTA.lon);
                    if (dist <= RADIO_PERMITIDO_KM) {
                        limpiarURL();
                        sessionStorage.setItem("accesoPermitido", "true");
                        sessionStorage.setItem("horaAcceso", ahora.toString());
                        document.documentElement.style.display = "block";
                    } else {
                        // TU CAMBIO SOLICITADO AQUÍ:
                        solicitarClave("ACCESO DENEGADO: Debe permanecer dentro de las instalaciones.\n\nSi está autorizado, por favor ingrese su clave de acceso o solicítela al administrador.");
                    }
                },
                () => { 
                    solicitarClave("GPS NO DETECTADO: El sistema requiere ubicación activa.\n\nSi es personal técnico, ingrese su clave de acceso:"); 
                },
                { enableHighAccuracy: true, timeout: 6000 }
            );
        } else {
            solicitarClave("SISTEMA TÉCNICO: Ingrese clave de acceso para PC:");
        }
    }

    validar();
})();