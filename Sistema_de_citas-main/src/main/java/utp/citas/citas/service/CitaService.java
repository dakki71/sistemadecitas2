package utp.citas.citas.service;

import utp.citas.citas.model.Cita;

import java.util.List;

public interface CitaService {
    List<Cita> obtenerPorPaciente(Integer idPaciente);

    void eliminarCita(Integer idCita);
}
