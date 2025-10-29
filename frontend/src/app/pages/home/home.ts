import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../../auth/models/auth.model';
import { Auth } from '../../auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit{
  user: User | null = null;
  loading = true;
  errorMessage = '';

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {
      this.auth.getMe().subscribe({
        next:(res)=>{
          this.user = res;
          this.loading = false
        },
        error:(err)=>{
          this.errorMessage = 'Session expired, please login again.'
          this.loading = false;
          this.auth.logout();
          this.router.navigate(['/login'])
        }
      })
  }

  logout(){
    this.auth.logout();
    this.router.navigate(['/login'])
  }

}
