import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Cliente, OrdenResumen, Servicio, Vehiculo } from '../../core/models/api.models';
import { ClientesApi, OrdenesApi, ServiciosApi, VehiculosApi } from '../../core/services/api.services';

type Result = { count: number; available: boolean };

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly vehiculosApi = inject(VehiculosApi);
  private readonly clientesApi = inject(ClientesApi);
  private readonly ordenesApi = inject(OrdenesApi);

  loading = true;
  error = '';
  counts: Record<string, Result> = {
    servicios: { count: 0, available: false },
    vehiculos: { count: 0, available: false },
    clientes: { count: 0, available: false },
    ordenes: { count: 0, available: false },
  };

  ngOnInit(): void {
    forkJoin({
      servicios: this.count(this.serviciosApi.listar()),
      vehiculos: this.count(this.vehiculosApi.listar()),
      clientes: this.count(this.clientesApi.listar()),
      ordenes: this.count(this.ordenesApi.buscar({})),
    }).subscribe((counts) => {
      this.counts = counts;
      this.loading = false;
      if (Object.values(counts).some((result) => !result.available)) {
        this.error = 'No se pudieron cargar algunos totales. Revisa la conexión con AutoAndes API.';
      }
      this.cdr.markForCheck();
    });
  }

  private count<T>(request: Observable<T[]>): import('rxjs').Observable<Result> {
    return request.pipe(
      map((items) => ({ count: items.length, available: true })),
      catchError(() => of({ count: 0, available: false })),
    );
  }
}
