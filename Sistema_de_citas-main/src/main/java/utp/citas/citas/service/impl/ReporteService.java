package utp.citas.citas.service.impl;

import net.sf.jasperreports.engine.*;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;

import javax.sql.DataSource;
import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReporteService {

    private final DataSource dataSource;

    public ReporteService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public byte[] generarDirectorioDoctoresPDF() throws Exception {
        InputStream jrxmlInput = new ClassPathResource("reportes/reporte_doctores.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(jrxmlInput);

        InputStream logoInput = new ClassPathResource("static/imagenes/logomunicipalidad.png").getInputStream();

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("logo", logoInput);

        try (Connection conn = dataSource.getConnection()) {
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        }
    }

    public byte[] generarReporteCitaPDF(Integer idCita) throws Exception {
        InputStream jrxmlInput = new ClassPathResource("reportes/ReporteCita.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(jrxmlInput);

        InputStream logoInput = new ClassPathResource("static/imagenes/logomunicipalidad.png").getInputStream();

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("id_cita", idCita);
        parameters.put("logo", logoInput);

        try (Connection conn = dataSource.getConnection()) {
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        }
    }
    public byte[] generarReporteEspecialidadesPDF() throws Exception {
        InputStream jrxmlInput = new ClassPathResource("reportes/Reporte.jrxml").getInputStream();
        JasperReport jasperReport = JasperCompileManager.compileReport(jrxmlInput);

        InputStream logoInput = new ClassPathResource("static/imagenes/logomunicipalidad.png").getInputStream();

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("logo", logoInput);

        try (Connection conn = dataSource.getConnection()) {
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, conn);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        }
    }
}