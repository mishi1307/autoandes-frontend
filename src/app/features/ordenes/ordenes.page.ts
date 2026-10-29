import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Orden, OrdenResumen } from '../../core/models/api.models';
import { OrdenesApi } from '../../core/services/api.services';
@Component({standalone:true,imports:[CommonModule,FormsModule,DatePipe,DecimalPipe,RouterLink],templateUrl:'./ordenes.page.html'})
export class OrdenesPage implements OnInit {
 private api=inject(OrdenesApi); private route=inject(ActivatedRoute); private router=inject(Router); private cdr=inject(ChangeDetectorRef); readonly auth=inject(AuthService); items:OrdenResumen[]=[]; loading=true; loadingDetail=true; detailRoute=false; error=''; success=''; placa=''; estado=''; desde=''; hasta=''; selected:Orden|null=null; motivo='';
 ngOnInit(){const id=Number(this.route.snapshot.paramMap.get('id'));if(id>0){this.detailRoute=true;this.api.obtener(id).subscribe({next:v=>{this.selected=v;this.loadingDetail=false;this.cdr.markForCheck();},error:e=>{this.error=this.message(e);this.loadingDetail=false;this.cdr.markForCheck();}});return;}const numero=this.route.snapshot.queryParamMap.get('creada');if(numero)this.success=`Orden ${numero} registrada correctamente.`;this.buscar();}
 buscar(){this.loading=true;this.error='';this.api.buscar({placa:this.placa||undefined,estado:this.estado||undefined,desde:this.desde||undefined,hasta:this.hasta||undefined}).subscribe({next:v=>{this.items=v;this.loading=false;this.cdr.markForCheck();},error:e=>{this.error=this.message(e);this.loading=false;this.cdr.markForCheck();}});}
 ver(o:OrdenResumen){this.router.navigate(['/ordenes',o.id]);}
 cerrarDetalle(){this.router.navigate(['/ordenes']);}
 puedeAnular(o:Orden){return o.estado==='REGISTRADA'&&new Date(o.fecha).toDateString()===new Date().toDateString()&&this.auth.hasPermission('ORDEN_ANULAR');}
 anular(){if(!this.selected)return;if(this.motivo.trim().length<10||this.motivo.trim().length>200){this.error='El motivo debe tener entre 10 y 200 caracteres.';return;}if(!confirm('¿Anular esta orden de servicio?'))return;this.api.anular(this.selected.id,this.motivo.trim()).subscribe({next:v=>{this.selected=v;this.success='Orden anulada.';this.cdr.markForCheck();this.buscar();},error:e=>{this.error=this.message(e);this.cdr.markForCheck();}});}
 limpiar(){this.placa='';this.estado='';this.desde='';this.hasta='';this.buscar();}
 private message(e:unknown){const h=e as HttpErrorResponse;return h.error?.mensaje||'No se pudieron consultar las órdenes. Verifica AutoAndes API.';}
}
