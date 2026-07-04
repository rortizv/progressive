import { Route } from '@angular/router';
import { HomePage } from './pages/home/home-page';
import { AboutPage } from './pages/about/about-page';

export const appRoutes: Route[] = [
  { path: '', component: HomePage },
  { path: 'about', component: AboutPage },
];
