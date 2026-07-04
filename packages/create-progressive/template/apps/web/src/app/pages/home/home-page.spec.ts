import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should render the heading and the API status', async () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    httpMock
      .expectOne('/api/health')
      .flush({ status: 'ok', timestamp: '2026-01-01T00:00:00.000Z' });

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      '__APP_NAME__',
    );
    expect(compiled.textContent).toContain('ok');
  });
});
