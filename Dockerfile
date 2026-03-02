
FROM nginx:alpine

# Copiar el archivo index.html al directorio predeterminado de Nginx
COPY . /usr/share/nginx/html

# Exponer el puerto 80 para el tráfico web
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
