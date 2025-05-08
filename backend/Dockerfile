# Usa una versión más completa de Node.js
FROM node:20

# Crear el directorio de la aplicación
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm ci
RUN npm install nodemailer @types/nodemailer

# Copiar el resto de la aplicación
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
#CMD ["npm", "run", "start:dev"]
