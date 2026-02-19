function evaluar() {

    let respuestasCorrectas = {
        p1: "b",
        p2: "b",
        p3: "b",
        p4: "c",
        p5: "b"
    };

    let puntaje = 0;
    let totalPreguntas = 5;

    for (let pregunta in respuestasCorrectas) {
        let seleccion = document.querySelector('input[name="' + pregunta + '"]:checked');
        
        if (seleccion && seleccion.value === respuestasCorrectas[pregunta]) {
            puntaje++;
        }
    }

    let porcentaje = (puntaje / totalPreguntas) * 100;

    document.getElementById("resultado").innerHTML =
        puntaje + " / " + totalPreguntas + " correctas (" + porcentaje + "%)";
}

(function() {
    const canvas = document.getElementById('canvasFlujo');
    const ctx = canvas.getContext('2d');
    const infoSpan = document.getElementById('infoFlujo');
    
    // Elementos del tooltip
    const tooltip = document.getElementById('tooltipEconomico');
    const tooltipTitulo = document.getElementById('tooltipTitulo');
    const tooltipCuerpo = document.getElementById('tooltipCuerpo');
    
    // Elementos de estadísticas
    const statConsumo = document.getElementById('statConsumo');
    const statInversion = document.getElementById('statInversion');
    const statSalarios = document.getElementById('statSalarios');
    const barConsumo = document.getElementById('barConsumo');
    const barInversion = document.getElementById('barInversion');
    const barSalarios = document.getElementById('barSalarios');

    // parámetros modificables
    let paramFam = 1.0;
    let paramEmp = 1.0;
    let paramSal = 1.0;

    // elementos DOM
    const sliderFam = document.getElementById('sliderFam');
    const sliderEmp = document.getElementById('sliderEmp');
    const sliderSal = document.getElementById('sliderSal');
    const resetBtn = document.getElementById('resetParams');

    // posiciones de los sectores
    const sectors = {
        familias: { x: 150, y: 130, w: 140, h: 110 },
        empresas: { x: 410, y: 130, w: 140, h: 110 }
    };

    // Descripciones detalladas para cada elemento
    const descripciones = {
        familias: {
            titulo: "FAMILIAS",
            desc: "Unidades consumidoras y propietarias de factores productivos.",
            detalles: [
                "• Ofrecen trabajo a las empresas",
                "• Reciben salarios a cambio",
                "• Consumen bienes y servicios",
                "• Pagan por los productos",
                "• Son el origen de la demanda"
            ]
        },
        empresas: {
            titulo: "EMPRESAS",
            desc: "Unidades productoras que generan bienes y servicios.",
            detalles: [
                "• Contratan trabajo de las familias",
                "• Pagan salarios por el trabajo",
                "• Producen bienes y servicios",
                "• Reciben ingresos por ventas",
                "• Invierten en mejorar producción"
            ]
        },
        flujoBienes: {
            titulo: "FLUJO REAL: BIENES",
            desc: "Las empresas envían productos a las familias.",
            detalles: [
                "• Incluye bienes de consumo",
                "• También servicios",
                "• Satisface necesidades",
                "• Flujo de ida: empresas → familias",
                "• Intensidad: " + Math.round(paramEmp * 100) + "%"
            ]
        },
        flujoTrabajo: {
            titulo: "FLUJO REAL: TRABAJO",
            desc: "Las familias aportan su fuerza laboral.",
            detalles: [
                "• Factor productivo esencial",
                "• Incluye tiempo y esfuerzo",
                "• Habilidades y conocimientos",
                "• Flujo de ida: familias → empresas",
                "• Intensidad: " + Math.round(paramFam * 100) + "%"
            ]
        },
        flujoGasto: {
            titulo: "FLUJO MONETARIO: GASTO",
            desc: "Las familias pagan por los bienes.",
            detalles: [
                "• Dinero a cambio de productos",
                "• Ingreso principal de empresas",
                "• Permite reinversión",
                "• Flujo de ida: familias → empresas",
                "• Intensidad: " + Math.round(paramFam * 100) + "%"
            ]
        },
        flujoSalarios: {
            titulo: "FLUJO MONETARIO: SALARIOS",
            desc: "Las empresas remuneran el trabajo.",
            detalles: [
                "• Pago por trabajo realizado",
                "• Principal ingreso de familias",
                "• Permite consumo futuro",
                "• Flujo de ida: empresas → familias",
                "• Intensidad: " + Math.round(paramSal * 100) + "%"
            ]
        }
    };

    // Actualizar estadísticas
    function actualizarEstadisticas() {
        const consumo = Math.round(paramFam * 100);
        const inversion = Math.round(paramEmp * 100);
        const salarios = Math.round(paramSal * 100);
        
        statConsumo.textContent = consumo + '%';
        statInversion.textContent = inversion + '%';
        statSalarios.textContent = salarios + '%';
        
        barConsumo.style.width = consumo + '%';
        barInversion.style.width = inversion + '%';
        barSalarios.style.width = salarios + '%';
        
        // Cambiar color según intensidad
        barConsumo.style.background = `linear-gradient(90deg, #2b7a4e, ${paramFam > 1 ? '#cfa418' : '#3498db'})`;
        barInversion.style.background = `linear-gradient(90deg, #217ca5, ${paramEmp > 1 ? '#cfa418' : '#9b59b6'})`;
        barSalarios.style.background = `linear-gradient(90deg, #9b5e9b, ${paramSal > 1 ? '#cfa418' : '#e67e22'})`;
    }

    // Mostrar tooltip
    function mostrarTooltip(titulo, cuerpo, x, y) {
        tooltipTitulo.textContent = titulo;
        
        // Formatear cuerpo con detalles si es array
        if (Array.isArray(cuerpo)) {
            tooltipCuerpo.innerHTML = '<strong>' + cuerpo[0] + '</strong><br>' + 
                cuerpo.slice(1).join('<br>');
        } else {
            tooltipCuerpo.textContent = cuerpo;
        }
        
        tooltip.style.left = (x + 20) + 'px';
        tooltip.style.top = (y - 100) + 'px';
        tooltip.classList.add('visible');
    }

    function ocultarTooltip() {
        tooltip.classList.remove('visible');
    }

    function drawModel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // sombras
        ctx.shadowColor = 'rgba(0,15,30,0.2)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        // FAMILIAS
        ctx.fillStyle = '#a2d9f5';
        ctx.strokeStyle = '#1a4863';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(sectors.familias.x, sectors.familias.y, sectors.familias.w, sectors.familias.h, 28);
        ctx.fill();
        ctx.stroke();
        
        // Texto familias
        ctx.shadowBlur = 8;
        ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
        ctx.fillStyle = '#113946';
        ctx.fillText('FAMILIAS', sectors.familias.x + 15, sectors.familias.y + 45);
        ctx.font = '500 13px "Inter", sans-serif';
        ctx.fillStyle = '#1d4e63';
        ctx.fillText('trabajo · consumo', sectors.familias.x + 18, sectors.familias.y + 75);
        
        // Indicador de actividad familias
        ctx.beginPath();
        ctx.arc(sectors.familias.x + 120, sectors.familias.y + 20, 8, 0, 2 * Math.PI);
        ctx.fillStyle = paramFam > 1 ? '#cfa418' : '#27ae60';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // EMPRESAS
        ctx.fillStyle = '#c7e9b0';
        ctx.strokeStyle = '#235b2b';
        ctx.beginPath();
        ctx.roundRect(sectors.empresas.x, sectors.empresas.y, sectors.empresas.w, sectors.empresas.h, 28);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1f5420';
        ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('EMPRESAS', sectors.empresas.x + 18, sectors.empresas.y + 45);
        ctx.font = '500 13px "Inter", sans-serif';
        ctx.fillStyle = '#1e4a2c';
        ctx.fillText('bienes · salarios', sectors.empresas.x + 20, sectors.empresas.y + 75);
        
        // Indicador de actividad empresas
        ctx.beginPath();
        ctx.arc(sectors.empresas.x + 20, sectors.empresas.y + 20, 8, 0, 2 * Math.PI);
        ctx.fillStyle = paramEmp > 1 ? '#cfa418' : '#27ae60';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // FLUJOS
        ctx.shadowBlur = 12;
        ctx.lineCap = 'round';

        // 1. Bienes (Empresas → Familias)
        ctx.strokeStyle = '#217ca5';
        ctx.lineWidth = 3 + paramEmp * 4;
        drawCurvedArrow(
            sectors.empresas.x - 10, sectors.empresas.y + 30,
            sectors.familias.x + sectors.familias.w + 10, sectors.familias.y + 30,
            0.2, '#217ca5', 'Bienes', 'flujoBienes'
        );

        // 2. Trabajo (Familias → Empresas)
        ctx.strokeStyle = '#3b93b8';
        ctx.lineWidth = 3 + paramFam * 3.5;
        drawCurvedArrow(
            sectors.familias.x + sectors.familias.w - 20, sectors.familias.y + 60,
            sectors.empresas.x + 20, sectors.empresas.y + 60,
            -0.15, '#3b93b8', 'Trabajo', 'flujoTrabajo'
        );

        // 3. Gasto (Familias → Empresas)
        ctx.strokeStyle = '#2b7a4e';
        ctx.lineWidth = 3 + paramFam * 4.5;
        drawCurvedArrow(
            sectors.familias.x + sectors.familias.w - 30, sectors.familias.y + 85,
            sectors.empresas.x + 30, sectors.empresas.y + 85,
            0.25, '#2b7a4e', 'Gasto $', 'flujoGasto'
        );

        // 4. Salarios (Empresas → Familias)
        ctx.strokeStyle = '#9b5e9b';
        ctx.lineWidth = 3 + paramSal * 4.5;
        drawCurvedArrow(
            sectors.empresas.x - 20, sectors.empresas.y + 100,
            sectors.familias.x + sectors.familias.w, sectors.familias.y + 100,
            -0.2, '#9b5e9b', 'Salarios $', 'flujoSalarios'
        );

        // Actualizar estadísticas
        actualizarEstadisticas();
    }

    // Función de flecha mejorada con interactividad
    function drawCurvedArrow(startX, startY, endX, endY, offsetPct, color, label, tipoFlujo) {
        const midX = (startX + endX) / 2 + 40 * offsetPct;
        const midY = (startY + endY) / 2 - 30 * offsetPct;

        // Guardar información del flujo para interactividad
        const flujoInfo = {
            tipo: tipoFlujo,
            inicio: { x: startX, y: startY },
            fin: { x: endX, y: endY },
            mid: { x: midX, y: midY },
            color: color,
            label: label
        };

        // Dibujar línea
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.strokeStyle = color;
        ctx.stroke();

        // Flecha
        let t = 0.9;
        let arrowX = (1-t)*(1-t)*startX + 2*(1-t)*t*midX + t*t*endX;
        let arrowY = (1-t)*(1-t)*startY + 2*(1-t)*t*midY + t*t*endY;
        
        let dx = 2*(1-t)*(midX-startX) + 2*t*(endX-midX);
        let dy = 2*(1-t)*(midY-startY) + 2*t*(endY-midY);
        let angle = Math.atan2(dy, dx);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 12 * Math.cos(angle - 0.5), arrowY - 12 * Math.sin(angle - 0.5));
        ctx.lineTo(arrowX - 12 * Math.cos(angle + 0.5), arrowY - 12 * Math.sin(angle + 0.5));
        ctx.closePath();
        ctx.fill();

        // Etiqueta
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'white';
        ctx.font = 'bold 12px "Inter", "Segoe UI", sans-serif';
        
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowBlur = 0;
        ctx.fillRect(midX - textWidth/2 - 5, midY - 18, textWidth + 10, 24);
        
        ctx.fillStyle = '#111111';
        ctx.font = 'bold 12px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(label, midX - textWidth/2, midY - 5);
        ctx.restore();
    }

    // Manejador de movimiento del mouse
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        const clientX = e.clientX;
        const clientY = e.clientY;

        // Detectar hover en familias
        if (mouseX >= sectors.familias.x && mouseX <= sectors.familias.x + sectors.familias.w &&
            mouseY >= sectors.familias.y && mouseY <= sectors.familias.y + sectors.familias.h) {
            mostrarTooltip(
                descripciones.familias.titulo,
                [descripciones.familias.desc, ...descripciones.familias.detalles],
                clientX, clientY
            );
            canvas.style.cursor = 'pointer';
            infoSpan.innerText = 'Familias: unidades consumidoras';
        }
        // Detectar hover en empresas
        else if (mouseX >= sectors.empresas.x && mouseX <= sectors.empresas.x + sectors.empresas.w &&
                 mouseY >= sectors.empresas.y && mouseY <= sectors.empresas.y + sectors.empresas.h) {
            mostrarTooltip(
                descripciones.empresas.titulo,
                [descripciones.empresas.desc, ...descripciones.empresas.detalles],
                clientX, clientY
            );
            canvas.style.cursor = 'pointer';
            infoSpan.innerText = 'Empresas: unidades productoras';
        }
        else {
            ocultarTooltip();
            canvas.style.cursor = 'default';
        }
    });

    canvas.addEventListener('mouseleave', () => {
        ocultarTooltip();
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        if (mouseX >= sectors.familias.x && mouseX <= sectors.familias.x + sectors.familias.w &&
            mouseY >= sectors.familias.y && mouseY <= sectors.familias.y + sectors.familias.h) {
            infoSpan.innerHTML = '<strong>FAMILIAS:</strong> ' + descripciones.familias.desc;
        }
        else if (mouseX >= sectors.empresas.x && mouseX <= sectors.empresas.x + sectors.empresas.w &&
                 mouseY >= sectors.empresas.y && mouseY <= sectors.empresas.y + sectors.empresas.h) {
            infoSpan.innerHTML = '<strong>EMPRESAS:</strong> ' + descripciones.empresas.desc;
        }
    });

    function updateFromSliders() {
        paramFam = parseFloat(sliderFam.value);
        paramEmp = parseFloat(sliderEmp.value);
        paramSal = parseFloat(sliderSal.value);
        drawModel();
    }

    sliderFam.addEventListener('input', updateFromSliders);
    sliderEmp.addEventListener('input', updateFromSliders);
    sliderSal.addEventListener('input', updateFromSliders);

    resetBtn.addEventListener('click', () => {
        sliderFam.value = '1.0';
        sliderEmp.value = '1.0';
        sliderSal.value = '1.0';
        updateFromSliders();
        infoSpan.innerHTML = '<strong>Valores restablecidos:</strong> equilibrio económico 100%';
    });

    updateFromSliders();
    
    window.addEventListener('resize', () => drawModel());

})();