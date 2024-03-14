var programas = [{
    "nombre": "Proceso 1",
    "tamano": 1048576,
},
{
    "nombre": "Proceso 2",
    "tamano": 1048576 * 2,
},
{
    "nombre": "Proceso 3",
    "tamano": 1048576 * 3,
},
{
    "nombre": "Proceso 4",
    "tamano": 1048576 / 2,
},
{
    "nombre": "Proceso",
    "tamano": 1048576 * 6,
},
]

var particionesVariables = [1, 2, 2, 3, 3, 4]
var gestionMemoria = 0;
var programasEjecutados = [];
var segmentosEjecutados = [];
var programasTTP = [];
var memoria = new Memoria();
var idProceso = 0;
var colores = [];

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function llenarProgramas() {
    document.getElementById("programas").replaceChildren();
    for (let i = 0; i < programas.length; i++) {
        const programa = programas[i];

        var fila = "<tr><td>" + programa.nombre + "</td><td>" + programa.tamano + "</td><td><button name = 'btnEncender' class='btn btnEncender'" + " value='" + i + "' disabled>Encender</button>" + "</td></tr>";

        var btn = document.createElement("TR");
        btn.innerHTML = fila;
        document.getElementById("programas").appendChild(btn);
    };
}

function mostrarTablasSeg(mostrar) {
    if (mostrar) {
        $("#tituloEjecutados").hide();
        $(".contenedorTablaEjecutados").hide();

        $("#tituloSegmentacion").show();
        $("#tablaSegemetnos").show();
        $(".contenedorTablaSegmentos").show();
        $("#tituloLibres").show();
        $("#tablaLibres").show();
        $(".contenedorTablaLibres").show();

        $("#tituloMarcos").hide();
        $("#tablaMarcos").hide();
        $(".contenedorTablaMarcos").hide();
        $("#tituloTPP").hide();
        $("#tablaTPP").hide();
        $(".contenedorTablaTPP").hide();
    } else {
        $("#tituloEjecutados").show();
        $(".contenedorTablaEjecutados").show();

        $("#tituloSegmentacion").hide();
        $("#tablaSegemetnos").hide();
        $(".contenedorTablaSegmentos").hide();
        $("#tituloLibres").hide();
        $("#tablaLibres").hide();
        $(".contenedorTablaLibres").hide();
    }
}

function mostrarTablasPag(mostrar) {
    if (mostrar) {
        $("#tituloEjecutados").hide();
        $(".contenedorTablaEjecutados").hide();

        $("#tituloSegmentacion").hide();
        $("#tablaSegemetnos").hide();
        $(".contenedorTablaSegmentos").hide();
        $("#tituloLibres").hide();
        $("#tablaLibres").hide();
        $(".contenedorTablaLibres").hide();

        $("#tituloMarcos").show();
        $("#tablaMarcos").show();
        $(".contenedorTablaMarcos").show();
        $("#tituloTPP").show();
        $("#tablaTPP").show();
        $(".contenedorTablaTPP").show();
    } else {
        $("#tituloEjecutados").show();
        $(".contenedorTablaEjecutados").show();

        $("#tituloMarcos").hide();
        $("#tablaMarcos").hide();
        $(".contenedorTablaMarcos").hide();
        $("#tituloTPP").hide();
        $("#tablaTPP").hide();
        $(".contenedorTablaTPP").hide();
    }
}

function removeItemFromArr(arr, item) {
    return arr.filter(function (e) {
        return e.id != item;
    });
};

function llenarEjecutados() {
    document.getElementById("ejecucion").replaceChildren();
    for (let i = 0; i < programasEjecutados.length; i++) {
        const programa = programasEjecutados[i];

        var fila = "<tr><td>" + programa.id + "</td><td>" + programa.nombre + "</td><td>" + programa.tamano + "</td><td>0x" + programa.posicion + "</td><td><button class='btn btnApagar'" + " value='" + i + "'>Apagar</button>" + "</td></tr>";

        var btn = document.createElement("TR");
        btn.innerHTML = fila;
        document.getElementById("ejecucion").appendChild(btn);
    };
}


function llenarLibres() {
    document.getElementById("libres").replaceChildren();

    var segmentos = memoria.getSegmentosLibres();
    for (let i = 0; i < segmentos.length; i++) {
        var fila = "<tr><td>" + segmentos[i].tamano + "</td><td>0x" +  segmentos[i].posicion + "</td></tr>";

        var btn = document.createElement("TR");
        btn.innerHTML = fila;
        document.getElementById("libres").appendChild(btn);
    };
}


function limpiarMemoria() {
    var canvas = document.getElementById("memoria");
    canvas.width = canvas.width;
}

function dibujarProceso(posicionHex, nombre, tamano, id) {
    var canvas = document.getElementById("memoria");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        /// 51px = 1048576 bytes = 1 MiB
        /// 51*tamaño/1024*1024
        var posicion = 51 * parseInt(componentToHex(posicionHex), 16) / 1048576;
        var altura = 51 * tamano / 1048576;

        // Fondo
        var colorId = null;
        for (let index = 0; index < this.colores.length; index++) {
            const element = this.colores[index];
            if (element.id == id) {
                colorId = index
            }
        }

        if (colorId != null) {
            var r = this.colores[colorId].r;
            var g = this.colores[colorId].g;
            var b = this.colores[colorId].b;
        } else {
            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            this.colores.push({ "id": id, "r": r, "g": g, "b": b });
        }

        ctx.fillStyle = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        ctx.fillRect(0, posicion, 300, altura);

        // Texto
        ctx.font = "20px Arial";
        ctx.textAlign = "center";

        var o = Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000);
        if (o > 125) {
            ctx.fillStyle = 'black';
        } else {
            ctx.fillStyle = 'white';
        }

        ctx.strokeRect(0, posicion, 300, altura);
        ctx.fillText(nombre, 150, posicion + altura / 1.5, 300);
    }
}

function dibujarMemoria(numParticiones, tipoGestionMemoria) {
    var canvas = document.getElementById("memoria");
    if (canvas.getContext) {

        var ctx = canvas.getContext("2d");
        if (tipoGestionMemoria == 4 || tipoGestionMemoria == 6) {
            var valor = 765 / numParticiones;

            for (let index = 0; index < numParticiones; index++) {
                ctx.rect(0, index * valor + 51, 300, valor);
                ctx.stroke();
            }
        } else if (tipoGestionMemoria == 3) {
            var cont = 0;

            for (let index = 0; index < numParticiones; index++) {
                ctx.rect(0, cont * 51 + 51, 300, 51 * particionesVariables[index]);
                ctx.stroke();
                cont = cont + particionesVariables[index];
            }
        }

    }
}

function activarBotones(botones) {
    for (let i = 0; i < botones.length; i++) {
        var boton = botones[i]
        boton.disabled = false;
    }
}
function empezarPrograma() {
    var seleccionAjuste = $('input:radio[name=ordenamiento]:checked').val();
    var botones = document.getElementsByName("btnEncender");
    memoria = new Memoria(1048576 * 15, null);
    programasEjecutados = [];
    llenarEjecutados();
    idProceso = 0;

    switch (gestionMemoria) {
        case 3:
            if (seleccionAjuste != undefined) {
                limpiarMemoria();
                dibujarMemoria(particionesVariables.length, gestionMemoria);

                memoria.setMetodoVariable(particionesVariables);

                dibujarProceso("000000", "SO", 1048576);
                ejecutarProgramas(); // Llama a la función para ejecutar los programas automáticamente
            } else {
                alert("Debe seleccionar un tipo de ajuste");
            }
            break;
        case 4:
            var cantParticion = document.getElementsByName("cantidadParticiones");
            limpiarMemoria();
            if (cantParticion[0].value != "") {
                dibujarMemoria(cantParticion[0].value, gestionMemoria);

                memoria.setMetodoFija(parseInt(cantParticion[0].value));

                dibujarProceso("000000", "SO", 1048576);
                ejecutarProgramas(); // Llama a la función para ejecutar los programas automáticamente
            } else {
                alert("Debe ingresar el número de particiones")
            }
            break;
        // Otros casos para otros métodos de gestión de memoria si es necesario
    }
    this.colores = [];
}

// Función para ejecutar los programas automáticamente
function ejecutarProgramas() {
    var botones = document.getElementsByName("btnEncender");
    for (let i = 0; i < botones.length; i++) {
        ejecutarProceso(botones[i].parentNode.parentNode.cells); // Llama a la función ejecutarProceso para cada botón de encendido
    }
}

    //// Acción para crear un programa
    var btnNuevoPrograma = document.getElementById("nuevoPrograma");
    btnNuevoPrograma.addEventListener("click", function () {
        var name = prompt("Nombre del programa");
        var data = parseInt(prompt("Tamaño del programa"));

        if (name != "" && !isNaN(data)) {
            programas.push({
                "nombre": name,
                "tamano": data,
            });
            llenarProgramas();
        } else {
            alert("Error en el llenado del formulario");
        }
    }, false)

    //// Detener prorgamas en ejecución
    $('#tablaEjecutados').unbind('click');
    $('#tablaEjecutados').on('click', '.btnApagar', function (event) {
        limpiarMemoria();
        switch (gestionMemoria) {
            case 1:
                dibujarMemoria(1, 4);
                break;
            case 2:
                dibujarMemoria(1, 4);
                break;
            case 3:
                dibujarMemoria(particionesVariables.length, gestionMemoria);
                break;
            case 4:
                var cantParticion = document.getElementsByName("cantidadParticiones");
                dibujarMemoria(cantParticion[0].value, gestionMemoria);
                break;
        }
        dibujarProceso("000000", "SO", 1048576);

        var $row = $(this).closest("tr"),
            $tds = $row.find("td");

        memoria.eliminarProceso($tds[0].textContent, $tds[1].textContent, gestionMemoria);

        programasEjecutados = removeItemFromArr(programasEjecutados, $tds[0].textContent);

        for (let index = 0; index < programasEjecutados.length; index++) {
            const element = programasEjecutados[index];
            var proceso = memoria.getProceso(element.id);
            element.posicion = proceso[0].posicion;
        }

        llenarEjecutados();
        dibujarProcesos();
    });

    //// Selección de método de gestión de memoria
    var optMetodo = document.getElementById("selecProgramas");
    optMetodo.addEventListener("click", function () {
        var ordenamiento = document.getElementsByName("ordenamiento");
        switch (optMetodo.value) {
            case "3":
                console.log("Particionamiento Estatico Variable");
                gestionMemoria = 3;
                $("#contMetodos").show();
                $(".ordenamiento").show();
                mostrarTablasPag(false);
                mostrarTablasSeg(false);

                document.getElementById("contMetodos").replaceChildren();
                for (let i = 0; i < particionesVariables.length; i++) {

                    var fila = "<li>" + particionesVariables[i] + " Megabit" + "</li>";
                    var btn = document.createElement("LI");
                    btn.innerHTML = fila;
                    document.getElementById("contMetodos").appendChild(btn);
                }

                ordenamiento[0].disabled = false;
                ordenamiento[1].disabled = false;
                ordenamiento[2].disabled = false;

                break;
            case "4":
                console.log("Particionamiento Estatico Fijo");
                gestionMemoria = 4;
                $(".ordenamiento").hide();
                $("#contMetodos").show();
                mostrarTablasPag(false);
                mostrarTablasSeg(false);

                document.getElementById("contMetodos").replaceChildren();
                const particion = "<input type='text' name='cantidadParticiones' id = 'cantidadParticiones' autocomplete='off' placeholder='Número de particiones'>" + "</input>";
                var btn = document.createElement("DIV");
                btn.innerHTML = particion;
                document.getElementById("contMetodos").appendChild(btn);

                ordenamiento[0].disabled = true;
                ordenamiento[1].disabled = true;
                ordenamiento[2].disabled = true;

                break;
        
            default:
                $(".ordenamiento").hide();
                $("#contMetodos").hide();
                console.log("No se ha seleccionado el método de gestión de memoria");
                break;

        }
    }, false);


function ejecutarProceso(proceso) {
    var seleccionAjuste = $('input:radio[name=ordenamiento]:checked').val();

    var resultado = memoria.insertarProceso({
        "id": idProceso + 1,
        "nombre": proceso[0].textContent, 
        "tamano": proceso[1].textContent
    }, gestionMemoria, seleccionAjuste);

    if (resultado == 1) {
        alert("Memoria insuficiente");
        return 0;
    }

    if (resultado == 0) {
        alert("Memoria llena");
        return 0;
    }

    if (gestionMemoria != 5 && gestionMemoria != 6) {
        var procesoGuardado = memoria.getProceso(idProceso + 1);

        idProceso += 1;
        programasEjecutados.push({
            "id": idProceso, "nombre": proceso[0].textContent, "tamano": proceso[1].textContent, "posicion": procesoGuardado[0].posicion
        });
        llenarEjecutados();
    }

    if (gestionMemoria == 5) {
        var procesoGuardado = memoria.getProceso(idProceso + 1);

        idProceso += 1;
        procesoGuardado.forEach(procesog => {
            var parte = procesog.proceso.nombre.split(" - ")
            segmentosEjecutados.push({"id": idProceso, "nombre": proceso[0].textContent, "parte": parte[1], "tamano": procesog.tamano, "posicion": procesog.posicion});
        });
        llenarSegmentos();
        llenarLibres();
    }

    if (gestionMemoria == 6) {
        var procesoGuardado = memoria.getProceso(idProceso + 1);
        idProceso += 1;
        llenarMarcos();

        for(let index = 0; index < procesoGuardado.length; index++ ){
            programasTTP.push({"id": procesoGuardado[index].proceso.id, "nombre": procesoGuardado[index].proceso.nombre, "pagina": index});
        }
        llenarTpps();
    }

    dibujarProcesos();
}

function dibujarProcesos() {
    var memoriaEstatica = memoria.getSegmentos();

    memoriaEstatica.forEach(segmento => {
        if (segmento.proceso !== null) {
            dibujarProceso(segmento.posicion, "(" + segmento.proceso.id + ")" + segmento.proceso.nombre, segmento.proceso.tamano, segmento.proceso.id);
        }
    });
}

var btnEmpezar = document.getElementById("empezar");
btnEmpezar.addEventListener("click", empezarPrograma);

function init() {
    llenarProgramas();
    agregarListener();
}

init();