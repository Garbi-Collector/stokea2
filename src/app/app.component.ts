import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FirstSetUpComponent} from "./comp/first-set-up/first-set-up.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FirstSetUpComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-electron-template';
}
