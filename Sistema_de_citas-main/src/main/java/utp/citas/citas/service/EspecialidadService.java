package utp.citas.citas.service;

import utp.citas.citas.model.Especialidad;

import java.util.List;

public interface EspecialidadService {

    List<Especialidad> listarTodas();

    List<Especialidad> listarActivas();

    Especialidad buscarPorId(Integer id);

    Especialidad crear(Especialidad especialidad);

    Especialidad actualizar(Integer id, Especialidad especialidad);

    void desactivar(Integer id);
    void activar(Integer id);
}
