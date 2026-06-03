import { Component, Input, computed, signal, inject } from '@angular/core';
import { Figurinha } from '../../models/figurinhas.models';
import { FigurinhasService } from '../../service/figurinhas.service';

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

  grupos = computed(() => {
    const mapa = new Map<string, Figurinha[]>();
    for (const f of this._figurinhas()) {
      const grupo = mapa.get(f.nome) ?? [];
      grupo.push(f);
      mapa.set(f.nome, grupo);
    }
    return Array.from(mapa.entries()).map(([nome, itens]) => ({ nome, itens }));
  });

  incrementar(figurinha: Figurinha): void {
    this.service.incrementar(figurinha.codigo);
  }

  decrementar(figurinha: Figurinha): void {
    this.service.decrementar(figurinha.codigo);
  }
}
