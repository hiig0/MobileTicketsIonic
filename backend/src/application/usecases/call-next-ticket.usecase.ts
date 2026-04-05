import { Ticket, TicketStatus } from '../../domain/entities/ticket';
import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { TicketFlowService } from '../../domain/services/ticket-flow.service';
import { UseCaseDependencies } from './usecase-dependencies';

export interface CallNextTicketResult {
  ticket: Ticket | null;
}

export class CallNextTicketUseCase {
  private readonly now: () => Date;
  private readonly random: () => number;

  constructor(
    private readonly repository: TicketRepository,
    private readonly flowService: TicketFlowService,
    dependencies: UseCaseDependencies = {},
  ) {
    this.now = dependencies.now ?? (() => new Date());
    this.random = dependencies.random ?? Math.random;
  }

  async execute(guiche: string): Promise<CallNextTicketResult> {
    const waitingTickets = await this.repository.findWaitingTickets();

    if (waitingTickets.length === 0) {
      return { ticket: null };
    }

    const lastCalled = await this.repository.findLastCalledTicket();
    const selectedTicket = this.flowService.selectNextTicket(waitingTickets, lastCalled?.type ?? null);

    if (!selectedTicket) {
      return { ticket: null };
    }

    const attendedAt = this.now();
    const serviceMinutes = this.flowService.calculateServiceMinutes(selectedTicket.type, this.random);

    const updatedTicket: Ticket = {
      ...selectedTicket,
      status: TicketStatus.ATENDIDA,
      attendedAt,
      guiche,
      serviceMinutes,
    };

    await this.repository.update(updatedTicket);

    return { ticket: updatedTicket };
  }
}