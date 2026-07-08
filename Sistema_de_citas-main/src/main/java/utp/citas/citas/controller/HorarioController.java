package utp.citas.citas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utp.citas.citas.model.Horario;
import utp.citas.citas.repository.HorarioRepository;
import utp.citas.citas.service.DoctorService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/horarios")
@CrossOrigin(origins = "*")
public class HorarioController {

    private final HorarioRepository horarioRepository;
    private final DoctorService doctorService;

    public HorarioController(HorarioRepository horarioRepository, DoctorService doctorService) {
        this.horarioRepository = horarioRepository;
        this.doctorService = doctorService;
    }

    @GetMapping
    public ResponseEntity<List<Horario>> listarTodos() {
        return ResponseEntity.ok(horarioRepository.findAllActivos());
    }

    @GetMapping("/doctor/{idDoctor}")
    public ResponseEntity<List<Horario>> porDoctor(@PathVariable Integer idDoctor) {
        return ResponseEntity.ok(horarioRepository.findActivosByDoctor(idDoctor));
    }

    @PostMapping
    public ResponseEntity<?> asignarHorario(@RequestBody Map<String, Object> payload) {
        doctorService.registrarHorariosMultiplesRaw(payload);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHorario(@PathVariable Integer id) {
        horarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}