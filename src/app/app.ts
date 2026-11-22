import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './layout/footer/footer';
import { Navbar } from './layout/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  template: `
    <app-navbar />
    <main class="flex-grow-1">
      <router-outlet />
    </main>
    <app-footer />
  `,
  host: { class: 'd-flex flex-column min-vh-100' },
})
export class App {}
