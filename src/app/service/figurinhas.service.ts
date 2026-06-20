import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Figurinha } from '../models/figurinhas.models';
import { StorageService } from './storage.service';
import { bandeiraDoGrupo } from '../utils/bandeiras';
import { CONQUISTAS_DISPONIVEIS, ConquistaEstado } from '../utils/conquistas';

export type FiltroTipo = 'todas' | 'obtidas' | 'faltantes' | 'repetidas';

export interface ProgressoGrupo {
  nome: string;
  bandeira: string;
  obtidas: number;
  total: number;
  percentual: number;
  completo: boolean;
}

@Injectable({ providedIn: 'root' })
export class FigurinhasService {
  private _figurinhas = signal<Figurinha[]>([]);
  private _busca = signal<string>('');
  private _filtro = signal<FiltroTipo>('todas');
  private _conquistasDesbloqueadas = signal<Map<string, number>>(new Map());

  // Sinalizadores de evento: cada um carrega um id incremental para o effect()
  // dos componentes conseguir detectar "disparou de novo" mesmo com o mesmo valor.
  private _eventoConfeteAlbum = signal(0);
  private _eventoConquistaNova = signal<ConquistaEstado | null>(null);
  private _eventoGrupoCompleto = signal<string | null>(null);

  readonly busca = this._busca.asReadonly();
  readonly filtro = this._filtro.asReadonly();
  readonly eventoConfeteAlbum = this._eventoConfeteAlbum.asReadonly();
  readonly eventoConquistaNova = this._eventoConquistaNova.asReadonly();
  readonly eventoGrupoCompleto = this._eventoGrupoCompleto.asReadonly();

  private gruposAnteriores = new Set<string>();
  private albumJaCompleto = false;

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

  // Acesso a todas as figurinhas sem nenhum filtro aplicado — usado por
  // componentes como o modal de resumo da seleção, que precisam ver o
  // grupo completo independente do que está filtrado na tela principal.
  readonly todasFigurinhas = computed(() => this._figurinhas());

  readonly estatisticas = computed(() => {
    const all = this._figurinhas();
    const total = all.length;
    const obtidas = all.filter(f => f.quantidade > 0).length;
    const tiposRepetidos = all.filter(f => f.quantidade > 1).length;
    const repetidas = all.filter(f => f.quantidade > 1).reduce((acc, f) => acc + (f.quantidade - 1), 0);
    const percentual = total > 0 ? Math.round((obtidas / total) * 100) : 0;
    return { total, obtidas, faltantes: total - obtidas, repetidas, tiposRepetidos, percentual };
  });

  // Progresso individual de cada seleção/grupo (país), na ordem em que aparecem no álbum.
  readonly progressoPorGrupo = computed<ProgressoGrupo[]>(() => {
    const mapa = new Map<string, Figurinha[]>();
    for (const f of this._figurinhas()) {
      const grupo = mapa.get(f.nome) ?? [];
      grupo.push(f);
      mapa.set(f.nome, grupo);
    }
    return Array.from(mapa.entries()).map(([nome, itens]) => {
      const total = itens.length;
      const obtidas = itens.filter(f => f.quantidade > 0).length;
      const percentual = total > 0 ? Math.round((obtidas / total) * 100) : 0;
      return { nome, bandeira: bandeiraDoGrupo(nome), obtidas, total, percentual, completo: obtidas === total };
    });
  });

  // Ranking dos grupos incompletos, ordenado pelos mais próximos de fechar primeiro.
  readonly rankingProximos = computed<ProgressoGrupo[]>(() => {
    return this.progressoPorGrupo()
      .filter(g => !g.completo)
      .sort((a, b) => (b.obtidas / b.total) - (a.obtidas / a.total) || (a.total - a.obtidas) - (b.total - b.obtidas));
  });

  readonly conquistas = computed<ConquistaEstado[]>(() => {
    const desbloqueadas = this._conquistasDesbloqueadas();
    return CONQUISTAS_DISPONIVEIS.map(def => ({
      ...def,
      desbloqueada: desbloqueadas.has(def.id),
      desbloqueadaEm: desbloqueadas.get(def.id) ?? null,
    }));
  });

  constructor(private http: HttpClient, private storage: StorageService) {}

  async carregar(): Promise<void> {
    await this.storage.abrir();

    const conquistasSalvas = await this.storage.carregarConquistas();
    this._conquistasDesbloqueadas.set(new Map(conquistasSalvas.map(c => [c.id, c.desbloqueadaEm])));

    this.http.get<{ codigo: string; nome: string }[]>('assets/data/figurinhas.json').subscribe(async data => {
      const salvas = await this.storage.carregarTodos();
      const mapaQuantidades = new Map(salvas.map(s => [s.codigo, s.quantidade]));

      this._figurinhas.set(data.map(f => ({
        ...f,
        quantidade: mapaQuantidades.get(f.codigo) ?? 0
      })));

      // Inicializa o snapshot de grupos completos SEM disparar animações
      // (evita confete/badge reaparecer toda vez que o app é aberto).
      this.gruposAnteriores = new Set(
        this.progressoPorGrupo().filter(g => g.completo).map(g => g.nome)
      );
      this.albumJaCompleto = this.estatisticas().percentual === 100;
    });
  }

  async incrementar(codigo: string): Promise<void> {
    const eraZero = this._figurinhas().find(f => f.codigo === codigo)?.quantidade === 0;

    this._figurinhas.update(list =>
      list.map(f => f.codigo === codigo ? { ...f, quantidade: f.quantidade + 1 } : f)
    );
    const fig = this._figurinhas().find(f => f.codigo === codigo);
    if (fig) await this.storage.salvarQuantidade(codigo, fig.quantidade);

    if (eraZero) {
      await this.verificarConquista('primeira-figurinha');
    }

    await this.verificarMarcos(fig?.nome);
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
    this.gruposAnteriores = new Set();
    this.albumJaCompleto = false;
    // Conquistas já desbloqueadas permanecem no histórico do usuário —
    // resetar o álbum não deve apagar conquistas conquistadas no passado.
  }

  // Verifica se algum grupo acabou de ser completado ou se o álbum bateu 100%,
  // e dispara os sinalizadores de animação + conquistas correspondentes.
  private async verificarMarcos(nomeGrupoAlterado: string | undefined): Promise<void> {
    if (nomeGrupoAlterado) {
      const grupo = this.progressoPorGrupo().find(g => g.nome === nomeGrupoAlterado);
      if (grupo?.completo && !this.gruposAnteriores.has(grupo.nome)) {
        this.gruposAnteriores.add(grupo.nome);
        this._eventoGrupoCompleto.set(grupo.nome);

        await this.verificarConquista('primeira-selecao-completa');

        const totalCompletos = this.progressoPorGrupo().filter(g => g.completo).length;
        if (totalCompletos >= 5) await this.verificarConquista('cinco-selecoes');
      }
    }

    const percentual = this.estatisticas().percentual;
    if (percentual >= 25) await this.verificarConquista('quarto-album');
    if (percentual >= 50) await this.verificarConquista('metade-album');
    if (percentual >= 75) await this.verificarConquista('tres-quartos-album');

    if (this.estatisticas().repetidas >= 20) await this.verificarConquista('colecionador');

    if (percentual === 100 && !this.albumJaCompleto) {
      this.albumJaCompleto = true;
      await this.verificarConquista('album-completo');
      this._eventoConfeteAlbum.update(n => n + 1);
    }
  }

  private async verificarConquista(id: string): Promise<void> {
    if (this._conquistasDesbloqueadas().has(id)) return;

    const def = CONQUISTAS_DISPONIVEIS.find(c => c.id === id);
    if (!def) return;

    const agora = Date.now();
    this._conquistasDesbloqueadas.update(mapa => {
      const novo = new Map(mapa);
      novo.set(id, agora);
      return novo;
    });
    await this.storage.salvarConquista(id, agora);

    this._eventoConquistaNova.set({ ...def, desbloqueada: true, desbloqueadaEm: agora });
  }

  private agruparPorPais(lista: Figurinha[]): string {
    const mapa = new Map<string, string[]>();
    for (const f of lista) {
      const grupo = mapa.get(f.nome) ?? [];
      grupo.push(f.codigo);
      mapa.set(f.nome, grupo);
    }
    return Array.from(mapa.entries())
      .map(([nome, codigos]) => `${bandeiraDoGrupo(nome)} ${nome}: ${codigos.join(', ')}`)
      .join('\n');
  }

  private agruparPorPaisComQuantidade(lista: Figurinha[]): string {
    const mapa = new Map<string, string[]>();
    for (const f of lista) {
      const grupo = mapa.get(f.nome) ?? [];
      const extra = f.quantidade - 1;
      grupo.push(extra > 1 ? `${f.codigo} (x${extra})` : f.codigo);
      mapa.set(f.nome, grupo);
    }
    return Array.from(mapa.entries())
      .map(([nome, codigos]) => `${bandeiraDoGrupo(nome)} ${nome}: ${codigos.join(', ')}`)
      .join('\n');
  }

  gerarTextoFaltantes(): string {
    const faltantes = this._figurinhas().filter(f => f.quantidade === 0);
    if (faltantes.length === 0) return 'Não tenho figurinhas faltantes! 🎉';
    return `🔴 Figurinhas que me faltam (${faltantes.length}):\n\n${this.agruparPorPais(faltantes)}`;
  }

  gerarTextoRepetidas(): string {
    const repetidas = this._figurinhas().filter(f => f.quantidade > 1);
    if (repetidas.length === 0) return 'Não tenho figurinhas repetidas no momento.';
    return `🔁 Figurinhas repetidas que tenho pra troca (${repetidas.length}):\n\n${this.agruparPorPaisComQuantidade(repetidas)}`;
  }

  gerarTextoCompleto(): string {
    return `${this.gerarTextoFaltantes()}\n\n${this.gerarTextoRepetidas()}`;
  }
}
