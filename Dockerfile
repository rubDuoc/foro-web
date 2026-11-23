# ============================================================
# Foro Conecta - imagen Docker del frontend Angular
# Etapa 1: Node compila la aplicacion. Etapa 2: Nginx sirve los estaticos.
# ============================================================

# ----- Etapa 1: compilacion -----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# --legacy-peer-deps: evita un error de npm con dependencias opcionales que solo se usan en Linux
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ----- Etapa 2: servidor web -----
FROM nginx:alpine
# Puerto por defecto 80; Render lo cambia con la variable PORT (nginx sustituye ${PORT} al iniciar)
ENV PORT=80
COPY nginx.conf /etc/nginx/templates/default.conf.template
# Angular 21 genera los archivos en dist/<proyecto>/browser
COPY --from=build /app/dist/foro-web/browser/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
