import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Orden, OrdenResumen } from '../../core/models/api.models';
import { OrdenesApi } from '../../core/services/api.services';
@Component({standalone:true,imports:[CommonModule,FormsModule,DatePipe,DecimalPipe,RouterLink],templateUrl:'./ordenes.page.html'})
export class OrdenesPage implements OnInit {
 private api=inject(OrdenesApi); readonly auth=inject(AuthService); items:OrdenResumen[]=[]; loading=true; error=''; success=''; placa=''; estado=''; desde=''; hasta=''; selected:Orden|null=null; motivo='';
 ngOnInit(){this.buscar();}
 buscar(){this.loading=true;this.error='';this.api.buscar({placa:this.placa||undefined,estado:this.estado||undefined,desde:this.desde||undefined,hasta:this.hasta||undefined}).subscribe({next:v=>{this.items=v;this.loading=false;},error:e=>{this.error=this.message(e);this.loading=false;}});}
 ver(o:OrdenResumen){this.error='';this.api.obtener(o.id).subscribe({next:v=>this.selected=v,error:e=>this.error=this.message(e)});}
 cerrarDetalle(){this.selected=null;this.motivo='';}
 puedeAnular(o:Orden){return o.estado==='REGISTRADA'&&new Date(o.fecha).toDateString()===new Date().toDateString()&&this.auth.hasPermission('ORDEN_ANULAR');}
 anular(){if(!this.selected)return;if(this.motivo.trim().length<10||this.motivo.trim().length>200){this.error='El motivo debe tener entre 10 y 200 caracteres.';return;}if(!confirm('¿Anular esta orden de servicio?'))return;this.api.anular(this.selected.id,this.motivo.trim()).subscribe({next:v=>{this.selected=v;this.success='Orden anulada.';this.buscar();},error:e=>this.error=this.message(e)});}
 limpiar(){this.placa='';this.estado='';this.desde='';this.hasta='';this.buscar();}
 private message(e:unknown){const h=e as HttpErrorResponse;return h.error?.mensaje||'No se pudieron consultar las órdenes. Verifica AutoAndes API.';}
}