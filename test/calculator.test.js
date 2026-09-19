'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sumar, restar, multiplicar, dividir, calcular } = require('../calculator');

test('sumar', () => {
  assert.equal(sumar(2, 3), 5);
  assert.equal(sumar(-2, 3), 1);
});

test('sumar decimales sin error de coma flotante', () => {
  assert.equal(sumar(0.1, 0.2), 0.3);
});

test('restar', () => {
  assert.equal(restar(10, 4), 6);
  assert.equal(restar(4, 10), -6);
});

test('multiplicar', () => {
  assert.equal(multiplicar(6, 7), 42);
  assert.equal(multiplicar(-3, 3), -9);
  assert.equal(multiplicar(0.1, 3), 0.3);
});

test('dividir', () => {
  assert.equal(dividir(10, 4), 2.5);
  assert.equal(dividir(1, 3), 0.333333333333);
});

test('dividir entre 0 lanza un error', () => {
  assert.throws(() => dividir(5, 0), /No se puede dividir entre 0/);
});

test('calcular acepta números en texto (como llegan por la URL)', () => {
  assert.equal(calcular('sumar', '2', '3'), 5);
  assert.equal(calcular('multiplicar', '1.5', '4'), 6);
});

test('calcular rechaza operandos ausentes o inválidos', () => {
  assert.throws(() => calcular('sumar', '2', undefined), /Falta el operando b/);
  assert.throws(() => calcular('sumar', '', '2'), /Falta el operando a/);
  assert.throws(() => calcular('sumar', 'abc', '2'), /no es un número válido/);
});

test('calcular rechaza operaciones desconocidas', () => {
  assert.throws(() => calcular('potencia', 2, 3), /Operación no soportada/);
});

test('calcular avisa cuando el resultado desborda', () => {
  assert.throws(() => calcular('multiplicar', '1e308', '10'), /demasiado grande/);
});