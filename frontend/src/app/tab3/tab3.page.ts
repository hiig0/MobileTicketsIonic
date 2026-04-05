import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { SenhaService } from 'src/app/services/senha.service';
import { TicketPeriod, TicketReportDto, ticketStatusLabel, ticketTypeLabel } from '../services/ticket.models';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  readonly ticketTypeLabel = ticketTypeLabel;
  readonly ticketStatusLabel = ticketStatusLabel;
  report: TicketReportDto | null = null;
  loading = false;
  period: TicketPeriod = 'daily';
  referenceDate = this.toDateInputValue(new Date());

  constructor(
    public readonly senhaService: SenhaService,
    private readonly toastController: ToastController,
  ) {}

  ngOnInit(): void {
    void this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    const reference = this.fromDateInputValue(this.referenceDate);

    this.senhaService.obterRelatorio(this.period, reference)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (report) => {
          this.report = report;
        },
        error: async () => {
          await this.presentToast('Falha ao carregar o relatório.', 'danger');
        },
      });
  }

  onPeriodChange(period: TicketPeriod): void {
    this.period = period;
    this.loadReport();
  }

  onDateChange(): void {
    this.loadReport();
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2200,
      position: 'top',
    });

    await toast.present();
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private fromDateInputValue(value: string): Date {
    const [year, month, day] = value.split('-').map((part) => Number(part));

    if (!year || !month || !day) {
      return new Date();
    }

    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

}