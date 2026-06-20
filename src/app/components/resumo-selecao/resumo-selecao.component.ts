import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { FigurinhasService } from '../../service/figurinhas.service';
import { bandeiraDoGrupo } from '../../utils/bandeiras';

@Component({
  selector: 'app-resumo-selecao',
  imports: [],
  templateUrl: './resumo-selecao.component.html',
  styleUrl: './resumo-selecao.component.scss'
})
export class ResumoSelecaoComponent {
  private service = inject(FigurinhasService);

  @Input() nomeGrupo: string | null = null;
  @Output() fechar = new EventEmitter<void>();

  bandeira = computed(() => this.nomeGrupo ? bandeiraDoGrupo(this.nomeGrupo) : '');

  itensDoGrupo = computed(() => {
    if (!this.nomeGrupo) return [];
    return this.service.todasFigurinhas().filter(f => f.nome === this.nomeGrupo);
  });

  faltantes = computed(() => this.itensDoGrupo().filter(f => f.quantidade === 0));
  repetidas = computed(() => this.itensDoGrupo().filter(f => f.quantidade > 1));

  progresso = computed(() => {
    if (!this.nomeGrupo) return null;
    return this.service.progressoPorGrupo().find(g => g.nome === this.nomeGrupo) ?? null;
  });

  fecharModal(): void {
    this.fechar.emit();
  }
}
