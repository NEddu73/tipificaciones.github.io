let numerosUsados = [];
let disponibles = [];
let grupoIndependienteCreado = {};

function actualizarTextoGenerado() {
    const grupos = document.querySelectorAll('.seccion');
    let textoGenerado = '';

    grupos.forEach((grupo, index) => {
        const grupoObligatorio = grupo.querySelector('.grupo-obligatorio').checked ? '<*>' : '';
        const grupoTexto = grupo.querySelector('.grupo-texto').value;
        const grupoCorchete = grupo.querySelector('.grupo-corchete').checked ? '[' : '';
        textoGenerado += `${grupoCorchete}${grupoObligatorio}<${grupo.dataset.numero}>.${grupoTexto}${grupoCorchete ? ']' : ''}\n`;

        const subgrupos = grupo.querySelectorAll('.subseccion');
        subgrupos.forEach(subgrupo => {
            const subgrupoTexto = subgrupo.querySelector('.subgrupo-texto').value;
            textoGenerado += `<${subgrupo.dataset.numero}>.${subgrupoTexto}\n`;
        });

        const finales = grupo.querySelectorAll('.final');
        finales.forEach(final => {
            const finalTexto = final.querySelector('.final-texto').value;
            textoGenerado += `<>.${finalTexto}\n`;
        });

        if (index < grupos.length - 1) {
            textoGenerado += '\n';
        }
    });

    document.getElementById('output-text').value = textoGenerado.trim();
}

function obtenerNumero(tipo) {
    if (tipo === 'grupo') {
        if (disponibles.length > 0) {
            return disponibles.pop();
        }
        return numerosUsados.length > 0 ? Math.max(...numerosUsados) + 1 : 0;
    } else if (tipo === 'subgrupo') {
        const grupos = document.querySelectorAll('.seccion');
        let subgruposUsados = [];

        grupos.forEach(grupo => {
            const subgrupos = grupo.querySelectorAll('.subseccion');
            subgrupos.forEach(subgrupo => {
                subgruposUsados.push(parseInt(subgrupo.dataset.numero));
            });
        });

        if (subgruposUsados.length > 0) {
            return Math.max(...subgruposUsados) + 1;
        } else {
            return 1; 
        }
    }
}

function agregarGrupo() {
    const grupoDiv = document.createElement('div');
    grupoDiv.className = 'seccion';
    grupoDiv.dataset.numero = obtenerNumero('grupo');
    numerosUsados.push(parseInt(grupoDiv.dataset.numero));
    grupoDiv.innerHTML = `
        <label>Grupo ${grupoDiv.dataset.numero}:</label>
        <input type="text" class="grupo-texto" placeholder="Texto del grupo" oninput="actualizarTextoGenerado()">
        <label>Obligatorio</label>
        <input type="checkbox" class="grupo-obligatorio" onchange="actualizarTextoGenerado()">
        <label>Corchete</label>
        <input type="checkbox" class="grupo-corchete" onchange="actualizarTextoGenerado()">
        <button onclick="agregarSubgrupo(${grupoDiv.dataset.numero})">Agregar Subgrupo</button>
        <button onclick="agregarFinal(${grupoDiv.dataset.numero})">Agregar Final</button>
        <button class="boton-eliminar" onclick="eliminarSeccion(this)">Eliminar</button>
    `;
    agregarEventosArrastre(grupoDiv);
    document.getElementById('secciones').appendChild(grupoDiv);
    actualizarTextoGenerado();
}

function eliminarSeccion(boton) {
    const seccion = boton.parentNode;
    const numero = parseInt(seccion.dataset.numero);
    disponibles.push(numero);
    numerosUsados = numerosUsados.filter(n => n !== numero);
    seccion.parentNode.removeChild(seccion);

    delete grupoIndependienteCreado[numero];

    actualizarTextoGenerado();
}

function agregarSubgrupo(grupoNumero) {
    const subgrupoDiv = document.createElement('div');
    subgrupoDiv.className = 'subseccion';
    subgrupoDiv.dataset.numero = obtenerNumero('subgrupo');
    numerosUsados.push(parseInt(subgrupoDiv.dataset.numero));
    subgrupoDiv.innerHTML = `
        <label>Subgrupo ${subgrupoDiv.dataset.numero}:</label>
        <input type="text" class="subgrupo-texto" placeholder="Texto del subgrupo" oninput="actualizarTextoGenerado()">
        <button onclick="agregarGrupoIndependiente(${subgrupoDiv.dataset.numero})" ${grupoIndependienteCreado[subgrupoDiv.dataset.numero] ? 'disabled' : ''}>Crear Grupo Independiente</button>
        <button class="boton-eliminar" onclick="eliminarSeccion(this)">Eliminar</button>
    `;
    agregarEventosArrastre(subgrupoDiv);
    document.querySelector(`.seccion[data-numero="${grupoNumero}"]`).appendChild(subgrupoDiv);
    actualizarTextoGenerado();
}

function agregarFinal(grupoNumero) {
    const finalDiv = document.createElement('div');
    finalDiv.className = 'final';
    finalDiv.innerHTML = `
        <label>Final:</label>
        <input type="text" class="final-texto" placeholder="Texto final" oninput="actualizarTextoGenerado()">
        <button class="boton-eliminar" onclick="eliminarSeccion(this)">Eliminar</button>
    `;
    agregarEventosArrastre(finalDiv);
    document.querySelector(`.seccion[data-numero="${grupoNumero}"]`).appendChild(finalDiv);
    actualizarTextoGenerado();
}

function agregarGrupoIndependiente(subgrupoNumero) {
    const subgrupoDiv = document.querySelector(`.subseccion[data-numero="${subgrupoNumero}"]`);
    const subgrupoTexto = subgrupoDiv.querySelector('.subgrupo-texto').value;

    const grupoDiv = document.createElement('div');
    grupoDiv.className = 'seccion';
    grupoDiv.dataset.numero = subgrupoNumero;
    numerosUsados.push(parseInt(grupoDiv.dataset.numero));
    grupoDiv.innerHTML = `
        <label>Grupo ${grupoDiv.dataset.numero}:</label>
        <input type="text" class="grupo-texto" value="${subgrupoTexto}" readonly>
        <label>Obligatorio</label>
        <input type="checkbox" class="grupo-obligatorio" onchange="actualizarTextoGenerado()">
        <label>Corchete</label>
        <input type="checkbox" class="grupo-corchete" onchange="actualizarTextoGenerado()">
        <button onclick="agregarSubgrupo(${grupoDiv.dataset.numero})">Agregar Subgrupo</button>
        <button onclick="agregarFinal(${grupoDiv.dataset.numero})">Agregar Final</button>
        <button class="boton-eliminar" onclick="eliminarSeccion(this)">Eliminar</button>
    `;
    agregarEventosArrastre(grupoDiv);
    document.getElementById('secciones').appendChild(grupoDiv);
    actualizarTextoGenerado();

    grupoIndependienteCreado[subgrupoNumero] = true;
    subgrupoDiv.querySelector('button').disabled = true;
}

function agregarEventosArrastre(elemento) {
    elemento.draggable = true;
    elemento.addEventListener('dragstart', dragStart);
    elemento.addEventListener('dragover', dragOver);
    elemento.addEventListener('dragenter', dragEnter);
    elemento.addEventListener('dragleave', dragLeave);
    elemento.addEventListener('drop', drop);
}

let draggedElement = null;

function dragStart(event) {
    draggedElement = event.target;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', draggedElement.innerHTML);
}

function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function dragEnter(event) {
    if (event.target.className.includes('seccion') || event.target.className.includes('subseccion') || event.target.className.includes('final')) {
        event.target.classList.add('drag-over');
    }
}

function dragLeave(event) {
    if (event.target.className.includes('seccion') || event.target.className.includes('subseccion') || event.target.className.includes('final')) {
        event.target.classList.remove('drag-over');
    }
}

function drop(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target.className.includes('seccion') || event.target.className.includes('subseccion') || event.target.className.includes('final')) {
        event.target.classList.remove('drag-over');

        const target = event.target.closest('.seccion, .subseccion, .final');
        const parent = target.parentNode;

        if (draggedElement !== target) {
            const draggedIndex = Array.prototype.indexOf.call(parent.children, draggedElement);
            const targetIndex = Array.prototype.indexOf.call(parent.children, target);

            if (draggedIndex > targetIndex) {
                parent.insertBefore(draggedElement, target);
            } else {
                parent.insertBefore(draggedElement, target.nextSibling);
            }

            actualizarTextoGenerado();
        }
    }
}

document.querySelectorAll('.seccion, .subseccion, .final').forEach(agregarEventosArrastre);
