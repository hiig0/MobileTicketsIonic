import { TicketPeriod, TicketReportResponse } from '../../domain/entities/ticket';
import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { TicketReportService } from '../services/ticket-report.service';

export class GetReportUseCase {
  constructor(
    private readonly repository: TicketRepository,
    private readonly reportService: TicketReportService,
  ) {}

  async execute(period: TicketPeriod, referenceDate: Date): Promise<TicketReportResponse> {
    const { start, end } = this.reportService.getRange(referenceDate, period);
    const tickets = await this.repository.findTicketsBetween(start, end);

    return this.reportService.buildResponse(period, referenceDate, tickets);
  }
}