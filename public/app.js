'use strict';

// La interfaz no calcula: cada operación se envía a la API (/api/sumar, /api/restar, ...)
const OPERACIONES = { '+': 'sumar', '-': 'restar', '×': 'multiplicar', '÷': 'dividir' };
const MAX_DIGITOS = 12;

const elValor = document.getElementById('valor');
const elExpresion = document.getElementById('expresion');
const elEstado = document.getElementById('estado');
const elEstadoTexto = document.getElementById('estado-texto');
const elTeclas = document.getElementById('teclas');

const estadoInicial = () => ({
  actual: '0',       // número que se está escribiendo (o el último resultado)
  anterior: null,    // primer operando, ya confirmado
  operador: null,    // '+', '-', '×' o '÷' pendiente
  reemplazar: true,  // el próximo dígito empieza un número nuevo
  expresion: '',     // texto de la línea superior cuando no hay operador pendiente
  error: false,
});

let estado = estadoInicial();
let cola = Promise.resolve(); // procesa las pulsaciones en orden, aunque la API tarde

// ---------- API ----------

function marcarApi(clave, texto) {
  elEstado.dataset.estado = clave;
  elEstadoTexto.textContent = texto;
}

async function pedirResultado(a, operador, b) {
  const params = new URLSearchParams({ a, b });
  let res;
  try {
    res = await fetch(`/api/${OPERACIONES[operador]}?${params}`);
  } catch {
    marcarApi('sin-conexion', 'API sin conexión');
    throw new Error('No hay conexión con la API');
  }
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(datos.error || 'Error en la API');
  }
  marcarApi('en-linea', 'API en línea');
  return datos.resultado;
}

async function verificarApi() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error();
    marcarApi('en-linea', 'API en línea');
  } catch {
    marcarApi('sin-conexion', 'API sin conexión');
  }
}

// ---------- Presentación ----------

function textoNumero(n) {
  const t = String(n);
  return t.length > 14 ? Number(n).toExponential(6) : t;
}

function render() {
  elValor.textContent = estado.actual;
  elValor.dataset.tam = estado.actual.length > 12 ? 's' : estado.actual.length > 8 ? 'm' : 'l';
  elExpresion.textContent = estado.operador
    ? `${estado.anterior} ${estado.operador}`
    : estado.expresion;

  elTeclas.querySelectorAll('[data-accion="operador"]').forEach((boton) => {
    const esperando = estado.operador === boton.dataset.valor && estado.reemplazar;
    boton.setAttribute('aria-pressed', String(esperando));
  });
}

// ---------- Acciones ----------

function digito(d) {
  if (estado.error) estado = estadoInicial();
  if (estado.reemplazar) {
    estado.actual = d;
    estado.reemplazar = false;
  } else if (estado.actual === '0') {
    estado.actual = d;
  } else if (estado.actual.replace(/[-.]/g, '').length < MAX_DIGITOS) {
    estado.actual += d;
  }
  render();
}

function punto() {
  if (estado.error) estado = estadoInicial();
  if (estado.reemplazar) {
    estado.actual = '0.';
    estado.reemplazar = false;
  } else if (!estado.actual.includes('.')) {
    estado.actual += '.';
  }
  render();
}

function signo() {
  if (estado.error || estado.actual === '0') return;
  estado.actual = estado.actual.startsWith('-') ? estado.actual.slice(1) : `-${estado.actual}`;
  render();
}

function borrar() {
  if (estado.error || estado.reemplazar) return;
  estado.actual = estado.actual.slice(0, -1);
  if (estado.actual === '' || estado.actual === '-') estado.actual = '0';
  render();
}

function limpiar() {
  estado = estadoInicial();
  render();
}

// Envía la operación pendiente a la API y deja el resultado como número actual
async function resolver() {
  const { anterior, operador, actual } = estado;
  try {
    const resultado = await pedirResultado(anterior, operador, actual);
    estado = {
      ...estadoInicial(),
      actual: textoNumero(resultado),
      expresion: `${anterior} ${operador} ${actual} =`,
    };
  } catch (err) {
    estado = { ...estadoInicial(), actual: 'ERROR', expresion: err.message, error: true };
  }
}

async function operador(op) {
  if (estado.error) return;
  if (estado.operador && !estado.reemplazar) {
    await resolver(); // 2 + 3 × ... resuelve 2 + 3 antes de seguir
    if (estado.error) {
      render();
      return;
    }
  }
  estado.anterior = estado.actual;
  estado.operador = op;
  estado.reemplazar = true;
  render();
}

async function igual() {
  if (estado.error || !estado.operador || estado.reemplazar) return;
  await resolver();
  render();
}

async function manejar(accion, valor) {
  switch (accion) {
    case 'digito': return digito(valor);
    case 'punto': return punto();
    case 'signo': return signo();
    case 'borrar': return borrar();
    case 'limpiar': return limpiar();
    case 'operador': return operador(valor);
    case 'igual': return igual();
  }
}

function despachar(accion, valor) {
  cola = cola.then(() => manejar(accion, valor)).catch(console.error);
}

// ---------- Entradas ----------

elTeclas.addEventListener('click', (e) => {
  const boton = e.target.closest('button');
  if (boton) despachar(boton.dataset.accion, boton.dataset.valor);
});

const ATAJOS = {
  '+': ['operador', '+'],
  '-': ['operador', '-'],
  '*': ['operador', '×'],
  x: ['operador', '×'],
  X: ['operador', '×'],
  '/': ['operador', '÷'],
  Enter: ['igual'],
  '=': ['igual'],
  Backspace: ['borrar'],
  Escape: ['limpiar'],
  c: ['limpiar'],
  C: ['limpiar'],
  '.': ['punto'],
  ',': ['punto'],
};

function hundirTecla(accion, valor) {
  const selector = valor === undefined
    ? `[data-accion="${accion}"]`
    : `[data-accion="${accion}"][data-valor="${valor}"]`;
  const boton = elTeclas.querySelector(selector);
  if (!boton) return;
  boton.classList.add('pulsada');
  setTimeout(() => boton.classList.remove('pulsada'), 120);
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  let atajo;
  if (/^[0-9]$/.test(e.key)) atajo = ['digito', e.key];
  else atajo = ATAJOS[e.key];
  if (!atajo) return;

  e.preventDefault(); // evita que Enter active el botón enfocado o que "/" abra la búsqueda
  hundirTecla(...atajo);
  despachar(...atajo);
});

render();
verificarApi();