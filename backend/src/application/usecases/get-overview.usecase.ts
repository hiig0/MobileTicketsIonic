import { TicketOverviewResponse } from '../../domain/entities/ticket';
import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { TicketReportService } from '../services/ticket-report.service';

export class GetOverviewUseCase {
  constructor(
    private readonly repository: TicketRepository,
    private readonly reportService: TicketReportService,
  ) {}

  async execute(referenceDate: Date): Promise<TicketOverviewResponse> {
    const { start, end } = this.reportService.getRange(referenceDate, 'daily');
    const tickets = await this.repository.findTicketsBetween(start, end);
    const recentCalls = await this.repository.findCalledTickets(5);

    return this.reportService.buildOverview(referenceDate, tickets, recentCalls);
  }
}