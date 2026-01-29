// @ts-nocheck
/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('deve retornar "Otsem Bank API Online"', () => {
    expect(appController.getHello()).toBe('Otsem Bank API Online');
  });
});