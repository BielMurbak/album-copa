import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Figurinha } from '../models/figurinhas.models';
import { StorageService } from './storage.service';

export type FiltroTipo = 'todas' | 'obtidas' | 'faltantes' | 'repetidas';

@Injectable({ providedIn: 'root' })
export class FigurinhasService {
  private _figurinhas = signal<Figurinha[]>([]);
  private _busca = signal<string>('');
  private _filtro = signal<FiltroTipo>('todas');

  readonly busca = this._busca.asReadonly();
  readonly filtro = this._filtro.asReadonly();

  readonly figurinhasFiltradas = computed(() => {
    const termo = this._busca().toLowerCase().trim();
    const filtro = this._filtro();

    return this._figurinhas().filter(f => {
      const buscaOk = !termo ||
        f.codigo.toLowerCase().includes(termo) ||
        f.nome.toLowerCase().includes(termo);

      const filtroOk =
        filtro === 'todas' ||
        (filtro === 'obtidas' && f.quantidade > 0) ||
        (filtro === 'faltantes' && f.quantidade === 0) ||
        (filtro === 'repetidas' && f.quantidade > 1);

      return buscaOk && filtroOk;
    });
  });

  readonly estatisticas = computed(() => {
    const all = this._figurinhas();
    const total = all.length;
    const obtidas = all.filter(f => f.quantidade > 0).length;
    const repetidas = all.filter(f => f.quantidade > 1).reduce((acc, f) => acc + (f.quantidade - 1), 0);
    const percentual = total > 0 ? Math.round((obtidas / total) * 100) : 0;
    return { total, obtidas, faltantes: total - obtidas, repetidas, percentual };
  });

  constructor(private http: HttpClient, private storage: StorageService) {}

  async carregar(): Promise<void> {
    await this.storage.abrir();

    this.http.get<{ codigo: string; nome: string }[]>('assets/data/figurinhas.json').subscribe(async data => {
      const salvas = await this.storage.carregarTodos();
      const mapaQuantidades = new Map(salvas.map(s => [s.codigo, s.quantidade]));

      this._figurinhas.set(data.map(f => ({
        ...f,
        quantidade: mapaQuantidades.get(f.codigo) ?? 0
      })));
    });
  }

  async incrementar(codigo: string): Promise<void> {
    this._figurinhas.update(list =>
      list.map(f => f.codigo === codigo ? { ...f, quantidade: f.quantidade + 1 } : f)
    );
    const fig = this._figurinhas().find(f => f.codigo === codigo);
    if (fig) await this.storage.salvarQuantidade(codigo, fig.quantidade);
  }

  async decrementar(codigo: string): Promise<void> {
    this._figurinhas.update(list =>
      list.map(f => f.codigo === codigo && f.quantidade > 0 ? { ...f, quantidade: f.quantidade - 1 } : f)
    );
    const fig = this._figurinhas().find(f => f.codigo === codigo);
    if (fig) await this.storage.salvarQuantidade(codigo, fig.quantidade);
  }

  setBusca(termo: string): void {
    this._busca.set(termo);
  }

  setFiltro(filtro: FiltroTipo): void {
    this._filtro.set(filtro);
  }

  async resetar(): Promise<void> {
    this._figurinhas.update(list => list.map(f => ({ ...f, quantidade: 0 })));
    await this.storage.limparTodos();
  }
}
