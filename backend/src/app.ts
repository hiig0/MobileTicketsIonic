import cors from 'cors';
import express from 'express';
import { TicketService } from './application/ticket-service';
import { MysqlTicketRepository } from './infrastructure/repositories/mysql-ticket.repository';
import { createTicketRouter } from './interfaces/http/ticket.controller';

export function createApp(): express.Express {
  const app = express();
  const repository = new MysqlTicketRepository();
  const service = new TicketService(repository);

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/api/tickets', createTicketRouter(service));

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : 'Erro inesperado.';
    response.status(500).json({ message });
  });

  return app;
}