# PracticaDevopsHotel

API REST para la gestión de habitaciones, reservas y otros recursos de un hotel.  
Este proyecto corresponde a la **versión 1.0.0** (finalizada el **13/09/2025**).  

---

# Arquitectura del Proyecto

![Arquitectura](./docs/arquitectura.png)

---

## Configuración del Proyecto

- **Lenguaje:** JavaScript (Node.js)
- **Versión de Node:** `20.9.0`
- **Framework:** [Express](https://expressjs.com/)
- **Base de Datos:** Sequelize + SQLite (puedes reemplazar por otra en el futuro)
- **Tests:** [Jest](https://jestjs.io/)
- **Validaciones:** [express-validator](https://express-validator.github.io/)

---

## Dependencias principales

```json
"dependencies": {
  "express": "^4.19.0",
  "sequelize": "^6.36.0",
  "sqlite3": "^5.1.6",
  "express-validator": "^7.0.1"
},
"devDependencies": {
  "jest": "^30.0.5",
  "nodemon": "^3.1.10",
  "supertest": "^7.0.0"
}
```
---

## Cómo correr el proyecto

1. Clonar el repositorio
  git clone https://github.com/MateoHincapieA/PracticaDevopsHotel
  cd PracticaDevopsHotel

2. Instalar dependencias
  npm ci

3. Correr en desarrollo
  npm run dev
  Esto levantará el servidor en http://localhost:3000.

---

## Modo pruebas
Ejecutar el servidor en modo test
NODE_ENV=test npm start

Correr todos los tests
npm test

Correr tests con cobertura
npx jest --coverage


En la rama develop el mínimo de cobertura configurado es 60%.
En la rama main el mínimo de cobertura configurado es 85%.

---

## Versionado

v1.0.0 (13/09/2025)

Implementación inicial de CRUD para entidades.

Validaciones con express-validator.

Integración con Jest para pruebas unitarias.

Pipeline con GitHub Actions y despliegue a GHCR.

---

## Autor

Proyecto desarrollado por Mateo Hincapié A.