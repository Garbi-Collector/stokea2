import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly FIRST_VISIT_KEY = 'hasVisited';

  constructor() {}

  /**
   * Devuelve true si el usuario ya entró alguna vez.
   * Devuelve false si es la primera vez.
   */
  hasVisited(): boolean {
    return localStorage.getItem(this.FIRST_VISIT_KEY) === 'true';
  }

  /**
   * Marca que el usuario ya entró por primera vez.
   */
  markAsVisited(): void {
    localStorage.setItem(this.FIRST_VISIT_KEY, 'true');
  }

  /**
   * Borra el estado de visita (vuelve a ser "primera vez").
   * Útil para debug, testing u onboarding.
   */
  clearVisited(): void {
    localStorage.removeItem(this.FIRST_VISIT_KEY);
  }
}
