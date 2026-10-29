import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Cliente, Vehiculo, VehiculoRequest } from '../../core/models/api.models';
import { ClientesApi, VehiculosApi } from '../../core/services/api.services';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vehiculos.page.html'
})
export class VehiculosPage implements OnInit {
  private readonly api = inject(VehiculosApi);
  private readonly clientesApi = inject(ClientesApi);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  items: Vehiculo[] = [];
  clientes: Cliente[] = [];
  loading = true;
  error = '';
  success = '';
  fieldErrors: Record<string, string> = {};
  editing: Vehiculo | null = null;
  formRoute = false;
  editingRoute = false;
  clienteFilter = '';

  readonly form = this.fb.nonNullable.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-[0-9]{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [2020, [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clientesApi.listar().subscribe({
      next: clientes => {
        this.clientes = clientes;
        this.cdr.markForCheck();
      },
      error: error => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      }
    });

    if (id > 0) {
      this.formRoute = true;
      this.editingRoute = true;
      this.loadForEditing(id);
      return;
    }

    if (this.route.snapshot.routeConfig?.path === 'vehiculos/nuevo') {
      this.formRoute = true;
      this.loading = false;
      this.nuevo();
      return;
    }

    this.load();
    if (this.auth.hasPermission('VEHICULO_ESCRIBIR') && this.route.snapshot.queryParamMap.get('nuevo') === '1') {
      this.nuevo();
    }
    if (this.route.snapshot.queryParamMap.get('actualizado') === '1') {
      this.success = 'Vehículo actualizado.';
    }
    if (this.route.snapshot.queryParamMap.get('creado') === '1') {
      this.success = 'Vehículo registrado.';
    }
  }

  load(): void {
    this.loading = true;
    this.api.listar(this.clienteFilter ? Number(this.clienteFilter) : undefined).subscribe({
      next: items => {
        this.items = items;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.error = this.message(error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  nuevo(): void {
    this.editing = null;
    this.form.reset({ placa: '', marca: '', modelo: '', anio: 2020, clienteId: 0 });
    this.error = '';
    this.fieldErrors = {};
  }

  irANuevo(): void {
    this.router.navigate(['/vehiculos/nuevo']);
  }

  editar(vehiculo: Vehiculo): void {
    this.router.navigate(['/vehiculos', vehiculo.id, 'editar']);
  }

  cancelar(): void {
    this.router.navigate(['/vehiculos']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.fieldErrors = {};
    const data = this.form.getRawValue() as VehiculoRequest;
    const request = this.editing
      ? this.api.actualizar(this.editing.id, data)
      : this.api.crear(data);

    request.subscribe({
      next: () => {
        this.router.navigate(['/vehiculos'], {
          queryParams: { [this.editingRoute ? 'actualizado' : 'creado']: 1 }
        });
      },
      error: error => {
        this.applyBackendErrors(error);
        this.cdr.markForCheck();
      }
    });
  }

  eliminar(vehiculo: Vehiculo): void {
    if (!confirm(`¿Eliminar el vehículo ${vehiculo.placa}?`)) return;

    this.api.eliminar(vehiculo.id).subscribe({
      next: () => {
        this.success = 'Vehículo eliminado.';
        this.cdr.markForCheck();
        this.load();
      },
      error: error => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      }
    });
  }

  private loadForEditing(id: number): void {
    this.api.listar().subscribe({
      next: items => {
        this.items = items;
        const vehiculo = items.find(item => item.id === id);
        if (!vehiculo) {
          this.error = 'No se encontró el vehículo solicitado.';
        } else {
          this.editing = vehiculo;
          this.form.reset({
            placa: vehiculo.placa,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            anio: vehiculo.anio,
            clienteId: vehiculo.clienteId
          });
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.error = this.message(error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private message(error: unknown): string {
    const response = error as HttpErrorResponse;
    return (response.error?.mensaje as string) || 'No se pudo completar la operación. Verifica AutoAndes API.';
  }

  private applyBackendErrors(error: unknown): void {
    const response = error as HttpErrorResponse;
    const fields = response.error?.campos as Record<string, string> | null | undefined;
    this.fieldErrors = fields ?? {};
    this.error = Object.keys(this.fieldErrors).length ? '' : this.message(error);
  }

  clearFieldError(field: string): void {
    delete this.fieldErrors[field];
  }
}
