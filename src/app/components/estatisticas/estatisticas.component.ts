import { Component, inject } from '@angular/core';
import { FigurinhasService } from '../../service/figurinhas.service';

@Component({
  selector: 'app-estatisticas',
  templateUrl: './estatisticas.component.html',
  styleUrl: './estatisticas.component.scss'
})
export class EstatisticasComponent {

  service = inject(FigurinhasService);

  get totalFigurinhas() { return this.service.estatisticas().total; }
  get totalPossuidas() { return this.service.estatisticas().obtidas; }
  get totalFaltantes() { return this.service.estatisticas().faltantes; }
  get percentual() { return this.service.estatisticas().percentual; }

}