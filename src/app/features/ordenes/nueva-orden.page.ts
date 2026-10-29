import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Cliente, Servicio, Vehiculo } from '../../core/models/api.models';
import { ClientesApi, OrdenesApi, ServiciosApi, VehiculosApi } from '../../core/services/api.services';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './nueva-orden.page.html'
})
export class NuevaOrdenPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientesApi = inject(ClientesApi);
  private readonly vehiculosApi = inject(VehiculosApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly api = inject(OrdenesApi);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  vehiculos: Vehiculo[] = [];
  servicios: Servicio[] = [];
  loading = true;
  error = '';
  fieldErrors: Record<string, string> = {};
  saving = false;

  readonly form = this.fb.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    vehiculoId: [0, [Validators.required, Validators.min(1)]],
    kilometraje: [0, [Validators.required, Validators.min(0)]],
    detalles: this.fb.array([this.linea()], [Validators.required])
  });

  get detalles(): FormArray {
    return this.form.controls.detalles as FormArray;
  }

  private linea() {
    return this.fb.nonNullable.group({
      servicioId: [0, [Validators.required, Validators.min(1)]],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.clientesApi.listar().subscribe({
      next: clientes => {
        this.clientes = clientes;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.error = this.message(error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
    this.vehiculosApi.listar().subscribe({
      next: vehiculos => {
        this.vehiculos = vehiculos;
        this.cdr.markForCheck();
      },
      error: error => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      }
    });
    this.serviciosApi.listar().subscribe({
      next: servicios => {
        this.servicios = servicios.filter(servicio => servicio.activo);
        this.cdr.markForCheck();
      },
      error: error => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      }
    });
  }

  get vehiculosFiltrados(): Vehiculo[] {
    const clienteId = Number(this.form.controls.clienteId.value);
    return this.vehiculos.filter(vehiculo => !clienteId || vehiculo.clienteId === clienteId);
  }

  get totalEstimado(): number {
    return this.detalles.controls.reduce((total, control) => {
      const servicioId = Number(control.get('servicioId')?.value);
      const cantidad = Number(control.get('cantidad')?.value) || 0;
      return total + (this.servicios.find(servicio => servicio.id === servicioId)?.precio || 0) * cantidad;
    }, 0);
  }

  clienteCambio(): void {
    this.form.controls.vehiculoId.setValue(0);
    this.clearFieldError('vehiculoId');
  }

  agregar(): void {
    if (this.detalles.length < 10) this.detalles.push(this.linea());
  }

  quitar(index: number): void {
    if (this.detalles.length > 1) this.detalles.removeAt(index);
  }

  fieldError(field: string): string {
    return this.fieldErrors[field] ?? '';
  }

  detalleError(index: number, field: string): string {
    return this.fieldErrors[`detalles[${index}].${field}`] ?? '';
  }

  clearFieldError(field: string): void {
    delete this.fieldErrors[field];
  }

  clearDetalleError(index: number, field: string): void {
    delete this.fieldErrors[`detalles[${index}].${field}`];
    delete this.fieldErrors['detalles'];
  }

  guardar(): void {
    this.error = '';
    this.fieldErrors = {};
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const serviceIds = raw.detalles.map(detalle => Number(detalle.servicioId));
    if (new Set(serviceIds).size !== serviceIds.length) {
      this.error = 'No repitas el mismo servicio en el detalle.';
      return;
    }

    this.saving = true;
    this.api.crear({
      vehiculoId: Number(raw.vehiculoId),
      kilometraje: Number(raw.kilometraje),
      detalles: raw.detalles.map(detalle => ({
        servicioId: Number(detalle.servicioId),
        cantidad: Number(detalle.cantidad)
      }))
    }).subscribe({
      next: orden => {
        this.saving = false;
        this.cdr.markForCheck();
        this.router.navigate(['/ordenes'], { queryParams: { creada: orden.numero } });
      },
      error: error => {
        this.saving = false;
        const response = error as HttpErrorResponse;
        const fields = response.error?.campos as Record<string, string> | null | undefined;
        this.fieldErrors = fields ?? {};
        this.error = Object.keys(this.fieldErrors).length ? '' : this.message(error);
        this.cdr.markForCheck();
      }
    });
  }

  private message(error: unknown): string {
    const response = error as HttpErrorResponse;
    return (response.error?.mensaje as string) || 'No se pudo registrar la orden.';
  }
}
