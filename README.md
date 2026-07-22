# Backend Heladería

API de inventario, producción, caja, ventas y domicilios construida con Node.js, Express y MongoDB.

## Requisitos

- Node.js 22 o superior.
- MongoDB Atlas o un servidor MongoDB compatible con transacciones.
- Proyecto de Firebase para las notificaciones push.

## Instalación

```powershell
npm install
Copy-Item .env.example .env
npm run create-admin -- "Administrador" admin@heladeria.com clave-segura
npm run dev
```

Complete `.env` antes de crear el administrador. Nunca publique `.env` ni `src/config/firebaseServiceAccount.json`.

## Variables

- `PORT`: puerto HTTP; por defecto 4000.
- `MONGO_URI`: conexión a MongoDB.
- `JWT_SECRET`: clave privada para firmar sesiones.
- `CORS_ORIGINS`: lista de orígenes web separados por comas. Puede dejarse vacía durante desarrollo móvil.
- `FIREBASE_SERVICE_ACCOUNT`: JSON de Firebase Admin. En desarrollo también puede usarse el archivo ignorado `src/config/firebaseServiceAccount.json`.

## Roles

- `ADMIN`: acceso general, usuarios y reportes.
- `LOGISTICA`: inventario, producción y despacho.
- `CAJERO`: caja, ventas y creación de domicilios.
- `REPARTIDOR`: domicilios asignados y confirmación de entrega.

## Comandos

```powershell
npm run dev
npm start
npm test
```

## Flujo operativo

1. El administrador registra usuarios y productos.
2. Logística solicita y aprueba materiales de producción.
3. Logística registra el producto terminado y la merma.
4. El cajero abre caja, vende y opcionalmente crea un domicilio.
5. Logística prepara el domicilio y asigna un repartidor.
6. El repartidor confirma la entrega.
7. El cajero cierra caja y el administrador consulta el reporte diario.
