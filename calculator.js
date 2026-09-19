'use strict';

// Redondea a 12 cifras significativas para evitar errores de coma flotante
// (por ejemplo, 0.1 + 0.2 = 0.30000000000000004).
const redondear = (n) => Number(n.toPrecision(12));

function aNumero(valor, nombre) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    throw new Error(`Falta el operando ${nombre}`);
  }
  const n = Number(valor);
  if (!Number.isFinite(n)) {
    throw new Error(`El operando ${nombre} no es un número válido`);
  }
  return n;
}

const sumar = (a, b) => redondear(a + b);
const restar = (a, b) => redondear(a - b);
const multiplicar = (a, b) => redondear(a * b);

function dividir(a, b) {
  if (b === 0) {
    throw new Error('No se puede dividir entre 0');
  }
  return redondear(a / b);
}

const FUNCIONES = { sumar, restar, multiplicar, dividir };
const OPERACIONES = Object.keys(FUNCIONES);

// Valida los operandos y ejecuta la operación indicada por nombre.
function calcular(operacion, a, b) {
  const funcion = FUNCIONES[operacion];
  if (!funcion) {
    throw new Error(`Operación no soportada: ${operacion}`);
  }
  const resultado = funcion(aNumero(a, 'a'), aNumero(b, 'b'));
  if (!Number.isFinite(resultado)) {
    throw new Error('El resultado es demasiado grande');
  }
  return resultado;
}

module.exports = { sumar, restar, multiplicar, dividir, calcular, OPERACIONES };