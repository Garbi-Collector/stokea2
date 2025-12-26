import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import {ModalService} from "../../modalconfigs/core/modal.service";
import {ModalComponent} from "../../modalconfigs/shared/components/modal/modal.component";
import {SetupModalComponent} from "../../modals/setup-modal/setup-modal.component";
import {ProductsService} from "../../services/products.service";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  totalProducts: number =0;
  hasProduct: boolean =true;



  hasVisited = false;

  constructor(
    private storageService: StorageService,
    private modalService: ModalService,
    private productService: ProductsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.hasVisited = this.storageService.hasVisited();

    if (!this.hasVisited) {
      this.abrirModalSetUp();
    }

    this.totalProducts = await this.totalProductsCount();
    this.hasProduct = this.totalProducts > 0;
  }



  async totalProductsCount(): Promise<number> {
    return await this.productService.count();
  }

  abrirModalSetUp(): void {
    this.modalService.open({
      title: 'Acción Requerida',
      component: SetupModalComponent,
      data: {
        nombre: 'Usuario',
        mensaje: 'Debes completar esta configuración antes de continuar.'
      },
      width: '550px',
      closable: true,
      closeOnBackdrop: false // NO se cierra tocando el fondo, NO muestra botón X
    });
  }

}
