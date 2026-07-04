import { Component } from '@angular/core';
import { appControllerGetHealthResource } from '../../api/generated';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly health = appControllerGetHealthResource();
}
