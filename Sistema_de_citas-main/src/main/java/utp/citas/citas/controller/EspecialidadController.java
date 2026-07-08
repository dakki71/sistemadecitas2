package utp.citas.citas.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utp.citas.citas.model.Especialidad;
import utp.citas.citas.service.EspecialidadService;

import java.util.List;

@RestController
@RequestMapping("/api/especialidades")
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    public EspecialidadController(EspecialidadService especialidadService) {
        this.especialidadService = especialidadService;
    }

    // GET /api/especialidades → todas
    @GetMapping
    public ResponseEntity<List<Especialidad>> listarTodas() {
        return ResponseEntity.ok(especialidadService.listarTodas());
    }

    // GET /api/especialidades/activas → solo activas (para el selector del frontend)
    @GetMapping("/activas")
    public ResponseEntity<List<Especialidad>> listarActivas() {
        return ResponseEntity.ok(especialidadService.listarActivas());
    }

    // GET /api/especialidades/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Especialidad> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(especialidadService.buscarPorId(id));
    }

    // POST /api/especialidades
    @PostMapping
    public ResponseEntity<Especialidad> crear(@Valid @RequestBody Especialidad especialidad) {
        Especialidad nueva = especialidadService.crear(especialidad);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    // PUT /api/especialidades/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Especialidad> actualizar(@PathVariable Integer id,
                                                   @Valid @RequestBody Especialidad especialidad) {
        return ResponseEntity.ok(especialidadService.actualizar(id, especialidad));
    }

    // DELETE /api/especialidades/{id} → baja lógica (activo = false)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        especialidadService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}/activar")
    public ResponseEntity<Void> activar(@PathVariable Integer id) {
        especialidadService.activar(id);
        return ResponseEntity.noContent().build();
    }
}
