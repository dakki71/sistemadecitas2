package utp.citas.citas.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utp.citas.citas.model.Pago;
import utp.citas.citas.service.PagoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping
    public ResponseEntity<Pago> registrarPago(@Valid @RequestBody Pago pago) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.registrarPago(pago));
    }

    // GET /api/pagos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Pago> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(pagoService.buscarPorId(id));
    }

    // GET /api/pagos/cita/{idCita} → obtener el pago de una cita específica
    @GetMapping("/cita/{idCita}")
    public ResponseEntity<Pago> buscarPorCita(@PathVariable Integer idCita) {
        return ResponseEntity.ok(pagoService.buscarPorCita(idCita));
    }

    // GET /api/pagos/paciente/{idPaciente} → historial de pagos de un paciente
    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<List<Pago>> listarPorPaciente(@PathVariable Integer idPaciente) {
        return ResponseEntity.ok(pagoService.listarPorPaciente(idPaciente));
    }

    // GET /api/pagos/estado/{estadoPago} → ej: /api/pagos/estado/COMPLETADO
    @GetMapping("/estado/{estadoPago}")
    public ResponseEntity<List<Pago>> listarPorEstado(@PathVariable String estadoPago) {
        return ResponseEntity.ok(pagoService.listarPorEstado(estadoPago));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pago> actualizarEstado(@PathVariable Integer id,
                                                 @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(pagoService.actualizarEstado(id, nuevoEstado));
    }
}
