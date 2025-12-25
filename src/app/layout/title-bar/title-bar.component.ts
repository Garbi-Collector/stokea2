import { Component } from '@angular/core';

declare global {
  interface Window {
    api: {
      windowControls: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
    };
  }
}

@Component({
  selector: 'app-title-bar',
  standalone: true,
  templateUrl: './title-bar.component.html',
  styleUrl: './title-bar.component.css'
})
export class TitleBarComponent {

  minimize() {
    window.api.windowControls.minimize();
  }

  maximize() {
    window.api.windowControls.maximize();
  }

  close() {
    window.api.windowControls.close();
  }
}
