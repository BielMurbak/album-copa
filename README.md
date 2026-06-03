# 🏆 Álbum Copa 2026

> Gerencie suas figurinhas da Copa do Mundo 2026 de forma digital — marque as que você tem, controle as repetidas e acompanhe seu progresso em tempo real.

![Angular](https://img.shields.io/badge/Angular-19-dd0031?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8?style=flat-square&logo=pwa)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📱 Use no seu celular

Acesse pelo navegador e instale como app — sem precisar de loja:

**Android (Chrome)**
1. Abra o link no Chrome
2. Toque no menu **⋮** → **Adicionar à tela inicial**

**iPhone (Safari)**
1. Abra o link no Safari
2. Toque em **compartilhar** → **Adicionar à tela de início**

> Os dados ficam salvos localmente no seu dispositivo via IndexedDB — funcionam offline e persistem mesmo ao desligar o celular.

---

## ✨ Funcionalidades

- 📦 **994 figurinhas** organizadas por seleção
- ✅ Marque figurinhas como **obtidas** com um toque
- 🔁 Controle de **repetidas** com botões `+` e `−`
- 🔍 **Busca** por código ou nome da seleção
- 🎛️ **Filtros**: Todas · Obtidas · Faltantes · Repetidas
- 📊 **Estatísticas** em tempo real com barra de progresso
- 🌙 Tema **dark/light** com preferência salva
- 💾 Dados persistidos no **IndexedDB** do navegador
- 📱 **PWA** — instale como app no celular

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [Angular 19](https://angular.dev) | Framework principal |
| TypeScript | Linguagem |
| Signals | Gerenciamento de estado reativo |
| IndexedDB | Persistência local dos dados |
| SCSS | Estilização com temas via CSS variables |
| Flag Icons | Bandeiras dos países |
| SweetAlert2 | Alertas de confirmação |
| Angular PWA | Service Worker e manifest |

---

## 🚀 Rodando localmente

**Pré-requisitos:** Node.js 18+ e Angular CLI

```bash
# Clone o repositório
git clone https://github.com/BielMurbak/album-copa.git
cd album-copa

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve
```

Acesse `http://localhost:4200`

---

## 📦 Build para produção

```bash
ng build --base-href="/album-copa/"
```

Os arquivos gerados ficam em `dist/album-copa/browser/`.

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── components/
│   │   ├── album/        # Grid de figurinhas
│   │   ├── estatisticas/ # Cards de progresso
│   │   ├── filtro/       # Filtros por status
│   │   ├── nav-bar/      # Barra de navegação
│   │   └── pesquisa/     # Barra de busca
│   ├── models/           # Interfaces TypeScript
│   └── service/
│       ├── figurinhas.service.ts  # Lógica principal + signals
│       └── storage.service.ts     # Persistência IndexedDB
└── assets/
    └── data/
        └── figurinhas.json        # Base de dados das figurinhas
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma _issue_ ou enviar um _pull request_.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
