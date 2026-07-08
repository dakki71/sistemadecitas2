package utp.citas.citas.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utp.citas.citas.model.Paciente;
import utp.citas.citas.service.PacienteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping
    public List<Paciente> listar() {
        return pacienteService.listarTodos();
    }

    @PostMapping("/registrar")
    public ResponseEntity<Paciente> registrar(@Valid @RequestBody Paciente paciente) {
        return ResponseEntity.ok(pacienteService.registrar(paciente));
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        try {
            String correo = credenciales.get("correo");
            String password = credenciales.get("password");
            Paciente paciente = pacienteService.login(correo, password);
            return ResponseEntity.ok(paciente);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}