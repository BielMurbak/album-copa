import { Injectable } from '@angular/core';

const DB_NAME = 'album-copa';
const DB_VERSION = 1;
const STORE = 'figurinhas';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private db: IDBDatabase | null = null;

  abrir(): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'codigo' });
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
      const tx = this.db!.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ codigo, quantidade });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  carregarTodos(): Promise<{ codigo: string; quantidade: number }[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  limparTodos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
