FROM oven/bun:latest

# Update packages and install prerequisites
RUN apt update && apt install -y \
  curl \
  git \
  openssh-client \
  iputils-ping \
  unzip

# Install Node.js 20.x (includes a newer npm)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs 

ENV NEXT_PUBLIC_ENV=development
