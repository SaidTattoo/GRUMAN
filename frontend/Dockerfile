# Usa una imagen de Node.js para construir la aplicación
FROM node:18-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Copia el resto de los archivos de la aplicación
COPY . .

# Genera la build optimizada de Angular
RUN npm run build --prod

# Usa una imagen de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copia el archivo de configuración de Nginx personalizado
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copia el contenido de la aplicación generada en el contenedor de build
COPY --from=build /app/dist/Spike /usr/share/nginx/html

# Exponer el puerto 80 para servir la aplicación
EXPOSE 80
