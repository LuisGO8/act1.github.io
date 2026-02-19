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