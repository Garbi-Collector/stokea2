import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-load',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './load.component.html',
  styleUrls: [
    './load.component.css',
    './../../style/animations.css',
    './../../style/cards.css',
    './../../style/colors.css',
    './../../style/typography.css',
  ]
})
export class LoadComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el destino desde los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      const targetRoute = params['target'];

      if (targetRoute) {
        // Simular carga durante 2 segundos antes de redirigir
        setTimeout(() => {
          this.router.navigate([targetRoute]);
        }, 2000);
      } else {
        // Si no hay destino, redirigir al home después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      }
    });
  }
}
