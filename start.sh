#!/bin/bash

# Navegar a la carpeta frontend, instalar dependencias y ejecutar npm start
cd frontend
npm install
npm start --open &
FRONTEND_PID=$!

# Navegar a la carpeta backend, instalar dependencias, compilar y ejecutar npm start
cd ../backend
npm install
npm run build
npm start &
BACKEND_PID=$!

# Esperar a que ambos procesos terminen
wait $FRONTEND_PID
wait $BACKEND_PID