import { Component } from '@angular/core';
import { appControllerGetHealthResource } from './api/generated';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly health = appControllerGetHealthResource();
}
