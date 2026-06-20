import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { FigurinhasService } from '../../service/figurinhas.service';

@Component({
  selector: 'app-painel-conquistas',
  imports: [],
  templateUrl: './painel-conquistas.component.html',
  styleUrl: './painel-conquistas.component.scss'
})
export class PainelConquistasComponent {
  service = inject(FigurinhasService);

  @Input() aberto = false;
  @Output() fechar = new EventEmitter<void>();

  aba = signal<'ranking' | 'conquistas'>('ranking');

  totalDesbloqueadas = computed(() => this.service.conquistas().filter(c => c.desbloqueada).length);

  setAba(aba: 'ranking' | 'conquistas'): void {
    this.aba.set(aba);
  }

  fecharModal(): void {
    this.fechar.emit();
  }

  formatarData(timestamp: number | null): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
