# Etapa de construcción
FROM node:18-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar las dependencias instaladas y el código compilado desde la etapa de construcción
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main"]