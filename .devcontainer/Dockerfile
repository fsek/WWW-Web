FROM node:20-alpine

# To get fresh apk
RUN apk update && apk upgrade

#iputils is for ping
RUN apk add git openssh curl iputils

ENV ENV = development
