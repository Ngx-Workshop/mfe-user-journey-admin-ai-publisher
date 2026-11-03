import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  host: { class: 'publisher-app ngx-design-system' },
  selector: 'mfe-user-journey-admin-ai-publisher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`:host { display: block; }`],
})
export class App {}
export default App;
