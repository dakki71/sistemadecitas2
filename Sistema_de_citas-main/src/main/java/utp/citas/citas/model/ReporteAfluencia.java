package utp.citas.citas.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "vista_reporte_afluencia")
public class ReporteAfluencia {

    @Id
    @Column(name = "dia_semana")
    private String diaSemana;

    @Column(name = "turno")
    private String turno;

    @Column(name = "total_citas")
    private Long totalCitas;

    @Column(name = "total_canceladas")
    private Long totalCanceladas;

    @Column(name = "ingresos_turno")
    private java.math.BigDecimal ingresosTurno;

    // Constructor vacío obligatorio para JPA
    public ReporteAfluencia() {
    }

    // Getters y Setters
    public String getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(String diaSemana) {
        this.diaSemana = diaSemana;
    }

    public String getTurno() {
        return turno;
    }

    public void setTurno(String turno) {
        this.turno = turno;
    }

    public Long getTotalCitas() {
        return totalCitas;
    }

    public void setTotalCitas(Long totalCitas) {
        this.totalCitas = totalCitas;
    }

    public Long getTotalCanceladas() {
        return totalCanceladas;
    }

    public void setTotalCanceladas(Long totalCanceladas) {
        this.totalCanceladas = totalCanceladas;
    }

    public java.math.BigDecimal getIngresosTurno() {
        return ingresosTurno;
    }

    public void setIngresosTurno(java.math.BigDecimal ingresosTurno) {
        this.ingresosTurno = ingresosTurno;
    }
}