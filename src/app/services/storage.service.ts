import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly FIRST_VISIT_KEY = 'hasVisited';
  private readonly USER_NAME_KEY = 'userName';

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /* =======================
     PRIMERA VISITA
     ======================= */

  hasVisited(): boolean {
    if (!this.isBrowser) return true;
    return localStorage.getItem(this.FIRST_VISIT_KEY) === 'true';
  }

  markAsVisited(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.FIRST_VISIT_KEY, 'true');
  }

  clearVisited(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.FIRST_VISIT_KEY);
  }

  /* =======================
     NOMBRE DE USUARIO
     ======================= */

  setUserName(name: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.USER_NAME_KEY, name.trim());
  }

  getUserName(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.USER_NAME_KEY);
  }

  hasUserName(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(this.USER_NAME_KEY) !== null;
  }

  updateUserName(newName: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.USER_NAME_KEY, newName.trim());
  }

  removeUserName(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.USER_NAME_KEY);
  }
}
