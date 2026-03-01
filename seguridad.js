(function() {
    // 1. BLOQUEO VISUAL E INTERFAZ
    document.documentElement.style.display = "none";
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' || (e.ctrlKey && (e.key === 'u' || e.key === 's')) || (e.ctrlKey && e.shiftKey && e.key === 'i')) {
            e.preventDefault();
            return false;
        }
    });

    // Anti-Inspección
    setInterval(() => {
        (function() { return false; }['constructor']('debugger')());
    }, 50);

    // ===== CONFIGURACIÓN MAESTRA =====
    const LLAVE_QR = "8L9]zykR^R,faETFcxAguaNevada2026";
    const CLAVE_TECNICA = "Agua2026_Admin"; 
    const TIEMPO_EXPIRACION = 15 * 60 * 1000; // 15 Minutos estrictos

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
        <body>
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
            alert("Clave incorrecta.");
            location.reload();
        }
    }

    async function validar() {
        const urlParams = new URLSearchParams(window.location.search);
        const llaveURL = urlParams.get('key');
        const accesoSesion = sessionStorage.getItem("accesoPermitido");
        const horaSesion = sessionStorage.getItem("horaAcceso");
        const ahora = Date.now();

        // 1. FILTRO DE PAÍS (EL SALVADOR)
        let ipPublica = "Detectando...";
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            ipPublica = data.ip;
            if (data.country_code !== 'SV' && data.country_code !== undefined) {
                mostrarBloqueo("Este sistema solo es accesible desde <b>El Salvador</b>.", ipPublica);
                return;
            }
        } catch (e) { 
            // Si falla el servicio de IP, permitimos continuar pero con cautela
            ipPublica = "Error de verificación (Red Local)"; 
        }

        // 2. VERIFICAR SI LA SESIÓN ESTÁ ACTIVA (15 MINUTOS)
        if (accesoSesion === "true" && horaSesion) {
            if (ahora - parseInt(horaSesion) < TIEMPO_EXPIRACION) {
                limpiarURL();
                document.documentElement.style.display = "block";
                return;
            } else {
                // Sesión expirada
                sessionStorage.clear();
                solicitarClave("SU SESIÓN HA EXPIRADO (15 min).\nIngrese clave para continuar:");
                return;
            }
        }

        // 3. SI NO HAY SESIÓN, VALIDAR LLAVE QR O PEDIR CLAVE
        if (llaveURL === LLAVE_QR) {
            // Entró por QR válido: activar sesión y mostrar
            sessionStorage.setItem("accesoPermitido", "true");
            sessionStorage.setItem("horaAcceso", ahora.toString());
            limpiarURL();
            document.documentElement.style.display = "block";
        } else {
            // No tiene llave QR o es incorrecta: pedir clave técnica directamente
            solicitarClave("ACCESO RESTRINGIDO: Ingrese Clave de Administrador:");
        }
    }

    validar();
})();