# ==========================
# Etapa 1 - Builder
# ==========================
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas o package.json e o lock para melhor cache de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install --legacy-peer-deps

# Copia o restante dos arquivos da aplicação
COPY . .

# Gera o Prisma Client para produção
RUN npx prisma generate

# Compila o projeto NestJS
RUN npm run build

# ==========================
# Etapa 2 - Runtime (Produção)
# ==========================
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copia o dist (build) da etapa anterior
COPY --from=builder /app/dist ./dist

# Copia o Prisma Client e os node_modules necessários
COPY --from=builder /app/node_modules ./node_modules

# Copia os certificados
COPY --from=builder /app/certs ./certs

# Copia o schema.prisma (opcional, se quiser usar prisma studio em produção ou visualizar o schema)
COPY --from=builder /app/prisma ./prisma

# Expõe a porta (Railway usa automaticamente a porta configurada pela ENV `PORT`)
EXPOSE 3000

# Comando para aplicar migrações e iniciar o app
CMD npx prisma migrate deploy && node dist/main.js
