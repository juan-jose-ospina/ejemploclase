# Proyecto de una calculadora para la clase Devops 2026-2

Calculadora web con interfaz pixel art en estilo dark. La interfaz no calcula por sí misma: cada operación se envía a una API REST que resuelve las operaciones elementales.

## Requisitos

- Node.js 18 o superior

## Cómo correrlo

```bash
npm install
npm start
```

Abre http://localhost:3000. Para usar otro puerto: `PORT=8080 npm start`.

## Pruebas

```bash
npm test
```

Usa el ejecutor de pruebas integrado de Node (`node --test`), sin dependencias extra. Hay pruebas unitarias de las operaciones (`test/calculator.test.js`) y pruebas de la API (`test/api.test.js`).

## API

Todas las operaciones son `GET /api/<operacion>?a=<número>&b=<número>`.

| Operación     | Ejemplo                            | Respuesta                                                      |
| ------------- | ---------------------------------- | -------------------------------------------------------------- |
| `sumar`       | `/api/sumar?a=2&b=3`               | `{"operacion":"sumar","a":2,"b":3,"resultado":5}`              |
| `restar`      | `/api/restar?a=10&b=4`             | `{"operacion":"restar","a":10,"b":4,"resultado":6}`            |
| `multiplicar` | `/api/multiplicar?a=6&b=7`         | `{"operacion":"multiplicar","a":6,"b":7,"resultado":42}`       |
| `dividir`     | `/api/dividir?a=10&b=4`            | `{"operacion":"dividir","a":10,"b":4,"resultado":2.5}`         |

Además, `GET /api/health` responde `{"estado":"ok"}` y la interfaz lo usa para mostrar el estado de la API.

Errores (el cuerpo siempre es `{"error": "mensaje"}`):

- `400`: falta un operando, no es un número, división entre 0 o resultado demasiado grande.
- `404`: operación no soportada.

## Estructura

```
ejemploClase/
├── public/
│   ├── index.html     # estructura de la calculadora
│   ├── style.css      # estilo dark pixel art
│   └── app.js         # estado de la calculadora, teclado y llamadas a la API
├── test/
│   ├── calculator.test.js
│   └── api.test.js
├── calculator.js      # lógica de las operaciones
├── server.js          # servidor Express: API + archivos estáticos
├── package.json
└── .gitignore
```

## Uso de la calculadora

- Con el mouse o el teclado: dígitos, `.`, `+ - * /`, `Enter` (o `=`), `Backspace` (borrar último dígito) y `Esc` (borrar todo).
- Las operaciones se encadenan de izquierda a derecha, como en una calculadora básica: `2 + 3 × 4` da `20`.
- Las tipografías (Press Start 2P y VT323) se cargan desde Google Fonts; sin internet se usa una fuente monoespaciada del sistema.