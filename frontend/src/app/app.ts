import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './core/header/header';
import { CommonModule } from '@angular/common';
import { every, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showHeader = true;
  constructor(private router:Router){
    this.router.events.pipe(filter((event):  event is NavigationEnd => event instanceof NavigationEnd ))
    .subscribe((event) => {
      const noHeaderRoutes = ['/login','/register'];
      this.showHeader = !noHeaderRoutes.includes(event.urlAfterRedirects)
    })
  }
}
