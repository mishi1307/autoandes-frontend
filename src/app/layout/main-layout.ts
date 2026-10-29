import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
@Component({selector:'app-main-layout',standalone:true,imports:[NgIf,RouterOutlet,RouterLink,RouterLinkActive],templateUrl:'./main-layout.html',styleUrl:'./main-layout.scss'})
export class MainLayout { constructor(readonly auth:AuthService){} }