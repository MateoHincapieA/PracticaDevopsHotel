# Usar Node.js LTS
FROM node:18-alpine

# Crear directorio de la app
WORKDIR /usr/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto (ajústalo si tu app usa otro)
EXPOSE 3000

# Comando de arranque
CMD ["npm", "start"]
