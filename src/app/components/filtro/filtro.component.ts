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

  copiado = false;

  get totalRepetidas(): number {
    return this.service.estatisticas().tiposRepetidos;
  }

  async copiarFaltantes(): Promise<void> {
    await this.copiarTexto(this.service.gerarTextoFaltantes());
  }

  async copiarRepetidas(): Promise<void> {
    await this.copiarTexto(this.service.gerarTextoRepetidas());
  }

  private async copiarTexto(texto: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(texto);
      this.copiado = true;
      setTimeout(() => this.copiado = false, 2000);
    } catch {
      // Fallback para navegadores/contextos sem permissão de clipboard
      const area = document.createElement('textarea');
      area.value = texto;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      this.copiado = true;
      setTimeout(() => this.copiado = false, 2000);
    }
  }
}
