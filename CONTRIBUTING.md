# Guía de Contribución

## Convenciones

- **Código:** Variables y funciones en **inglés**
- **Documentación y commits:** En **español**

## Flujo de Trabajo

1. Crea un **issue** con tag `tasks` para la tarea a realizar
2. Crea una **rama** desde `dev`:

```bash
   git checkout dev
   git checkout -b feature/nombre-tarea
```

3. Realiza tus cambios y haz **commit**:

```bash
   git commit -m "feat: descripción breve"
```

4. Abre un **Pull Request** hacia `dev`

## Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Corrección
- `docs`: Documentación
- `refactor`: Refactorización
- `chore`: Mantenimiento

## Branches

- `main` - Producción
- `dev` - Desarrollo (base para PRs)
- `feature/*` - Nuevas funcionalidades
- `fix/*` - Correcciones
