(function() {
    const llaveCorrecta = "AguaNevada2026"; 

    // 1. Verificar si ya tiene permiso en la sesión
    if (sessionStorage.getItem("accesoPermitido") === "true") {
        document.documentElement.style.display = "block";
        return;
    }

    // 2. Buscar la llave en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const llaveIngresada = urlParams.get('key');

    if (llaveIngresada === llaveCorrecta) {
        sessionStorage.setItem("accesoPermitido", "true");
        window.history.replaceState({}, document.title, window.location.pathname);
        document.documentElement.style.display = "block";
    } else {
        // --- ESTA ES LA PARTE QUE CORRIGE EL ERROR ---
        window.stop(); // Detiene la carga de imágenes y scripts restantes
        
        document.documentElement.innerHTML = `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Acceso Restringido</title>
        </head>
        <body style="margin:0; padding:0;">
            <div style="
                height: 100vh; width: 100vw;
                display: flex; flex-direction: column; 
                justify-content: center; align-items: center; 
                font-family: sans-serif; background-color: #f8f9fa; 
                color: #333; text-align: center; position: fixed; top:0; left:0; z-index: 999999;">
                
                <div style="font-size: 50px; margin-bottom: 20px;">🚫</div>
                <h1 style="color: #d9534f;">Acceso Restringido</h1>
                <p style="font-size: 18px; max-width: 400px; line-height: 1.5; padding: 0 20px;">
                    Esta página contiene información privada de mantenimiento. 
                    Solo puede acceder <b>escaneando el código QR autorizado</b>.
                </p>
                <hr style="width: 50px; border: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 14px; color: #777;">Si usted es personal autorizado y no puede ingresar, contacte al supervisor.</p>
            </div>
        </body>`;
        
        document.documentElement.style.display = "block";
    }
})();