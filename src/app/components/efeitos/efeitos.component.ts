import { Component, effect, signal, inject } from '@angular/core';
import { FigurinhasService } from '../../service/figurinhas.service';
import { ConquistaEstado } from '../../utils/conquistas';

interface Confete {
  id: number;
  left: number;
  delay: number;
  duracao: number;
  cor: string;
  rotacaoInicial: number;
}

const CORES_CONFETE = ['#facc15', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#f97316'];

@Component({
  selector: 'app-efeitos',
  imports: [],
  templateUrl: './efeitos.component.html',
  styleUrl: './efeitos.component.scss'
})
export class EfeitosComponent {
  private service = inject(FigurinhasService);

  confetes = signal<Confete[]>([]);
  toastConquista = signal<ConquistaEstado | null>(null);
  toastGrupo = signal<string | null>(null);

  constructor() {
    // Dispara confete quando o álbum atinge 100%.
    effect(() => {
      const n = this.service.eventoConfeteAlbum();
      if (n > 0) this.dispararConfete();
    });

    // Mostra toast de conquista nova por alguns segundos.
    effect(() => {
      const conquista = this.service.eventoConquistaNova();
      if (conquista) {
        this.toastConquista.set(conquista);
        setTimeout(() => this.toastConquista.set(null), 3800);
      }
    });

    // Mostra toast rápido de "seleção completa".
    effect(() => {
      const grupo = this.service.eventoGrupoCompleto();
      if (grupo) {
        this.toastGrupo.set(grupo);
        setTimeout(() => this.toastGrupo.set(null), 2800);
      }
    });
  }

  private dispararConfete(): void {
    const novos: Confete[] = Array.from({ length: 60 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duracao: 2.2 + Math.random() * 1.3,
      cor: CORES_CONFETE[i % CORES_CONFETE.length],
      rotacaoInicial: Math.random() * 360,
    }));
    this.confetes.set(novos);
    setTimeout(() => this.confetes.set([]), 4000);
  }
}
