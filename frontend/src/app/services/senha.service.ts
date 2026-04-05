import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CallNextTicketResultDto,
  IssueTicketResultDto,
  TicketOverviewDto,
  TicketPeriod,
  TicketReportDto,
  TicketType,
} from './ticket.models';

@Injectable({
  providedIn: 'root',
})
export class SenhaService {
  private readonly baseUrl = `${environment.apiUrl}/tickets`;

  constructor(private readonly http: HttpClient) {}

  emitirSenha(tipo: TicketType): Observable<IssueTicketResultDto> {
    return this.http.post<IssueTicketResultDto>(`${this.baseUrl}/issue`, { type: tipo });
  }

  chamarProximaSenha(guiche: string): Observable<CallNextTicketResultDto> {
    return this.http.post<CallNextTicketResultDto>(`${this.baseUrl}/next`, { guiche });
  }

  obterPainel(date: Date = new Date()): Observable<TicketOverviewDto> {
    return this.http.get<TicketOverviewDto>(`${this.baseUrl}/overview`, {
      params: this.createDateParams(date),
    });
  }

  obterRelatorio(periodo: TicketPeriod, date: Date = new Date()): Observable<TicketReportDto> {
    return this.http.get<TicketReportDto>(`${this.baseUrl}/reports`, {
      params: this.createDateParams(date).set('period', periodo),
    });
  }

  private createDateParams(date: Date): HttpParams {
    const formattedDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    return new HttpParams().set('date', formattedDate);
  }
}