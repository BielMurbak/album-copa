import { Component, inject } from '@angular/core';
import { FigurinhasService, FiltroTipo } from '../../service/figurinhas.service';

@Component({
  selector: 'app-filtro',
  imports: [],
  templateUrl: './filtro.component.html',
  styleUrl: './filtro.component.scss'
})
export class FiltroComponent {
  service = inject(FigurinhasService);

  readonly opcoes: { valor: FiltroTipo; label: string }[] = [
    { valor: 'todas', label: 'Todas' },
    { valor: 'obtidas', label: 'Obtidas' },
    { valor: 'faltantes', label: 'Faltantes' },
    { valor: 'repetidas', label: 'Repetidas' },
  ];
}
