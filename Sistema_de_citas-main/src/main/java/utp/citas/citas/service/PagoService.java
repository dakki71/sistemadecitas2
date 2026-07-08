package utp.citas.citas.service;

import utp.citas.citas.model.Pago;

import java.util.List;

public interface PagoService {

    Pago registrarPago(Pago pago);

    Pago buscarPorId(Integer id);

    Pago buscarPorCita(Integer idCita);

    List<Pago> listarPorPaciente(Integer idPaciente);

    List<Pago> listarPorEstado(String estadoPago);

    /**
     * Actualiza el estado de un pago existente y,
     * si pasa a 'COMPLETADO', confirma la cita.
     */
    Pago actualizarEstado(Integer idPago, String nuevoEstado);
}
