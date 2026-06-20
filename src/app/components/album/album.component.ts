import { Component, Input, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { Figurinha } from '../../models/figurinhas.models';
import { FigurinhasService } from '../../service/figurinhas.service';
import { bandeiraDoGrupo } from '../../utils/bandeiras';

@Component({
  selector: 'app-album',
  imports: [],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss'
})
export class AlbumComponent {
  private service = inject(FigurinhasService);
  private _figurinhas = signal<Figurinha[]>([]);

  @Input() set figurinhas(value: Figurinha[]) {
    this._figurinhas.set(value);
  }

  @Output() abrirResumo = new EventEmitter<string>();

  // codigo da figurinha que acabou de ser marcada, usado só para disparar a
  // animação de "pop" uma única vez no card certo (limpo logo em seguida).
  ultimaMarcada = signal<string | null>(null);

  grupos = computed(() => {
    const mapa = new Map<string, Figurinha[]>();
    for (const f of this._figurinhas()) {
      const grupo = mapa.get(f.nome) ?? [];
      grupo.push(f);
      mapa.set(f.nome, grupo);
    }
    const progressos = new Map(this.service.progressoPorGrupo().map(p => [p.nome, p]));
    return Array.from(mapa.entries()).map(([nome, itens]) => ({
      nome,
      bandeira: bandeiraDoGrupo(nome),
      itens,
      percentual: progressos.get(nome)?.percentual ?? 0,
      completo: progressos.get(nome)?.completo ?? false,
    }));
  });

  incrementar(figurinha: Figurinha): void {
    this.service.incrementar(figurinha.codigo);
    this.ultimaMarcada.set(figurinha.codigo);
    setTimeout(() => {
      if (this.ultimaMarcada() === figurinha.codigo) this.ultimaMarcada.set(null);
    }, 500);
  }

  decrementar(figurinha: Figurinha): void {
    this.service.decrementar(figurinha.codigo);
  }

  clicarGrupo(nome: string): void {
    this.abrirResumo.emit(nome);
  }
}
