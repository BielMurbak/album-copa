import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pesquisa',
  imports: [FormsModule],
  templateUrl: './pesquisa.component.html',
  styleUrl: './pesquisa.component.scss'
})
export class PesquisaComponent {

  @Output() pesquisaChange = new EventEmitter<string>();

  pesquisa = '';

  pesquisar() {
    this.pesquisaChange.emit(this.pesquisa);
  }

  limpar() {
    this.pesquisa = '';
    this.pesquisaChange.emit('');
  }

}