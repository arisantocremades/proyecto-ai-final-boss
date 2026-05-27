# AbsenceHub

> Gestiona las ausencias de tu equipo sin fricciones — desde la solicitud hasta la aprobación, todo en un mismo lugar.

---

## El problema que resolvemos

Gestionar las ausencias del equipo con hojas de cálculo, correos electrónicos o procesos manuales es lento, propenso a errores y escala mal. Los empleados no saben cuántos días de vacaciones les quedan, los managers pierden tiempo localizando solicitudes pendientes, y los responsables de RRHH no tienen visibilidad real del estado del equipo en cada momento.

Cuando un manager aprueba una ausencia sin saber que otra persona ya está de vacaciones esa semana, el equipo queda descubierto. Cuando un empleado solicita días sin saber que ya los ha consumido, la conversación incómoda llega después. Estos pequeños fallos de información se acumulan y generan fricción innecesaria en el día a día.

---

## La solución

AbsenceHub centraliza todo el ciclo de vida de las ausencias en una aplicación web clara y accesible para cualquier rol. Los empleados solicitan sus ausencias en segundos, los managers las revisan desde su panel y aprueban o rechazan con un clic, y los administradores tienen control total sobre la estructura del equipo.

Todos saben siempre cuántos días tienen disponibles, qué solicitudes están pendientes de revisión y quién estará fuera en las próximas semanas. Sin correos, sin hojas de cálculo, sin ambigüedad.

---

## A quién va dirigido

- **Empleados:** Acceden a sus solicitudes de ausencia, consultan sus días disponibles y ven el calendario de presencia del equipo sin depender de nadie.
- **Managers:** Revisan y gestionan las solicitudes de su equipo en un único panel, con toda la información necesaria para tomar decisiones informadas.
- **Responsables de RRHH / Administradores:** Tienen visibilidad completa de la organización, gestionan los equipos y sus miembros, y generan informes para auditorías o planificación.

---

## Qué puedes hacer con AbsenceHub

### Como empleado

- **Solicitar cualquier tipo de ausencia** — vacaciones, baja médica, asuntos personales u otras. El formulario calcula automáticamente los días hábiles que se consumirán.
- **Consultar tus días disponibles** — en todo momento, sin tener que preguntar a nadie.
- **Ver el estado de tus solicitudes** — si están pendientes, aprobadas o rechazadas, con el comentario del manager en caso de rechazo.
- **Ver el calendario del equipo** — saber quién estará fuera antes de planificar tus propias fechas.

### Como manager

- **Revisar todas las solicitudes pendientes de tu equipo** — en un panel dedicado, con la información completa de cada solicitud.
- **Aprobar o rechazar con un clic** — el rechazo requiere un comentario para que el empleado entienda el motivo.
- **Ver el calendario de presencia** — anticipar situaciones de equipo descubierto antes de aprobar nuevas ausencias.
- **Generar y descargar informes** — filtra por fechas, tipo de ausencia o estado y exporta en PDF o Excel para tus reuniones o informes de RRHH.

### Como administrador

- **Crear y gestionar equipos** — define la estructura organizativa, asigna managers y añade o elimina miembros.
- **Gestionar usuarios** — crea cuentas, cambia roles y mantiene el directorio actualizado.
- **Acceso total a los informes** — visibilidad completa de todas las ausencias de la organización con filtros avanzados.

---

## Cómo funciona

1. **Accede con tu cuenta** — introduce tu email y contraseña. Tu sesión se mantiene activa de forma segura.
2. **Ve a tu panel principal** — verás tus días disponibles, tus solicitudes recientes y las ausencias próximas de tu equipo.
3. **Solicita una ausencia** — elige el tipo, las fechas y el motivo. La aplicación te indica cuántos días hábiles consume y te avisa si hay un problema antes de enviar.
4. **El manager recibe la solicitud en su panel** — la revisa, la aprueba o la rechaza con un comentario.
5. **Recibes la notificación** — la solicitud actualiza su estado y puedes ver la respuesta directamente en tus solicitudes.

---

## Seguro y confiable

- Cada usuario accede únicamente a lo que le corresponde según su rol — los empleados solo ven sus propias solicitudes, los managers solo gestionan su equipo.
- Las credenciales nunca viajan en texto plano — el acceso usa tokens de sesión seguros con caducidad automática.
- Solo el manager del equipo puede aprobar o rechazar las solicitudes de sus miembros — no hay aprobaciones cruzadas accidentales.
- Los rechazos siempre incluyen un motivo obligatorio — sin ambigüedad para el empleado.
- El sistema impide solicitar ausencias en fechas que ya están ocupadas — sin solapamientos posibles.

---

## Estado del producto

**Disponible ahora:**
- Solicitud y seguimiento de ausencias (vacaciones, baja médica, personal, otras)
- Panel de revisión para managers (aprobar / rechazar con comentario)
- Calendario mensual de presencia del equipo con feriados españoles
- Gestión de equipos y usuarios para administradores
- Política de ausencias visible para todos los empleados
- Exportación de informes en PDF y Excel
- Interfaz disponible en español e inglés

**En desarrollo:**
- Notificaciones en tiempo real conectadas al backend
- Integración completa del frontend de gestión de equipos con la API
- Festivos configurables por empresa o comunidad autónoma

---

## Por qué AbsenceHub

- **Diseñado para equipos reales:** Las reglas de negocio (22 días de vacaciones, solo el manager del equipo puede aprobar, rechazo con comentario obligatorio) no son configurables al azar — están basadas en la normativa laboral y en cómo trabajan los equipos de verdad.
- **Cero dependencia de herramientas externas:** No necesita conectarse a ningún servicio de terceros. Funciona de forma autónoma desde el primer día.
- **Dos idiomas desde el primer momento:** La interfaz está completamente traducida al español y al inglés, sin necesidad de configuración adicional.
- **Exportación lista para usar:** Los informes en PDF incluyen cabecera corporativa, tabla formateada y paginación. Los Excel son compatibles con cualquier hoja de cálculo estándar.

---

## Empieza hoy

```bash
# Backend
cd absencehub-api
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend (en otra terminal)
cd AbsenceHub
npm install && npm start
```

Accede en `http://localhost:4200` con cualquiera de las cuentas de prueba incluidas.

---

*¿Preguntas? Consulta la documentación técnica en `docs/DOCUMENTACION-TECNICA.md` o revisa el repositorio del proyecto.*
