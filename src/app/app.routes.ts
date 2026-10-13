import { Route } from '@angular/router';
import App from './app';

export const Routes: Route[] = [
  { path: '', redirectTo: 'console', pathMatch: 'full' },
  { path: 'console', component: App },
  { path: 'hello-world', redirectTo: 'console', pathMatch: 'full' },
];
