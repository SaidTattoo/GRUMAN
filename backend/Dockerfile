# Etapa de construcción
FROM node:14

# Crear directorio de la aplicación
WORKDIR /app

# Instalar las dependencias de la aplicación
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:dev"]