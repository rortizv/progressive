import { Component } from '@angular/core';
import { httpResource } from '@angular/common/http';

interface HealthResponse {
  status: string;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly health = httpResource<HealthResponse>(
    () => '/api/health',
  );
}
