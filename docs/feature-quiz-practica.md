# Quiz de práctica — GitSpeak

## 1. Concepto general

Mini-ejercicios interactivos que desafían al usuario a **recordar, razonar y ejecutar** conceptos de Git. No es un tutorial pasivo — el usuario tiene que producir la respuesta.

Complementa al Modo Educativo:
| Modo Educativo | Quiz de práctica |
|---|---|
| Explica flags y params en el momento del comando | Evalúa retención después de aprender |
| Pasivo — consume mientras escribe | Activo — tiene que producir la respuesta |
| Contextual — aparece al tipear | Contextual — aparece al completar una acción |

---

## 2. Tipos de ejercicios (4 formatos)

### 2.1 Opción múltiple
```
¿Qué hace `git merge --squash`?
A) Fusiona commits aplanando el historial
B) Combina dos ramas con todos sus commits
C) Borra la rama fuente después del merge
```

- 3–4 opciones, una correcta
- Feedback inmediato con explicación breve
- Dificultad: básica (flags) / intermedia (conceptos) / avanzada (flujos)

### 2.2 Completar el comando
```
Comando: [        ]   (rellena el flag que falta)
``git log --[___]`` → muestra solo los merge commits
```
- Input libre con autocomplete limitado
- Múltiples respuestas válidas posibles (ej: `oneline`, `merges`, `graph`)
- Pista opcional tras 2 intentos fallidos

### 2.3 Ordenar secuencia
```
Ordená los pasos para hacer un squash de 3 commits en main:

[ ] git push --force
[ ] git rebase -i HEAD~3
[ ] git checkout main
[ ] git merge --ff-only
[ ] pick → squash en cada commit
```
- Drag & reorder (o click en orden)
- Validación al terminar
- Ideal para flujos de trabajo (rebase, hotfix, PR cycle)

### 2.4 Escenario / Debug
```
Situación: hiciste `git commit` pero el mensaje tiene un typo.
¿Qué comando usás para corregirlo sin crear un nuevo commit?

a) git commit --amend -m "mensaje correcto"
b) git reset HEAD~1
c) git commit --fixup
```
- Contexto realista ("estás en medio de un hotfix...")
- Evalúa comprensión, no memorización
- Puede tener branching (si eligió A, mostrar X; si B, mostrar Y)

---

## 3. Disparadores (cuándo aparece el quiz)

| Trigger | Momento | Formato sugerido |
|---|---|---|
| After command | 5–10s después de ejecutar un comando con éxito | Múltiple option sobre el flag usado |
| Session milestone | Al completar N comandos en una sesión | Secuencia / Escenario |
| Daily streak | Primera vez del día que abre la app | Completar el comando |
| Concept unlocked | Primera vez que usa un comando nuevo (rebase, bisect, etc.) | Múltiple option |
| Review mode | Botón "Practicar" explícito en la UI | Cualquier formato, modo ráfaga |

**Frecuencia:** máximo 1 quiz cada 3 comandos para no interrumpir el flow. El usuario puede ignorarlo / cerrarlo.

---

## 4. Experiencia (UX/UI)

### 4.1 Estados del quiz

| Estado | Qué se muestra |
|---|---|
| **Idle** | Nada — el quiz no aparece hasta que hay un trigger |
| **Available** | Notificación sutil: "¿Listo para un quiz rápido?" con preview de la pregunta |
| **Active** | Card/popover con la pregunta + opciones + progreso (ej: 3/10 de la sesión) |
| **Answered (correcto)** | Check verde + "✅ ¡Correcto!" + 1 frase de refuerzo |
| **Answered (incorrecto)** | "Casi — la respuesta correcta es X" + explicación de 1 línea |
| **Skipped** | Se pliega — no vuelve a preguntar ese concepto en la sesión |

### 4.2 Layout

- **Posición:** Popover / slide-in desde la esquina inferior derecha (no blocker)
- **Tamaño:** Compacto — no más de 300px de ancho. En móvil: bottom sheet.
- **Progreso:** Barra de progreso de la sesión de práctica (ej: "3/10 · 70% correcto")
- **Cierre:** "Ahora no" + "No mostrar más en esta sesión"

### 4.3 Micro-interacciones

- Las opciones incorrectas se "sacuden" ligeramente (shake) al fallar
- La correcta hace un subtle scale-up + check antes de pasar a la siguiente
- Sonido opcional (toggle) — pop al acertar

---

## 5. Feedback y refuerzo

### 5.1 Feedback inmediato (por respuesta)

| Acierto | Falla |
|---|---|
| "✅ ¡Correcto! `--squash` aplana los commits en uno solo." | "❌ La respuesta era A. `--squash` no combina ramas — aplana los commits de la rama feature en uno solo antes de fusionar." |

Tono friendly, no condescendiente. Nunca "wrong" o "incorrecto" — siempre "casi" o "la respuesta era".

### 5.2 Feedback diferido (fin de sesión / resumen semanal)

- "Esta semana completaste 12 quizzes con 83% de acierto"
- "Tu concepto más fuerte: merges y rebase"
- "Para repasar: `git bisect` (2/5 correctos)"
- Sugerencia: "Probá el comando `git worktree` — todavía no lo usaste"

---

## 6. Integración con el ecosistema actual

### 6.1 Pricing

```
Aprendizaje:
  Modo Educativo      Starter: 5/sem    Pro: ∞    Teams: ∞
  Quiz de práctica    Starter: ✗         Pro: ✓    Teams: ✓
  Repaso semanal      Starter: ✗         Pro: ✓    Teams: ✓
```

### 6.2 BYOK / modelos

- La generación de preguntas usa el mismo provider de IA configurado por el usuario
- Prompt especializado: "Generá una pregunta de opción múltiple sobre [concepto] para un desarrollador [nivel]. Incluí respuesta correcta y explicación de 1 línea."
- Si el usuario no tiene BYOK (Starter), no aplica — el quiz solo está en Pro+

### 6.3 Sesión de práctica (modo ráfaga)

Botón "Practicar" en la barra lateral → modo dedicado donde el usuario responde una ráfaga de 5–10 preguntas sin interrupción. Ideal para momentos de estudio activo.

---

## 7. Métricas para medir éxito

| Métrica | Qué mide |
|---|---|
| Tasa de inicio | % de quizzes que el usuario comienza vs. ignora |
| Tasa de acierto | % de respuestas correctas (target > 75%) |
| Retención semanal | Usuarios que vuelven a hacer quizzes en la semana |
| Correlación con comandos | ¿Usuarios que hacen quizzes usan más comandos avanzados? |
| Tasa de skip | ¿Hay un tipo de pregunta que todos skipean? → ajustar |

---

## 8. Roadmap de implementación

| Fase | Qué incluye |
|---|---|
| **V1 — Core** | Opción múltiple + completar comando. Trigger after-command. Feedback inmediato. Popover UI. |
| **V2 — Rich** | Secuencia (ordenar) + escenario. Modo ráfaga. Repaso semanal. Progreso persistente. |
| **V3 — Smart** | Preguntas generadas dinámicamente según el historial del usuario. Dificultad adaptativa (si acierta 3 seguidas, sube nivel). Review mode antes de dormir. |

---

## 9. Mock de flujo completo

```
1. Usuario ejecuta: git merge --squash feature/login
   → App muestra output + Modo Educativo explica --squash

2. 8 segundos después:
   [popover] "¿Sabías que...? Mini-quiz: ¿Qué hace --squash?"
            [👍 Claro que sí]  [Ahora no]

3. Usuario hace clic → aparece quiz:
   "¿Qué hace git merge --squash?"
   A) Fusiona commits aplanando el historial ←
   B) Combina dos ramas con todos sus commits
   C) Borra la rama fuente después del merge

4. Usuario selecciona A:
   [✅ ¡Correcto! --squash aplana los commits de la rama feature en uno solo antes de fusionar con main.]

5. Progreso: [■■■□□□□□□□] 3/10 · 100%
   "Querés seguir practicando?"
   [Siguiente →]  [Terminar por ahora]
```

---

## 10. Decisiones de diseño

### 10.1 ¿Popover flotante o panel lateral dedicado?

**Respuesta: Popover flotante para triggers automáticos, panel dedicado para modo ráfaga.**

- El quiz disparado por trigger (after-command, concept unlocked) aparece como **popover slide-in** desde la esquina inferior derecha. No bloquea la pantalla, el usuario puede seguir escribiendo.
- El **modo ráfaga** (botón "Practicar") abre un **panel lateral derecho** de 380px que coexiste con el área principal. En mobile: bottom sheet a 70% de la pantalla.
- Nunca modal centrado — GitSpeak es una herramienta de trabajo, no un examen.

### 10.2 ¿La sesión de práctica tiene pantalla completa o es embebida?

**Respuesta: Embebida en panel lateral — nunca pantalla completa.**

- El usuario puede ver su historial de comandos mientras practica. El contexto visual ayuda al aprendizaje.
- Pantalla completa solo si el usuario lo activa manualmente (`[⤢]` expand button en la esquina del panel).
- En mobile, el bottom sheet a 70% cumple el mismo rol.

### 10.3 ¿Cómo se ve la barra de progreso en mobile?

**Respuesta: Barra horizontal compacta + número, sin texto.**

```
[■■■■□□□□□□]  4/10  83%
```

- En mobile: barra full-width en la parte superior del bottom sheet, 4px de alto.
- Sin etiquetas de texto — solo íconos y números para economizar espacio.
- El porcentaje de acierto aparece solo al completar la sesión.

### 10.4 ¿El botón "Practicar" en la sidebar es permanente o contextual?

**Respuesta: Permanente, pero con estado dinámico.**

| Estado | Qué muestra |
|---|---|
| Sin actividad previa | "Practicar" — icono neutro |
| Quiz disponible (trigger activo) | "Practicar · 1 quiz listo" — indicador dot azul |
| Racha activa | "Practicar · 🔥 5 días" |
| Sesión completada hoy | "Practicar · ✓ hecho" — opacidad reducida |

- El botón está en la sidebar inferior, junto a "Historial" y "Configuración".
- Solo visible para usuarios Pro+. En Starter: botón greyed-out con tooltip "Disponible en Pro".

### 10.5 ¿Hay gamification?

**Respuesta: Sí, pero minimalista. Sin puntos, con rachas y dominio.**

Se descarta el sistema de puntos (parece app de idiomas, no herramienta de dev). En su lugar:

| Mechanic | Descripción |
|---|---|
| **Racha diaria** | Días consecutivos con al menos 1 quiz completado. Se muestra en el botón sidebar y en el perfil. |
| **Dominio por concepto** | Barra de dominio por comando/concepto (ej: `git rebase`: ████░ 80%). Visible en el panel de perfil. |
| **Logros silenciosos** | Se desbloquean sin fanfarria — aparecen en el perfil como badges discretos. Ej: "Rebase master", "5 días seguidos", "100 quizzes". |

Sin puntos, sin leaderboards, sin notificaciones push de racha. El objetivo es retención, no adicción.

### 10.6 ¿Los quizzes se pueden compartir?

**Respuesta: No en V1/V2. En V3, compartir pregunta específica (no desafío entre usuarios).**

- V1/V2: no hay sharing. El quiz es una herramienta personal de aprendizaje.
- V3: botón "Compartir esta pregunta" en cada quiz → genera link estático con la pregunta y respuesta (sin interactividad). Útil para discutir en equipos o documentación interna.
- Desafíos entre usuarios (Teams): evaluado para una fase posterior, requiere sistema de notificaciones que no existe aún.

---

## 11. Especificación técnica (para implementación)

### 11.1 Estructura de datos

```typescript
// Banco de preguntas (pre-generadas + cacheadas)
interface QuizQuestion {
  id: string
  concept: string          // "git-merge-squash", "git-rebase", etc.
  type: 'multiple' | 'fill' | 'sequence' | 'scenario'
  difficulty: 'basic' | 'intermediate' | 'advanced'
  prompt: string
  options?: string[]       // multiple / scenario
  blanks?: string[]        // fill — respuestas válidas
  steps?: string[]         // sequence — orden correcto
  correctIndex?: number    // multiple / scenario
  explanation: string      // feedback inmediato
  relatedCommand: string   // comando git que dispara este quiz
}

// Progreso del usuario (persiste en DB — requiere Memory Layer)
interface UserQuizProgress {
  userId: string
  conceptId: string
  totalAttempts: number
  correctAttempts: number
  lastSeenAt: Date
  masteryLevel: number     // 0–100
  nextReviewAt: Date       // spaced repetition
}

// Sesión activa (ephemeral — estado local)
interface QuizSession {
  sessionId: string
  questions: QuizQuestion[]
  currentIndex: number
  answers: { questionId: string; correct: boolean; skipped: boolean }[]
  startedAt: Date
  trigger: 'after-command' | 'milestone' | 'streak' | 'manual'
}
```

### 11.2 Generación de preguntas

**Banco estático (V1):** ~200 preguntas pre-escritas cubren los 40 comandos más usados en GitSpeak. Generadas offline con Claude, revisadas manualmente. Cacheadas en DB, sin costo de IA en runtime.

**Generación dinámica (V3):** Prompt especializado usando el provider BYOK del usuario:

```
Generá una pregunta de opción múltiple sobre el concepto "{concept}" 
para un desarrollador de nivel {level}. 
El usuario acaba de ejecutar: `{lastCommand}`.
Formato: { prompt, options: [A,B,C], correctIndex, explanation }.
La explicación debe tener máximo 1 oración.
```

### 11.3 Spaced repetition (V3)

Algoritmo SM-2 simplificado:
- Respuesta correcta → próxima revisión en `interval * easeFactor` días
- Respuesta incorrecta → reset a intervalo de 1 día
- `easeFactor` inicia en 2.5, se ajusta ±0.1 por resultado

### 11.4 Trigger logic

```typescript
// Hook que se ejecuta después de cada comando exitoso
function onCommandSuccess(command: GitCommand, userId: string) {
  const recentCount = getCommandsInSession(userId)
  
  if (recentCount % 3 !== 0) return          // max 1 quiz cada 3 comandos
  if (userSkippedInSession(userId)) return    // respeta el "no mostrar más"
  
  const question = findQuestionFor(command.concept, userId)
  if (!question) return
  
  setTimeout(() => showQuizPopover(question), 8000)  // 8s post-comando
}
```

---

## 12. Fase de implementación

| Versión | Fase GitSpeak | Qué incluye |
|---|---|---|
| **V1 — Core** | Fase 4 (inicio) | Banco estático 200 preguntas. Opción múltiple + completar comando. Trigger after-command + concept unlocked. Popover UI. Feedback inmediato. Sin persistencia de progreso. |
| **V2 — Rich** | Fase 4 (mitad) | Secuencia (tap-to-order en mobile, drag en desktop) + escenario. Modo ráfaga (panel lateral). Repaso semanal. Progreso persistente (requiere Memory Layer activa). Racha diaria. Dominio por concepto. |
| **V3 — Smart** | Fase 4 (cierre) | Preguntas generadas dinámicamente con BYOK. Dificultad adaptativa (SM-2 simplificado). Logros/badges. Compartir pregunta. Review mode contextual. |

**Dependencias críticas:**
- V1 puede implementarse sin Memory Layer (sin persistencia, progreso ephemeral por sesión)
- V2 **requiere** Memory Layer para `UserQuizProgress`
- V3 **requiere** BYOK configurado + Memory Layer completa
