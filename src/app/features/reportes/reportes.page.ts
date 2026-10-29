import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ReporteIngreso } from '../../core/models/api.models';
import { ReportesApi } from '../../core/services/api.services';
@Component({standalone:true,imports:[CommonModule,FormsModule,DecimalPipe],templateUrl:'./reportes.page.html'})
export class ReportesPage {private api=inject(ReportesApi);private cdr=inject(ChangeDetectorRef);desde='';hasta='';items:ReporteIngreso[]=[];loading=false;error='';consultado=false;
 consultar(){this.error='';if(!this.desde||!this.hasta){this.error='Selecciona ambas fechas.';return;}if(this.desde>this.hasta){this.error='La fecha inicial no puede ser posterior a la fecha final.';return;}this.loading=true;this.consultado=true;this.api.ingresos(this.desde,this.hasta).subscribe({next:v=>{this.items=v;this.loading=false;this.cdr.markForCheck();},error:(e:HttpErrorResponse)=>{this.error=e.error?.mensaje||'No se pudo generar el reporte.';this.loading=false;this.cdr.markForCheck();}});}
 get total(){return this.items.reduce((s,r)=>s+r.ingreso,0);}get unidades(){return this.items.reduce((s,r)=>s+r.cantidad,0);}imprimir(){window.print();}
}
