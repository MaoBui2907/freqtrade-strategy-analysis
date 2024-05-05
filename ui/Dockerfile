

FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf

COPY build/ /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]