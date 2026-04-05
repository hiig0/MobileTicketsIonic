import { Ticket, TicketType } from './ticket';

export interface TicketRepository {
  save(ticket: Ticket): Promise<void>;
  update(ticket: Ticket): Promise<void>;
  countIssuedByTypeBetween(type: TicketType, start: Date, end: Date): Promise<number>;
  findWaitingTickets(): Promise<Ticket[]>;
  findLastCalledTicket(): Promise<Ticket | null>;
  findCalledTickets(limit: number): Promise<Ticket[]>;
  findTicketsBetween(start: Date, end: Date): Promise<Ticket[]>;
}