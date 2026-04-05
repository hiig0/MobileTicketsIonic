import { TicketType } from './ticket';

export function formatTicketCode(date: Date, type: TicketType, sequence: number): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequencePart = String(sequence).padStart(2, '0');

  return `${year}${month}${day}-${type}${sequencePart}`;
}

export function isPriorityType(type: TicketType): boolean {
  return type === TicketType.PRIORITARIA;
}

export function isNonPriorityType(type: TicketType): boolean {
  return type === TicketType.GERAL || type === TicketType.EXAMES;
}

export function toDisplayLabel(type: TicketType): string {
  switch (type) {
    case TicketType.PRIORITARIA:
      return 'Prioritária';
    case TicketType.GERAL:
      return 'Geral';
    case TicketType.EXAMES:
      return 'Exames';
  }
}