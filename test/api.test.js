'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

let servidor;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    servidor = app.listen(0, resolve); // puerto libre asignado por el sistema
  });
  base = `http://localhost:${servidor.address().port}`;
});

test.after(() => {
  servidor.close();
});

test('GET /api/health responde ok', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { estado: 'ok' });
});

test('las cuatro operaciones elementales', async () => {
  const casos = [
    ['sumar', 8, 2, 10],
    ['restar', 8, 2, 6],
    ['multiplicar', 8, 2, 16],
    ['dividir', 8, 2, 4],
  ];
  for (const [operacion, a, b, esperado] of casos) {
    const res = await fetch(`${base}/api/${operacion}?a=${a}&b=${b}`);
    assert.equal(res.status, 200);
    const datos = await res.json();
    assert.equal(datos.resultado, esperado);
    assert.equal(datos.operacion, operacion);
  }
});

test('dividir entre 0 responde 400 con mensaje', async () => {
  const res = await fetch(`${base}/api/dividir?a=5&b=0`);
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /dividir entre 0/);
});

test('operando faltante responde 400', async () => {
  const res = await fetch(`${base}/api/sumar?a=5`);
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Falta el operando b/);
});

test('operación desconocida responde 404', async () => {
  const res = await fetch(`${base}/api/potencia?a=2&b=3`);
  assert.equal(res.status, 404);
  assert.match((await res.json()).error, /no soportada/i);
});

test('la raíz sirve la interfaz web', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /<html/i);
});