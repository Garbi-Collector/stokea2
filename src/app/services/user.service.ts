import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from "../models/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private initialized = false;
  private mockData$ = new BehaviorSubject<User | null>(null);
  private mockInitPromise: Promise<void> | null = null;

  constructor(private http: HttpClient) {}

  private hasBackend(): boolean {
    return !!(window as any).api?.user;
  }

  private async initMock(): Promise<void> {
    // Si ya se está inicializando o ya está inicializado, esperar/retornar
    if (this.mockInitPromise) return this.mockInitPromise;

    this.mockInitPromise = (async () => {
      const data = await firstValueFrom(
        this.http.get<User>('assets/mock/user_config.json')
      );
      this.mockData$.next(data);
    })();

    return this.mockInitPromise;
  }

  private async ensureInit(): Promise<void> {
    if (this.hasBackend()) {
      if (this.initialized) return;
      await window.api.user.init('Usuario');
      this.initialized = true;
    } else {
      await this.initMock();
    }
  }

  private async getUser(): Promise<User | null> {
    await this.ensureInit();

    if (this.hasBackend()) {
      const user = await window.api.user.get();
      return user ? { ...user, is_first_time: !!user.is_first_time } : null;
    }

    // MOCK MODE
    return this.mockData$.value;
  }

  async hasVisited(): Promise<boolean> {
    const user = await this.getUser();
    return user ? !user.is_first_time : true;
  }

  async markAsVisited(): Promise<void> {
    await this.ensureInit();

    if (this.hasBackend()) {
      await window.api.user.markVisited();
    } else {
      // MOCK MODE
      const current = this.mockData$.value;
      if (current) {
        this.mockData$.next({ ...current, is_first_time: false });
      }
    }
  }

  async clearVisited(): Promise<void> {
    await this.ensureInit();

    if (this.hasBackend()) {
      await window.api.user.resetFirstVisit();
    } else {
      // MOCK MODE
      const current = this.mockData$.value;
      if (current) {
        this.mockData$.next({ ...current, is_first_time: true });
      }
    }
  }

  async setUserName(name: string): Promise<void> {
    await this.ensureInit();

    if (this.hasBackend()) {
      await window.api.user.updateName(name.trim());
    } else {
      // MOCK MODE
      const current = this.mockData$.value;
      if (current) {
        this.mockData$.next({ ...current, name: name.trim() });
      }
    }
  }

  async getUserName(): Promise<string | null> {
    const user = await this.getUser();
    return user?.name ?? null;
  }

  async hasUserName(): Promise<boolean> {
    const name = await this.getUserName();
    return !!name;
  }

  async updateUserName(newName: string): Promise<void> {
    await this.setUserName(newName);
  }

  async removeUserName(): Promise<void> {
    await this.setUserName('');
  }

  async setSchedule(
    openHour: number,
    openMinute: number,
    closeHour: number,
    closeMinute: number
  ): Promise<void> {
    await this.ensureInit();

    if (this.hasBackend()) {
      await window.api.user.updateSchedule(openHour, openMinute, closeHour, closeMinute);
    } else {
      // MOCK MODE
      const current = this.mockData$.value;
      if (current) {
        this.mockData$.next({
          ...current,
          open_hour: openHour,
          open_minute: openMinute,
          close_hour: closeHour,
          close_minute: closeMinute
        });
      }
    }
  }

  async getSchedule(): Promise<{ open: string; close: string } | null> {
    const user = await this.getUser();
    if (!user) return null;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      open: `${pad(user.open_hour)}:${pad(user.open_minute)}`,
      close: `${pad(user.close_hour)}:${pad(user.close_minute)}`
    };
  }

  async updateMoneyGoal(moneyGoal: number): Promise<void> {
    await this.ensureInit();

    if (this.hasBackend()) {
      await window.api.user.updateMoneyGoal(moneyGoal);
    } else {
      // MOCK MODE
      const current = this.mockData$.value;
      if (current) {
        this.mockData$.next({ ...current, money_goal: moneyGoal });
      }
    }
  }

  async getMoneyGoal(): Promise<number> {
    const user = await this.getUser();
    return user?.money_goal ?? 1000;
  }
}
