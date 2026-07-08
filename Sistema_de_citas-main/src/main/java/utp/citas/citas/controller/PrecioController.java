package utp.citas.citas.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utp.citas.citas.model.Precio;
import utp.citas.citas.repository.PrecioRepository;

import java.util.List;

@RestController
@RequestMapping("/api/precios")
@CrossOrigin(origins = "*")
public class PrecioController {

    private final PrecioRepository precioRepository;

    public PrecioController(PrecioRepository precioRepository) {
        this.precioRepository = precioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Precio>> listarTodos() {
        return ResponseEntity.ok(precioRepository.findAllActivos());
    }

    @GetMapping("/especialidad/{id}")
    public ResponseEntity<Precio> porEspecialidad(@PathVariable Integer id) {
        return precioRepository.findByEspecialidad(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Precio> crear(@RequestBody Precio precio) {
        return ResponseEntity.status(HttpStatus.CREATED).body(precioRepository.save(precio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Precio> actualizar(@PathVariable Integer id, @RequestBody Precio precio) {
        precio.setIdPrecio(id);
        return ResponseEntity.ok(precioRepository.save(precio));
    }
}