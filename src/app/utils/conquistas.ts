export interface ConquistaDef {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
}

export interface ConquistaEstado extends ConquistaDef {
  desbloqueada: boolean;
  desbloqueadaEm: number | null;
}

// Lista de conquistas disponíveis no álbum. Para adicionar uma nova,
// basta incluir aqui e implementar a condição em figurinhas.service.ts (verificarConquistas).
export const CONQUISTAS_DISPONIVEIS: ConquistaDef[] = [
  {
    id: 'primeira-figurinha',
    titulo: 'Primeiro Cromo',
    descricao: 'Colou a primeira figurinha do álbum',
    icone: '🎬',
  },
  {
    id: 'primeira-selecao-completa',
    titulo: 'Seleção Completa',
    descricao: 'Completou sua primeira seleção',
    icone: '🏅',
  },
  {
    id: 'quarto-album',
    titulo: 'Um Quarto do Caminho',
    descricao: 'Completou 25% do álbum',
    icone: '🌱',
  },
  {
    id: 'metade-album',
    titulo: 'Na Metade',
    descricao: 'Completou 50% do álbum',
    icone: '🔥',
  },
  {
    id: 'tres-quartos-album',
    titulo: 'Reta Final',
    descricao: 'Completou 75% do álbum',
    icone: '⚡',
  },
  {
    id: 'album-completo',
    titulo: 'Álbum Completo',
    descricao: 'Completou 100% do álbum da Copa!',
    icone: '🏆',
  },
  {
    id: 'colecionador',
    titulo: 'Colecionador',
    descricao: 'Acumulou 20 figurinhas repetidas',
    icone: '📦',
  },
  {
    id: 'cinco-selecoes',
    titulo: 'Mundo Afora',
    descricao: 'Completou 5 seleções diferentes',
    icone: '🌍',
  },
];
