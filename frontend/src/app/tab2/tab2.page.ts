import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { finalize } from 'rxjs';
import { SenhaService } from 'src/app/services/senha.service';
import { CallNextTicketResultDto, TicketOverviewDto, TicketType, ticketTypeLabel, ticketStatusLabel } from '../services/ticket.models';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  readonly TicketType = TicketType;
  readonly ticketTypeLabel = ticketTypeLabel;
  readonly ticketStatusLabel = ticketStatusLabel;
  overview: TicketOverviewDto | null = null;
  loading = false;
  guiche = 'Guichê 1';
  lastCall: CallNextTicketResultDto | null = null;

  constructor(
    public readonly senhaService: SenhaService,
    private readonly toastController: ToastController,
  ) {}

  ngOnInit(): void {
    void this.loadOverview();
  }

  chamarProximaSenha() {
    this.loading = true;
    this.senhaService.chamarProximaSenha(this.guiche)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: async (result) => {
          this.lastCall = result;

          if (result.ticket) {
            await this.presentToast(`Chamando ${result.ticket.code} para ${this.guiche}.`, 'success');
            await this.triggerHaptic('success');
          } else {
            await this.presentToast('Não há senhas disponíveis para chamada.', 'warning');
            await this.triggerHaptic('warning');
          }

          void this.loadOverview();
        },
        error: async () => {
          await this.presentToast('Falha ao chamar a próxima senha.', 'danger');
          await this.triggerHaptic('error');
        },
      });
  }

  refresh(): void {
    void this.loadOverview();
  }

  private loadOverview(): Promise<void> {
    return new Promise((resolve) => {
      this.senhaService.obterPainel().subscribe({
        next: (overview) => {
          this.overview = overview;
          resolve();
        },
        error: async () => {
          await this.presentToast('Falha ao carregar o painel do atendente.', 'danger');
          resolve();
        },
      });
    });
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

  private async triggerHaptic(level: 'success' | 'warning' | 'error'): Promise<void> {
    try {
      await Haptics.notification({
        type:
          level === 'success'
            ? NotificationType.Success
            : level === 'warning'
              ? NotificationType.Warning
              : NotificationType.Error,
      });
    } catch {
      // Ignora em navegadores ou ambientes sem suporte nativo.
    }
  }

}