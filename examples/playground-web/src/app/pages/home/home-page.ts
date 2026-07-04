import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  appControllerGetBuildInfoResource,
  appControllerGetHealthResource,
} from '../../api/generated';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly health = appControllerGetHealthResource();
  protected readonly buildInfo = appControllerGetBuildInfoResource();
  protected readonly detailsRevealed = signal(false);
}
