import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Servicio, ServicioRequest } from '../../core/models/api.models';
import { ServiciosApi } from '../../core/services/api.services';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './servicios.page.html'
})
export class ServiciosPage implements OnInit {
  private readonly api = inject(ServiciosApi);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  items: Servicio[] = [];
  loading = true;
  error = '';
  success = '';
  fieldErrors: Record<string, string> = {};
  search = '';
  editing: Servicio | null = null;
  formRoute = false;
  editingRoute = false;

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-[0-9]{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    duracionMin: [15, [Validators.required, Validators.min(15), Validators.max(480)]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.formRoute = true;
      this.editingRoute = true;
      this.loadForEditing(id);
      return;
    }

    if (this.route.snapshot.routeConfig?.path === 'servicios/nuevo') {
      this.formRoute = true;
      this.loading = false;
      this.nuevo();
      return;
    }

    this.load();
    if (this.auth.hasPermission('SERVICIO_ESCRIBIR') && this.route.snapshot.queryParamMap.get('nuevo') === '1') {
      this.nuevo();
    }
    if (this.route.snapshot.queryParamMap.get('actualizado') === '1') {
      this.success = 'Servicio actualizado.';
    }
    if (this.route.snapshot.queryParamMap.get('creado') === '1') {
      this.success = 'Servicio registrado.';
    }
  }

  get filtered(): Servicio[] {
    const q = this.search.trim().toLowerCase();
    return this.items.filter(item => !q || `${item.codigo} ${item.nombre}`.toLowerCase().includes(q));
  }

  load(): void {
    this.loading = true;
    this.api.listar().subscribe({
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
    this.form.reset({ codigo: '', nombre: '', precio: 0, duracionMin: 15 });
    this.error = '';
    this.success = '';
    this.fieldErrors = {};
  }

  irANuevo(): void {
    this.router.navigate(['/servicios/nuevo']);
  }

  editar(servicio: Servicio): void {
    this.router.navigate(['/servicios', servicio.id, 'editar']);
  }

  cancelar(): void {
    this.router.navigate(['/servicios']);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.success = '';
    this.fieldErrors = {};
    const data = this.form.getRawValue() as ServicioRequest;
    const request = this.editing
      ? this.api.actualizar(this.editing.id, data)
      : this.api.crear(data);

    request.subscribe({
      next: () => {
        this.router.navigate(['/servicios'], {
          queryParams: { [this.editingRoute ? 'actualizado' : 'creado']: 1 }
        });
      },
      error: error => {
        this.applyBackendErrors(error);
        this.cdr.markForCheck();
      }
    });
  }

  cambiar(servicio: Servicio): void {
    const action = servicio.activo ? 'dar de baja' : 'activar';
    if (!confirm(`¿Deseas ${action} el servicio ${servicio.codigo}?`)) return;

    this.error = '';
    this.api.estado(servicio.id, !servicio.activo).subscribe({
      next: () => {
        this.success = 'Estado actualizado.';
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
        const servicio = items.find(item => item.id === id);
        if (!servicio) {
          this.error = 'No se encontró el servicio solicitado.';
        } else {
          this.editing = servicio;
          this.form.reset({
            codigo: servicio.codigo,
            nombre: servicio.nombre,
            precio: servicio.precio,
            duracionMin: servicio.duracionMin
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
    return (response.error?.mensaje as string) || 'No se pudo completar la operación. Verifica que AutoAndes API esté disponible.';
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
