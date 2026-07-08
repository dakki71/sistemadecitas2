package utp.citas.citas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import utp.citas.citas.model.Cita;
import utp.citas.citas.model.DoctorCitasDTO;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {

    List<Cita> findByPaciente_IdPaciente(Integer idPaciente);

    List<Cita> findByDoctor_IdDoctorAndFechaCita(Integer idDoctor, LocalDate fechaCita);

    List<Cita> findByEstado(String estado);

    boolean existsByDoctor_IdDoctorAndFechaCitaAndHoraCitaAndEstadoNot(
            Integer idDoctor, LocalDate fechaCita, java.time.LocalTime horaCita, String estado
    );

    @Query(value = """
    SELECT * FROM (
        SELECT 
            e.nombre AS especialidad,
            d.id_doctor,
            d.nombres,
            d.apellidos,
            COUNT(DISTINCT c.id_cita) AS total_citas,
            SUM(pa.monto) AS ingresos,
            ROW_NUMBER() OVER (
                PARTITION BY e.id_especialidad
                ORDER BY COUNT(DISTINCT c.id_cita) DESC
            ) AS rn
        FROM especialidades e
        JOIN doctores d ON d.id_especialidad = e.id_especialidad
        JOIN citas c ON c.id_doctor = d.id_doctor
        JOIN pagos pa ON pa.id_cita = c.id_cita
        WHERE c.estado != 'CANCELADA'
          AND pa.estado_pago = 'COMPLETADO'
          AND (:idEspecialidad IS NULL OR e.id_especialidad = :idEspecialidad)
          AND (:estado IS NULL OR c.estado = :estado)
        GROUP BY e.id_especialidad, e.nombre, d.id_doctor, d.nombres, d.apellidos
    ) t
    WHERE rn = 1
    ORDER BY ingresos DESC
""", nativeQuery = true)
    List<Object[]> estadisticasDoctoresCitas(
            @Param("idEspecialidad") Integer idEspecialidad,
            @Param("estado") String estado
    );

}