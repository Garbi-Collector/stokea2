import { Injectable } from '@angular/core';
import {User} from "../models/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private initialized = false;

  /* =======================
     INIT (interno)
  ======================= */

  private async ensureInit(): Promise<void> {
    if (this.initialized) return;
    await window.api.user.init('Usuario');
    this.initialized = true;
  }

  private async getUser(): Promise<User | null> {
    await this.ensureInit();
    const user = await window.api.user.get();
    return user
      ? { ...user, is_first_time: !!user.is_first_time }
      : null;
  }

  /* =======================
     PRIMERA VISITA
  ======================= */

  async hasVisited(): Promise<boolean> {
    const user = await this.getUser();
    return user ? !user.is_first_time : true;
  }

  async markAsVisited(): Promise<void> {
    await this.ensureInit();
    await window.api.user.markVisited();
  }

  async clearVisited(): Promise<void> {
    await this.ensureInit();
    await window.api.user.resetFirstVisit();
  }

  /* =======================
     NOMBRE DE USUARIO
  ======================= */

  async setUserName(name: string): Promise<void> {
    await this.ensureInit();
    await window.api.user.updateName(name.trim());
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
    await this.ensureInit();
    await window.api.user.updateName(newName.trim());
  }

  async removeUserName(): Promise<void> {
    await this.ensureInit();
    await window.api.user.updateName('');
  }

  async setSchedule(
    openHour: number,
    openMinute: number,
    closeHour: number,
    closeMinute: number
  ): Promise<void> {
    await this.ensureInit();
    await window.api.user.updateSchedule(
      openHour,
      openMinute,
      closeHour,
      closeMinute
    );
  }

  async getSchedule(): Promise<{
    open: string;
    close: string;
  } | null> {
    const user = await this.getUser();
    if (!user) return null;

    const pad = (n: number) => n.toString().padStart(2, '0');

    return {
      open: `${pad(user.open_hour)}:${pad(user.open_minute)}`,
      close: `${pad(user.close_hour)}:${pad(user.close_minute)}`
    };
  }


}
