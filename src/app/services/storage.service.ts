import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly FIRST_VISIT_KEY = 'hasVisited';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  hasVisited(): boolean {
    if (!this.isBrowser) return true; // SSR → asumimos visitado
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
}
