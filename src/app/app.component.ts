import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { PesquisaComponent } from "./components/pesquisa/pesquisa.component";
import { EstatisticasComponent } from "./components/estatisticas/estatisticas.component";
import { AlbumComponent } from './components/album/album.component';
import { FiltroComponent } from './components/filtro/filtro.component';
import { FigurinhasService } from './service/figurinhas.service';

@Component({
  selector: 'app-root',
  imports: [NavBarComponent, PesquisaComponent, EstatisticasComponent, AlbumComponent, FiltroComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'album-copa';
  tema: 'dark' | 'light' = 'dark';

  constructor(public service: FigurinhasService) {}

  ngOnInit() {
    this.service.carregar();
    const temaSalvo = localStorage.getItem('tema') as 'dark' | 'light';
    if (temaSalvo) this.tema = temaSalvo;
    document.body.setAttribute('data-tema', this.tema);
  }

  toggleTema() {
    this.tema = this.tema === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-tema', this.tema);
    localStorage.setItem('tema', this.tema);
  }

  onPesquisa(texto: string) {
    this.service.setBusca(texto);
  }
}
