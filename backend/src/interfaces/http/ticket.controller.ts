import { Request, Response, Router } from 'express';
import { TicketService } from '../../application/ticket-service';
import { TicketType } from '../../domain/ticket';

function parseReferenceDate(value: unknown): Date {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return new Date();
  }

  const trimmed = value.trim();
  const localDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (localDateMatch) {
    const [, year, month, day] = localDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseTicketType(value: unknown): TicketType {
  if (value === TicketType.PRIORITARIA || value === TicketType.GERAL || value === TicketType.EXAMES) {
    return value;
  }

  throw new Error('Tipo de senha inválido.');
}

export function createTicketRouter(service: TicketService): Router {
  const router = Router();

  router.post('/issue', async (request: Request, response: Response) => {
    try {
      const type = parseTicketType(request.body?.type);
      const result = await service.issueTicket(type);
      response.status(201).json(result);
    } catch (error) {
      response.status(400).json({ message: error instanceof Error ? error.message : 'Falha ao emitir senha.' });
    }
  });

  router.post('/next', async (request: Request, response: Response) => {
    try {
      const guiche = typeof request.body?.guiche === 'string' && request.body.guiche.trim().length > 0
        ? request.body.guiche.trim()
        : 'Guichê 1';

      const result = await service.callNextTicket(guiche);
      response.json(result);
    } catch (error) {
      response.status(400).json({ message: error instanceof Error ? error.message : 'Falha ao chamar a próxima senha.' });
    }
  });

  router.get('/overview', async (request: Request, response: Response) => {
    try {
      const referenceDate = parseReferenceDate(request.query.date);
      const result = await service.getOverview(referenceDate);
      response.json(result);
    } catch (error) {
      response.status(500).json({ message: error instanceof Error ? error.message : 'Falha ao carregar o painel.' });
    }
  });

  router.get('/reports', async (request: Request, response: Response) => {
    try {
      const referenceDate = parseReferenceDate(request.query.date);
      const period = request.query.period === 'monthly' ? 'monthly' : 'daily';
      const result = await service.getReport(period, referenceDate);
      response.json(result);
    } catch (error) {
      response.status(500).json({ message: error instanceof Error ? error.message : 'Falha ao gerar relatório.' });
    }
  });

  return router;
}