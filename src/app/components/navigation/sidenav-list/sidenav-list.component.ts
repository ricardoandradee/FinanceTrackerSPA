import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter<void>();
  @Output() sidenavLogout = new EventEmitter<void>();
  isAuth$: Observable<boolean>;
  sidenavWidth = window.innerWidth > 599 ? 4 : 3;
  screenSize = window.innerWidth;
  
  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.isAuth$ = this.authService.getIsAuthenticated;
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, false);
  }

  onSignOut() {
    this.sidenavLogout.emit();
    this.sidenavClose.emit();
    this.authService.logout();
  }
}
