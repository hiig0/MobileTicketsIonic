import {
  Ticket,
  TicketOverviewResponse,
  TicketPeriod,
  TicketReportItem,
  TicketReportResponse,
  TicketSummary,
  TicketStatus,
  TicketType,
} from '../../domain/entities/ticket';

export class TicketReportService {
  buildSummary(tickets: Ticket[]): TicketSummary {
    const emptyCounts = {
      [TicketType.PRIORITARIA]: 0,
      [TicketType.GERAL]: 0,
      [TicketType.EXAMES]: 0,
    };

    return tickets.reduce<TicketSummary>(
      (summary, ticket) => {
        summary.totalIssued += 1;
        summary.issuedByType[ticket.type] += 1;

        if (ticket.status === TicketStatus.ATENDIDA) {
          summary.totalAttended += 1;
          summary.attendedByType[ticket.type] += 1;
        }

        if (ticket.status === TicketStatus.DESCARTADA) {
          summary.totalDiscarded += 1;
        }

        if (ticket.status === TicketStatus.EMITIDA) {
          summary.waitingByType[ticket.type] += 1;
        }

        return summary;
      },
      {
        totalIssued: 0,
        totalAttended: 0,
        totalDiscarded: 0,
        issuedByType: { ...emptyCounts },
        attendedByType: { ...emptyCounts },
        waitingByType: { ...emptyCounts },
      },
    );
  }

  toReportItem(ticket: Ticket): TicketReportItem {
    return {
      code: ticket.code,
      type: ticket.type,
      status: ticket.status,
      issuedAt: ticket.issuedAt.toISOString(),
      attendedAt: ticket.attendedAt ? ticket.attendedAt.toISOString() : null,
      guiche: ticket.guiche,
      serviceMinutes: ticket.serviceMinutes,
    };
  }

  buildResponse(period: TicketPeriod, referenceDate: Date, tickets: Ticket[]): TicketReportResponse {
    return {
      period,
      referenceDate: referenceDate.toISOString(),
      waitingCount: tickets.filter((ticket) => ticket.status === TicketStatus.EMITIDA).length,
      summary: this.buildSummary(tickets),
      details: tickets.map((ticket) => this.toReportItem(ticket)),
    };
  }

  buildOverview(referenceDate: Date, tickets: Ticket[], recentCalls: Ticket[]): TicketOverviewResponse {
    const report = this.buildResponse('daily', referenceDate, tickets);

    return {
      ...report,
      recentCalls: recentCalls.map((ticket) => this.toReportItem(ticket)),
    };
  }

  getRange(referenceDate: Date, period: TicketPeriod): { start: Date; end: Date } {
    if (period === 'monthly') {
      const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1, 0, 0, 0, 0);
      return { start, end };
    }

    const start = this.startOfDay(referenceDate);
    const end = this.startOfNextDay(referenceDate);
    return { start, end };
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  private startOfNextDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
  }
}