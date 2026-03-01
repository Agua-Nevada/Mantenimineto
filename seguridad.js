(function() {
    // 1. BLOQUEO VISUAL INICIAL
    document.documentElement.style.display = "none";
    
    // Bloqueos de seguridad
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && (e.key === 'u' || e.key === 's')) || (e.ctrlKey && e.shiftKey && e.key === 'i')) {
            e.preventDefault();
        }
    });

    // ===== CONFIGURACIÓN MAESTRA =====
    // Verifica que esta llave sea EXACTAMENTE la que generas en el QR
    const LLAVE_QR = "8L9]zykR^R,=faETFcxAguaNevada2026";
    const CLAVE_TECNICA = "Agua2026_Admin"; 
    const TIEMPO_EXPIRACION = 15 * 60 * 1000; 

    function limpiarURL() {
        const urlLimpia = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, urlLimpia);
    }

    window.intentarAccesoManual = function() {
        const pass = prompt("SISTEMA DE EMERGENCIA\nIngrese clave de administrador:");
        if (pass === CLAVE_TECNICA) {
            sessionStorage.setItem("accesoPermitido", "true");
            sessionStorage.setItem("horaAcceso", Date.now().toString());
            location.href = window.location.pathname; // Recargar limpio
        } else if (pass !== null) {
            alert("Clave incorrecta.");
        }
    };

    function mostrarPantallaError(mensaje, ipDetectada = "Verificando...") {
        window.stop();
        document.documentElement.innerHTML = `
        <head>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin:0; background:#f0f2f5; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; user-select:none; }
                .card { background:white; padding:35px; border-radius:20px; box-shadow:0 10px 25px rgba(0,0,0,0.1); width:85%; max-width:400px; text-align:center; }
                h1 { color:#d9534f; font-size:24px; margin-bottom:15px; }
                p { color: #555; line-height: 1.6; font-size: 15px; }
                .btn-manual { display:inline-block; margin-top:20px; color:#007bff; text-decoration:none; font-weight:bold; cursor:pointer; font-size:14px; border:1px solid #007bff; padding:8px 15px; border-radius:8px; transition: 0.3s; }
                .btn-manual:hover { background:#007bff; color:white; }
                .ip-box { margin-top:25px; padding:10px; background:#f8f9fa; border-radius:10px; font-family:monospace; font-size:11px; color: #888; border:1px solid #eee; }
            </style>
        </head>
        <body>
            <div class="card">
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

        // 1. PRIORIDAD: ¿Tiene la llave correcta ahora mismo?
        if (llaveURL === LLAVE_QR) {
            sessionStorage.setItem("accesoPermitido", "true");
            sessionStorage.setItem("horaAcceso", ahora.toString());
            limpiarURL();
            document.documentElement.style.display = "block";
            return;
        }

        // 2. ¿Tiene una sesión activa de menos de 15 min?
        if (accesoSesion === "true" && horaSesion) {
            if (ahora - parseInt(horaSesion) < TIEMPO_EXPIRACION) {
                document.documentElement.style.display = "block";
                return;
            } else {
                sessionStorage.clear(); // Sesión expirada
            }
        }

        // 3. SI NO TIENE LLAVE NI SESIÓN, VERIFICAMOS PAÍS ANTES DE MOSTRAR ERROR
        let ipPublica = "Detectando...";
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ipPublica = data.ip;
            if (data.country_code !== 'SV' && data.country_code !== undefined) {
                mostrarPantallaError("Este sistema solo es accesible dentro de <b>El Salvador</b>.", ipPublica);
                return;
            }
        } catch (e) { ipPublica = "Red Local"; }

        // Mostrar pantalla de error por falta de llave
        mostrarPantallaError("No se detectó una llave válida o su sesión ha expirado.", ipPublica);
    }

    validar();
})();