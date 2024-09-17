# Etapa de construcción
FROM node:14

# Crear directorio de la aplicación
WORKDIR /app

# Copiar el archivo package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias de la aplicación
RUN npm install

# Instalar nodemon y ts-node globalmente
RUN npm install -g nodemon ts-node typescript

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:dev"]