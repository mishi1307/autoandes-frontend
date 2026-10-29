import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Cliente, Servicio, Vehiculo } from '../../core/models/api.models';
import { ClientesApi, OrdenesApi, ServiciosApi, VehiculosApi } from '../../core/services/api.services';
@Component({standalone:true,imports:[CommonModule,ReactiveFormsModule,RouterLink,DecimalPipe],templateUrl:'./nueva-orden.page.html'})
export class NuevaOrdenPage implements OnInit {
 private fb=inject(FormBuilder); private clientesApi=inject(ClientesApi); private vehiculosApi=inject(VehiculosApi); private serviciosApi=inject(ServiciosApi); private api=inject(OrdenesApi); private router=inject(Router);
 clientes:Cliente[]=[];vehiculos:Vehiculo[]=[];servicios:Servicio[]=[];loading=true;error='';saving=false;
 readonly form=this.fb.nonNullable.group({clienteId:[0,[Validators.required,Validators.min(1)]],vehiculoId:[0,[Validators.required,Validators.min(1)]],kilometraje:[0,[Validators.required,Validators.min(0)]],detalles:this.fb.array([this.linea()],[Validators.required])});
 get detalles(){return this.form.controls.detalles as FormArray;}
 private linea(){return this.fb.nonNullable.group({servicioId:[0,[Validators.required,Validators.min(1)]],cantidad:[1,[Validators.required,Validators.min(1),Validators.max(5)]]});}
 ngOnInit(){this.clientesApi.listar().subscribe({next:v=>{this.clientes=v;this.loading=false;},error:e=>{this.error=this.message(e);this.loading=false;}});this.vehiculosApi.listar().subscribe({next:v=>this.vehiculos=v,error:e=>this.error=this.message(e)});this.serviciosApi.listar().subscribe({next:v=>this.servicios=v.filter(s=>s.activo),error:e=>this.error=this.message(e)});}
 get vehiculosFiltrados(){const id=Number(this.form.controls.clienteId.value);return this.vehiculos.filter(v=>!id||v.clienteId===id);}
 get totalEstimado(){return this.detalles.controls.reduce((sum,c)=>{const id=Number(c.get('servicioId')?.value);const cantidad=Number(c.get('cantidad')?.value)||0;return sum+(this.servicios.find(s=>s.id===id)?.precio||0)*cantidad;},0);}
 clienteCambio(){this.form.controls.vehiculoId.setValue(0);}
 agregar(){if(this.detalles.length<10)this.detalles.push(this.linea());}
 quitar(i:number){if(this.detalles.length>1)this.detalles.removeAt(i);}
 guardar(){this.error='';if(this.form.invalid){this.form.markAllAsTouched();return;}const raw=this.form.getRawValue();const ids=raw.detalles.map(d=>Number(d.servicioId));if(new Set(ids).size!==ids.length){this.error='No repitas el mismo servicio en el detalle.';return;}this.saving=true;this.api.crear({vehiculoId:Number(raw.vehiculoId),kilometraje:Number(raw.kilometraje),detalles:raw.detalles.map(d=>({servicioId:Number(d.servicioId),cantidad:Number(d.cantidad)}))}).subscribe({next:o=>{this.saving=false;this.router.navigate(['/ordenes'],{queryParams:{creada:o.numero}});},error:e=>{this.saving=false;this.error=this.message(e);}});}
 private message(e:unknown){const h=e as HttpErrorResponse;return h.error?.mensaje||'No se pudo registrar la orden.';}
}