import { CanDeactivateFn, Route } from '@angular/router';
import { OverviewComponent } from './features/workshop-publishing/pages/overview.component';
import { PublishingComponent } from './features/workshop-publishing/pages/publishing.component';

export const preserveWorkshop: CanDeactivateFn<PublishingComponent> = (page) => page.canLeave();

export const Routes: Route[] = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'new', component: PublishingComponent, canDeactivate: [preserveWorkshop] },
  { path: 'console', redirectTo: 'new', pathMatch: 'full' },
  { path: 'hello-world', redirectTo: 'overview', pathMatch: 'full' },
];
