// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔥 CORS
  app.enableCors({
    origin: [
      'https://app.otsembank.com', // Produção
      'http://localhost:3000',     // Dev local
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  });

  // 🔥 Suporte para JSON e URL-encoded (body parsers)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 🔥 Swagger
  const config = new DocumentBuilder()
    .setTitle('Otsem Bank API')
    .setDescription('Documentação oficial da API da Otsem Bank')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'Authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 🔥 Porta configurável
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Otsem Bank API rodando na porta ${port}`);
}
bootstrap();