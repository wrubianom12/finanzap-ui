# Etapa de compilación
FROM node:18-alpine as build
WORKDIR /usr/local/app
COPY ./ /usr/local/app/
RUN npm install --legacy-peer-deps
RUN npm run build

FROM nginx:alpine
COPY --from=build /usr/local/app/dist/finanzapp-ui /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
