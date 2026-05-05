Aquí tienes el documento listo en formato Markdown para integrarlo en tu proyecto:

---

```md
# PROMPT2GIT_SAAS_STRATEGY.md

## 🎯 Objetivo

Evolucionar Prompt2Git de una herramienta de traducción (input → comando) a un **producto SaaS centrado en workflow real de desarrollo con Git**.

---

## 🚨 Problema actual

Actualmente el producto funciona como:

> "Describe algo → recibe comando"

Esto es útil, pero:
- Es fácilmente replicable
- No genera uso recurrente fuerte
- No es suficiente para justificar pago

---

## 🔄 Cambio de enfoque

Pasar de:

> Herramienta pasiva

a:

> Asistente activo que entiende el contexto del repositorio y ejecuta acciones

---

## 🔥 Features clave (prioridad alta)

### 1. 🧠 Contexto del repositorio

Integración con GitHub (OAuth ya implementado en auth).

Detectar automáticamente:
- Rama actual
- Cambios staged / unstaged
- Archivos modificados
- Estado del repositorio
- Último commit

#### Ejemplo

Input:
```

sube mis cambios

````

Output esperado:
```bash
git add .
git commit -m "feat: update X files"
git push origin feature-branch
````

---

### 2. ⚡ Ejecución de comandos

#### Web:

* Botón copiar (actual ✔)

#### VS Code Extension:

* Ejecutar comando directamente en terminal
* Preview antes de ejecutar

---

### 3. 🧠 Cache semántico (core feature)

Evitar llamadas innecesarias a la IA.

#### Cambios en DB

Agregar columna:

```sql
embedding vector(1536)
```

#### Flujo

```ts
normalize(input)
→ buscar similitud
→ if similarity > threshold:
     return cached
→ else:
     call AI
     guardar resultado + embedding
```

---

### 4. 📚 Memory Layer

No solo historial, sino comportamiento inteligente.

#### Features:

* Detectar comandos frecuentes
* Sugerencias automáticas
* Acciones rápidas

#### Ejemplo:

Usuario frecuentemente hace:

* add → commit → push

Mostrar:

```
Quick Action: Push cambios
```

---

### 5. 🧩 VS Code Extension (canal principal)

La web app es secundaria.

#### Objetivo:

Integrarse en el flujo real del desarrollador.

#### Features clave:

* Command Palette:

```
Prompt2Git: Describe action
```

* Context awareness del repo
* Ejecución directa en terminal

---

## 💰 Modelo de negocio

### Freemium + BYOK

#### Free:

* Límite de queries por día
* Sin cache semántico

#### Pro ($6–10 USD):

* Cache inteligente
* Historial completo
* Multi-provider
* Contexto GitHub

---

## ⚙️ Backend pipeline

Actualizar `/api/generate`:

```ts
1. normalize input
2. generar embedding
3. buscar en cache
4. if hit → return
5. else:
   - llamar provider
   - guardar resultado + embedding
   - return
```

---

## 🔐 Seguridad

Actual:

* RLS ✔
* Supabase Vault ✔

Agregar:

* Rate limiting por usuario
* Protección contra abuso de API keys

---

## 🧭 Roadmap sugerido

### Semana 1

* Implementar embeddings + cache semántico

### Semana 2

* Integración GitHub (read-only)

### Semana 3

* VS Code extension con ejecución de comandos

### Semana 4

* Memory layer + quick actions

---

## 💡 Feature diferencial

### 🧨 "Fix my repo"

Input:

```
rompí mi repo
```

Sistema:

* Analiza estado
* Sugiere soluciones:

  * git reset
  * git stash
  * git rebase fix

---

## 🧠 Posicionamiento

No vender “IA”.

Vender:

> "El copiloto de Git que aprende de ti y evita desperdiciar tiempo y tokens"

---

## ✅ Resumen

### Fortalezas actuales

* Arquitectura sólida
* BYOK (costos controlados)
* Seguridad bien implementada

### Falta para SaaS real

* Context awareness
* Ejecución de comandos
* Inteligencia basada en uso (memory)

---

```

---

Si quieres después puedo ayudarte a crear otro `.md` más técnico con:
- esquema de tablas con `pgvector`
- queries SQL reales de similitud
- o arquitectura de la extensión VS Code lista para implementar
```
