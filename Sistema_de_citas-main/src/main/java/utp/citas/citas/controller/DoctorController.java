package utp.citas.citas.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utp.citas.citas.model.Doctor;
import utp.citas.citas.model.Horario;
import utp.citas.citas.service.DoctorService;

import java.util.List;

@RestController
@RequestMapping("/api/doctores")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // GET /api/doctores → todos
    @GetMapping
    public ResponseEntity<List<Doctor>> listarTodos() {
        return ResponseEntity.ok(doctorService.listarTodos());
    }

    // GET /api/doctores/activos → solo activos
    @GetMapping("/activos")
    public ResponseEntity<List<Doctor>> listarActivos() {
        return ResponseEntity.ok(doctorService.listarActivos());
    }

    // GET /api/doctores/especialidad/{idEspecialidad}
    @GetMapping("/especialidad/{idEspecialidad}")
    public ResponseEntity<List<Doctor>> listarPorEspecialidad(
            @PathVariable Integer idEspecialidad) {
        return ResponseEntity.ok(doctorService.listarActivosPorEspecialidad(idEspecialidad));
    }

    // GET /api/doctores/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(doctorService.buscarPorId(id));
    }

    // GET /api/doctores/{id}/horarios → horarios activos del doctor
    @GetMapping("/{id}/horarios")
    public ResponseEntity<List<Horario>> obtenerHorarios(@PathVariable Integer id) {
        return ResponseEntity.ok(doctorService.obtenerHorarios(id));
    }

    // GET /api/doctores/{id}/horarios/{dia}
    @GetMapping("/{id}/horarios/{dia}")
    public ResponseEntity<List<Horario>> obtenerHorariosPorDia(
            @PathVariable Integer id,
            @PathVariable String dia) {
        return ResponseEntity.ok(doctorService.obtenerHorariosPorDia(id, dia));
    }

    // POST /api/doctores
    @PostMapping
    public ResponseEntity<Doctor> crear(@Valid @RequestBody Doctor doctor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.crear(doctor));
    }

    // PUT /api/doctores/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> actualizar(@PathVariable Integer id,
                                             @Valid @RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.actualizar(id, doctor));
    }

    // DELETE /api/doctores/{id} → baja lógica
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        doctorService.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
