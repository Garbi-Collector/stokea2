import { Component, OnInit } from '@angular/core';
import {NgIf} from "@angular/common";
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
  styleUrl: './setup-modal.component.css'
})
export class SetupModalComponent {
  userName: string = '';
  showError: boolean = false;

  constructor(
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

    // Guardar el nombre en localStorage
    this.storageService.setUserName(this.userName.trim());

    console.log('Nombre guardado:', this.userName.trim());

    // guardar que no es la primera vez del usuario
    this.storageService.markAsVisited()

    // recargar la pagina

    // Cerrar el modal
    this.modalService.close();
  }
}
