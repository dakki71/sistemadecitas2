package utp.citas.citas.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import utp.citas.citas.model.DoctorCitasDTO;
import utp.citas.citas.repository.CitaRepository;
import utp.citas.citas.service.impl.ReporteService;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    private final ReporteService reporteService;
    private final CitaRepository citaRepository;

    public ReporteController(ReporteService reporteService, CitaRepository citaRepository) {
        this.reporteService  = reporteService;
        this.citaRepository  = citaRepository;
    }

    @GetMapping("/doctores/pdf")
    public ResponseEntity<byte[]> descargarDirectorioDoctores() {
        try {
            byte[] pdfBytes = reporteService.generarDirectorioDoctoresPDF();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Directorio_Doctores.pdf");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/citas/{idCita}/pdf")
    public ResponseEntity<byte[]> descargarReporteCita(@PathVariable Integer idCita) {
        try {
            byte[] pdfBytes = reporteService.generarReporteCitaPDF(idCita);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Comprobante_Cita_" + idCita + ".pdf");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/especialidades/pdf")
    public ResponseEntity<byte[]> descargarReporteEspecialidades() {
        try {
            byte[] pdfBytes = reporteService.generarReporteEspecialidadesPDF();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Reporte_Especialidades.pdf");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/estadisticas/doctores-citas")
    public ResponseEntity<List<DoctorCitasDTO>> estadisticasDoctoresCitas(
            @RequestParam(required = false) Integer idEspecialidad,
            @RequestParam(required = false) String estado) {
        List<Object[]> rows = citaRepository.estadisticasDoctoresCitas(
                idEspecialidad,
                (estado == null || estado.isBlank()) ? null : estado
        );
        List<DoctorCitasDTO> result = rows.stream()
                .map(r -> new DoctorCitasDTO(
                        (String) r[0],
                        (String) r[2],
                        (String) r[3],
                        ((Number) r[4]).longValue(),
                        (java.math.BigDecimal) r[5]
                ))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }
}