import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TitleBarComponent} from "./layout/title-bar/title-bar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TitleBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-electron-template';
}
