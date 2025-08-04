# Dockerfile para el frontend (Angular compilado con NGINX)
FROM nginx:alpine

# Copia la carpeta compilada de Angular
COPY dist/ /usr/share/nginx/html

# Copia la configuración personalizada de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80