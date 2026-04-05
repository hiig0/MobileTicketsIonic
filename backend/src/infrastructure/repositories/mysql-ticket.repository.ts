import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '../database/mysql-connection';
import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { Ticket, TicketStatus, TicketType } from '../../domain/entities/ticket';

interface TicketRow extends RowDataPacket {
  id: string;
  code: string;
  type: TicketType;
  sequence: number;
  status: TicketStatus;
  issued_at: Date;
  attended_at: Date | null;
  guiche: string | null;
  service_minutes: number | null;
}

export class MysqlTicketRepository implements TicketRepository {
  async save(ticket: Ticket): Promise<void> {
    const query = `
      INSERT INTO tickets (
        id, code, type, sequence, status, issued_at, attended_at, guiche, service_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await getPool().execute<ResultSetHeader>(query, [
      ticket.id,
      ticket.code,
      ticket.type,
      ticket.sequence,
      ticket.status,
      ticket.issuedAt,
      ticket.attendedAt,
      ticket.guiche,
      ticket.serviceMinutes,
    ]);
  }

  async update(ticket: Ticket): Promise<void> {
    const query = `
      UPDATE tickets
      SET status = ?, attended_at = ?, guiche = ?, service_minutes = ?
      WHERE id = ?
    `;

    await getPool().execute<ResultSetHeader>(query, [
      ticket.status,
      ticket.attendedAt,
      ticket.guiche,
      ticket.serviceMinutes,
      ticket.id,
    ]);
  }

  async countIssuedByTypeBetween(type: TicketType, start: Date, end: Date): Promise<number> {
    const query = `
      SELECT COUNT(*) AS total
      FROM tickets
      WHERE type = ?
        AND issued_at >= ?
        AND issued_at < ?
    `;

    const [rows] = await getPool().execute<RowDataPacket[]>(query, [type, start, end]);
    return Number(rows[0]?.total ?? 0);
  }

  async findWaitingTickets(): Promise<Ticket[]> {
    const query = `
      SELECT *
      FROM tickets
      WHERE status = ?
      ORDER BY issued_at ASC, sequence ASC
    `;

    return this.mapRows(await this.fetchRows(query, [TicketStatus.EMITIDA]));
  }

  async findLastCalledTicket(): Promise<Ticket | null> {
    const query = `
      SELECT *
      FROM tickets
      WHERE status = ?
      ORDER BY attended_at DESC
      LIMIT 1
    `;

    const rows = await this.fetchRows(query, [TicketStatus.ATENDIDA]);
    return this.mapRows(rows)[0] ?? null;
  }

  async findCalledTickets(limit: number): Promise<Ticket[]> {
    const safeLimit = Math.max(0, Math.floor(limit));
    const query = `
      SELECT *
      FROM tickets
      WHERE status = ?
      ORDER BY attended_at DESC
      LIMIT ${safeLimit}
    `;

    return this.mapRows(await this.fetchRows(query, [TicketStatus.ATENDIDA]));
  }

  async findTicketsBetween(start: Date, end: Date): Promise<Ticket[]> {
    const query = `
      SELECT *
      FROM tickets
      WHERE issued_at >= ?
        AND issued_at < ?
      ORDER BY issued_at ASC, sequence ASC
    `;

    return this.mapRows(await this.fetchRows(query, [start, end]));
  }

  private async fetchRows(query: string, params: any[]): Promise<TicketRow[]> {
    const [rows] = await getPool().execute<TicketRow[]>(query, params);
    return rows;
  }

  private mapRows(rows: TicketRow[]): Ticket[] {
    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      type: row.type,
      sequence: row.sequence,
      status: row.status,
      issuedAt: row.issued_at,
      attendedAt: row.attended_at,
      guiche: row.guiche,
      serviceMinutes: row.service_minutes,
    }));
  }
}