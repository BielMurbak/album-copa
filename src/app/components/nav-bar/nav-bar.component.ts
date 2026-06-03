import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FigurinhasService } from '../../service/figurinhas.service';
import * as Swal from 'sweetalert2';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  @Input() tema: 'dark' | 'light' = 'dark';
  @Output() temaToggle = new EventEmitter<void>();

  private service = inject(FigurinhasService);

  async resetar(): Promise<void> {
    const result = await Swal.default.fire({
      title: 'Resetar álbum?',
      text: 'Todas as figurinhas marcadas e repetidas serão removidas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, resetar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: this.tema === 'dark' ? '#1e1e26' : '#ffffff',
      color: this.tema === 'dark' ? '#f0f0f5' : '#111118',
    });

    if (result.isConfirmed) {
      await this.service.resetar();
      Swal.default.fire({
        title: 'Álbum resetado!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: this.tema === 'dark' ? '#1e1e26' : '#ffffff',
        color: this.tema === 'dark' ? '#f0f0f5' : '#111118',
      });
    }
  }
}
