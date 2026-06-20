import { Injectable } from '@angular/core';

const DB_NAME = 'album-copa';
// IMPORTANTE: ao subir esta versão, o onupgradeneeded roda e cria APENAS
// o que ainda não existe (novos object stores). Os dados que já estão no
// store 'figurinhas' não são apagados nem tocados nesse processo.
const DB_VERSION = 2;
const STORE_FIGURINHAS = 'figurinhas';
const STORE_CONQUISTAS = 'conquistas';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private db: IDBDatabase | null = null;

  abrir(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_FIGURINHAS)) {
          db.createObjectStore(STORE_FIGURINHAS, { keyPath: 'codigo' });
        }
        if (!db.objectStoreNames.contains(STORE_CONQUISTAS)) {
          db.createObjectStore(STORE_CONQUISTAS, { keyPath: 'id' });
        }
      };

      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve();
      };

      req.onerror = () => reject(req.error);
    });
  }

  salvarQuantidade(codigo: string, quantidade: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_FIGURINHAS, 'readwrite');
      tx.objectStore(STORE_FIGURINHAS).put({ codigo, quantidade });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  carregarTodos(): Promise<{ codigo: string; quantidade: number }[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_FIGURINHAS, 'readonly');
      const req = tx.objectStore(STORE_FIGURINHAS).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  limparTodos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_FIGURINHAS, 'readwrite');
      tx.objectStore(STORE_FIGURINHAS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  salvarConquista(id: string, desbloqueadaEm: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_CONQUISTAS, 'readwrite');
      tx.objectStore(STORE_CONQUISTAS).put({ id, desbloqueadaEm });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  carregarConquistas(): Promise<{ id: string; desbloqueadaEm: number }[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_CONQUISTAS, 'readonly');
      const req = tx.objectStore(STORE_CONQUISTAS).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
