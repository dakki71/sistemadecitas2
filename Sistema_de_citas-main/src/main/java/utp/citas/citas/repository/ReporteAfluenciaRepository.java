package utp.citas.citas.repository;

import utp.citas.citas.model.ReporteAfluencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReporteAfluenciaRepository extends JpaRepository<ReporteAfluencia, String> {
    // Revisa que tenga la palabra 'extends JpaRepository' para que active el .findAll()
}