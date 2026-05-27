# AbsenceHub 🗓️

> HR Vacation & Absence Management Dashboard — Angular final internship project

## 👥 Participants

- Ariadna Santo Cremades
- Gor Ghazaryan
- Jose Ramón Castillo

---

## 🚀 Arranque del proyecto

### Backend (Spring Boot)

Abre una terminal en la carpeta `absencehub-api` y ejecuta:

```bash
cd absencehub-api
$env:PATH += ";C:\ruta\a\tu\maven\bin"
$env:JAVA_HOME = "C:\ruta\a\tu\java21"
mvn spring-boot:run '-Dspring-boot.run.profiles=dev'
```

> **Nota:** Las rutas de Maven y Java varían según el ordenador. Sustitúyelas por las tuyas:
>
> **Maven** — ejemplos:
> - `C:\desarrollo\maven\apache-maven-3.9.16\bin`
> - `C:\Program Files\Maven\apache-maven-3.9.x\bin`
>
> **Java 21 (JAVA_HOME)** — ejemplos:
> - `C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`
> - `C:\Program Files\Java\jdk-21`
>
> ⚠️ Es importante usar **Java 21**. Si Maven coge una versión superior (Java 22+) fallará al compilar.
> Si tienes Maven y Java 21 ya configurados en las variables de entorno del sistema, puedes omitir las dos primeras líneas.

Cuando veas `Started AbsenceHubApplication in X seconds` el backend está listo en `http://localhost:8080`.

| Recurso     | URL                                   |
|-------------|---------------------------------------|
| API base    | http://localhost:8080/api/v1          |
| Swagger UI  | http://localhost:8080/swagger-ui.html |
| Consola H2  | http://localhost:8080/h2-console      |

---

### Frontend (Angular)

Abre una **segunda terminal** y ejecuta:

```bash
cd AbsenceHub
npm install
npm start
```

Cuando veas `Local: http://localhost:4200/` abre el navegador en esa URL.

---

## 🔑 Credenciales de prueba

| Rol      | Email                   | Contraseña  |
|----------|-------------------------|-------------|
| Manager  | manager@absencehub.com  | manager123  |
| Empleado | empleado@absencehub.com | empleado123 |
| Admin    | admin@absencehub.com    | admin123    |

---

— Final Internship Project 2026