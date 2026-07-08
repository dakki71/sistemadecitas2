package utp.citas.citas.service;

import utp.citas.citas.model.Paciente;
import java.util.List;

public interface PacienteService {
    List<Paciente> listarTodos();
    Paciente buscarPorId(Integer id);
    Paciente registrar(Paciente paciente);
    Paciente actualizar(Integer id, Paciente paciente);
    void eliminar(Integer id);
    Paciente login(String correo, String password);
}