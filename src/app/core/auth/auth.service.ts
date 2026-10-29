import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from '../config/environment';
import { LoginRequest, Session } from '../models/api.models';
const SESSION_KEY = 'autoandes.session';
type LoginResult = Omit<Session, 'expiresAt'>;
@Injectable({ providedIn: 'root' })
export class AuthService {
 readonly session = signal<Session | null>(this.restore());
 private expiryTimer?: ReturnType<typeof setTimeout>;
 constructor(private http:HttpClient,private router:Router){this.scheduleExpiry();}
 login(data:LoginRequest):Observable<Session>{return this.http.post<LoginResult>(environment.apiUrl + '/auth/login',data).pipe(map(result=>{const session:Session={...result,expiresAt:Date.now()+result.expiraEnSegundos*1000};sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));this.session.set(session);this.scheduleExpiry();return session;}));}
 logout(redirect=true):void{sessionStorage.removeItem(SESSION_KEY);this.session.set(null);clearTimeout(this.expiryTimer);if(redirect)void this.router.navigate(['/login']);}
 hasPermission(permission:string):boolean{const s=this.session();return !!s&&(s.roles.includes('ADMIN')||s.permisos.includes(permission));}
 private restore():Session|null{try{const value=sessionStorage.getItem(SESSION_KEY);if(!value)return null;const s=JSON.parse(value) as Session;if(s.expiresAt<=Date.now()){sessionStorage.removeItem(SESSION_KEY);return null;}return s;}catch{sessionStorage.removeItem(SESSION_KEY);return null;}}
 private scheduleExpiry():void{clearTimeout(this.expiryTimer);const s=this.session();if(!s)return;this.expiryTimer=setTimeout(()=>this.logout(),Math.max(0,s.expiresAt-Date.now()));}
}