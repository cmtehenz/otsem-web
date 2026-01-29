import { Controller } from '@nestjs/common';
import { TransactionService } from './transaction.service';

import { Request } from 'express';

// Interface que adiciona user.id ao req
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  
}
