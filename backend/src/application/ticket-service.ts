import { TicketPeriod, TicketOverviewResponse, TicketReportResponse, TicketType } from '../domain/entities/ticket';
import { TicketRepository } from '../domain/repositories/ticket-repository';
import { TicketFlowService } from '../domain/services/ticket-flow.service';
import { TicketReportService } from './services/ticket-report.service';
import { CallNextTicketResult, CallNextTicketUseCase } from './usecases/call-next-ticket.usecase';
import { GetOverviewUseCase } from './usecases/get-overview.usecase';
import { GetReportUseCase } from './usecases/get-report.usecase';
import { IssueTicketResult, IssueTicketUseCase } from './usecases/issue-ticket.usecase';
import { UseCaseDependencies } from './usecases/usecase-dependencies';

export interface TicketServiceDependencies extends UseCaseDependencies {}

export class TicketService {
  private readonly issueTicketUseCase: IssueTicketUseCase;
  private readonly callNextTicketUseCase: CallNextTicketUseCase;
  private readonly getOverviewUseCase: GetOverviewUseCase;
  private readonly getReportUseCase: GetReportUseCase;

  constructor(
    repository: TicketRepository,
    dependencies: TicketServiceDependencies = {},
  ) {
    const flowService = new TicketFlowService();
    const reportService = new TicketReportService();

    this.issueTicketUseCase = new IssueTicketUseCase(repository, dependencies);
    this.callNextTicketUseCase = new CallNextTicketUseCase(repository, flowService, dependencies);
    this.getOverviewUseCase = new GetOverviewUseCase(repository, reportService);
    this.getReportUseCase = new GetReportUseCase(repository, reportService);
  }

  async issueTicket(type: TicketType): Promise<IssueTicketResult> {
    return this.issueTicketUseCase.execute(type);
  }

  async callNextTicket(guiche: string): Promise<CallNextTicketResult> {
    return this.callNextTicketUseCase.execute(guiche);
  }

  async getOverview(referenceDate: Date): Promise<TicketOverviewResponse> {
    return this.getOverviewUseCase.execute(referenceDate);
  }

  async getReport(period: TicketPeriod, referenceDate: Date): Promise<TicketReportResponse> {
    return this.getReportUseCase.execute(period, referenceDate);
  }
}