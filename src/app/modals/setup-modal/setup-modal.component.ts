import { Component, OnInit } from '@angular/core';
import {NgIf} from "@angular/common";
import { Router } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ModalService} from "../../modalconfigs/core/modal.service";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-setup-modal',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './setup-modal.component.html',
  styleUrls: [
    './setup-modal.component.css',
    './../../style/animations.css',
    './../../style/badges.css',
    './../../style/buttons.css',
    './../../style/cards.css',
    './../../style/colors.css',
    './../../style/forms.css',
    './../../style/tables.css',
    './../../style/typography.css',
  ]
})
export class SetupModalComponent {
  userName: string = '';
  showError: boolean = false;

  constructor(
    private router: Router,
    private modalService: ModalService,
    private storageService: UserService
  ) {}

  ngOnInit(): void {
    console.log('Modal de inicio cargado');
  }

  validateName(): void {
    this.showError = false;
  }

  isValidName(): boolean {
    return this.userName.trim().length >= 4;
  }

  aceptar(): void {
    if (!this.isValidName()) {
      this.showError = true;
      return;
    }

    // Guardar el nombre
    this.storageService.setUserName(this.userName.trim());

    // Marcar que ya visitó la app
    this.storageService.markAsVisited();

    console.log('Nombre guardado:', this.userName.trim());

    // ✅ Cerrar el modal primero
    this.modalService.close();

    // 🔄 Redirigir a load, que luego redirige a inicio
    this.router.navigate(['/load'], {
      queryParams: { target: '/inicio' }
    });
  }

}
