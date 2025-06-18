#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Iniciando despliegue en Vercel...${NC}"

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI no está instalado. Instalando...${NC}"
    npm install -g vercel
fi

# Desplegar backend
echo -e "${GREEN}Desplegando backend...${NC}"
cd backend
vercel --prod

# Desplegar frontend
echo -e "${GREEN}Desplegando frontend...${NC}"
cd ../frontend
vercel --prod

echo -e "${GREEN}¡Despliegue completado!${NC}"
echo -e "Frontend: https://pymes-frontend.vercel.app"
echo -e "Backend: https://pymes-backend.vercel.app" 