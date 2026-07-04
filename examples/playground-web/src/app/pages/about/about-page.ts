import { Component, inject, makeStateKey, TransferState } from '@angular/core';
import { RouterLink } from '@angular/router';

const RENDERED_AT_KEY = makeStateKey<string>('about.renderedAt');

@Component({
  selector: 'app-about-page',
  imports: [RouterLink],
  templateUrl: './about-page.html',
})
export class AboutPage {
  // Angular still constructs this component's class on the client during
  // hydration (only the DOM is reused, not the JS instance) — a plain
  // `new Date()` field would silently recompute there and overwrite the
  // frozen server value a moment after load. TransferState captures the
  // value the server computed once and hands the client that exact string
  // instead of letting it compute its own.
  private readonly transferState = inject(TransferState);
  protected readonly renderedAt = this.resolveRenderedAt();

  private resolveRenderedAt(): string {
    const cached = this.transferState.get(RENDERED_AT_KEY, null);
    if (cached) {
      return cached;
    }
    const now = new Date().toISOString();
    this.transferState.set(RENDERED_AT_KEY, now);
    return now;
  }
}
