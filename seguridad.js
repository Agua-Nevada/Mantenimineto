(function() {
    // 1. BLOQUEO VISUAL Y RESTRICCIONES DE INTERFAZ INMEDIATAS
    document.documentElement.style.display = "none";
    
    // Bloqueo de Clic Derecho
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Bloqueo de atajos de teclado (F12, Ctrl+U, Ctrl+Shift+I, etc.)
    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) || 
            (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C'))
        ) {
            e.preventDefault();
            return false;
        }
    });

    // Anti-Inspección: Bucle para bloquear la consola de desarrollador
    setInterval(() => {
        (function() {
            return false;
        }['constructor']('debugger')());
    }, 50);

    // ===== CONFIGURACIÓN MAESTRA MONTE NEVADO =====
    const LLAVE_QR = "8L9]zykR^R,=faETFcxAguaNevada2026";
    const CLAVE_TECNICA = "Agua2026_Admin"; 
    const TIEMPO_EXPIRACION = 15 * 60 * 1000; // Ajustado a 15 Minutos
    const PLANTA = { lat: 13.341861, lon: -88.444417 }; 
    const RADIO_PERMITIDO_KM = 0.075; // 75 metros

    const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
        document.documentElement.innerHTML = `
        <head>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin:0; background:#f0f2f5; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; user-select:none; }
                .card { background:white; padding:30px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.1); width:85%; max-width:400px; text-align:center; }
                h1 { color:#d9534f; font-size:22px; margin: 15px 0; }
                p { color: #555; line-height: 1.5; font-size: 15px; }
                .ip-box { margin-top:20px; padding:10px; background:#f8f9fa; border-radius:10px; font-family:monospace; font-size:11px; color: #777; }
            </style>
        </head>
        <body oncontextmenu="return false;">
            <div class="card">
                <h1 style="font-size:50px; margin:0;">⚠️</h1>
                <h1>Acceso Restringido</h1>
                <p>${mensaje}</p>
                <div class="ip-box">IDENTIFICADOR DE RED:<br><strong>${ipDetectada}</strong></div>
            </div>
        </body>`;
        document.documentElement.style.display = "block";
    }

    function solicitarClave(mensajePrompt) {
        limpiarURL(); 
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

    async function validar() {
        const urlParams = new URLSearchParams(window.location.search);
        const llaveURL = urlParams.get('key');
        const accesoSesion = sessionStorage.getItem("accesoPermitido");
        const horaSesion = sessionStorage.getItem("horaAcceso");
        const ahora = Date.now();

        // 1. FILTRO DE PAÍS (Global)
        let ipPublica = "Detectando...";
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ipPublica = data.ip;
            if (data.country_code !== 'SV' && data.country_code !== undefined) {
                mostrarBloqueo("Este sistema solo es accesible dentro del territorio de <b>El Salvador</b>.", ipPublica);
                return;
            }
        } catch (e) { ipPublica = "Red Local"; }

        // 2. VERIFICAR SESIÓN (Máximo 15 minutos)
        if (accesoSesion === "true" && (ahora - parseInt(horaSesion) < TIEMPO_EXPIRACION)) {
            limpiarURL();
            document.documentElement.style.display = "block";
            return;
        }

        // 3. VALIDAR LLAVE QR
        if (llaveURL !== LLAVE_QR) {
            mostrarBloqueo("Contenido privado. Solo puede acceder mediante el <b>código QR autorizado</b> en planta.", ipPublica);
            return;
        }

        // 4. VALIDACIÓN POR DISPOSITIVO
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
                        solicitarClave("ACCESO DENEGADO: Debe permanecer dentro de las instalaciones.\n\nSi está autorizado, por favor ingrese su clave de acceso o solicitela al administrador.");
                    }
                },
                () => { 
                    solicitarClave("GPS NO DETECTADO: El sistema requiere ubicación activa.\n\nSi es personal técnico, ingrese su clave de acceso:"); 
                },
                { enableHighAccuracy: true, timeout: 6000 }
            );
        } else {
            solicitarClave("SISTEMA TÉCNICO (PC): Ingrese clave de acceso:");
        }
    }

    validar();
})();