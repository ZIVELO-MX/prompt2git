import type { Flag } from '@/types'

/**
 * Diccionario curado de flags de Git con sus significados.
 * Se usa como fallback cuando la AI no devuelve flags.
 */
const ENTRIES: readonly (readonly [string, string])[] = [
  ['--bare',                         'Crea un repositorio sin árbol de trabajo (solo .git), usado en servidores.'],
  ['--depth',                        'Límite de profundidad (commits de historia) para clonados superficiales.'],
  ['--branch',                       'Clona o checkout de una rama específica.'],
  ['--single-branch',                'Solo descarga la historia de la rama indicada, no todas.'],
  ['--recursive',                    'Inicializa y clona submódulos recursivamente.'],
  ['--shallow-submodules',           'Clona submódulos con historia superficial.'],

  ['-A, --all',                      'Selecciona todos los archivos (modificados, nuevos y eliminados).'],
  ['-p, --patch',                    'Selecciona interactivamente partes (hunks) de cambios.'],
  ['-u, --update',                   'Agrega solo archivos modificados y eliminados (no archivos nuevos).'],
  ['--intent-to-add',                'Marca archivos nuevos como tracked pero sin contenido.'],

  ['-m, --message',                  'Especifica el mensaje directamente en la línea de comandos.'],
  ['-a, --all',                      'Agrega automáticamente archivos modificados antes del commit.'],
  ['--amend',                        'Modifica el commit más reciente en lugar de crear uno nuevo.'],
  ['--no-edit',                      'Usa el mensaje anterior sin abrir el editor.'],
  ['--allow-empty',                  'Permite crear un commit sin cambios.'],
  ['-v, --verbose',                  'Muestra información detallada adicional.'],
  ['-s, --signoff',                  'Agrega línea Signed-off-by al mensaje del commit.'],
  ['--author',                       'Sobrescribe el autor del commit.'],
  ['--date',                         'Sobrescribe la fecha del commit.'],
  ['-S, --gpg-sign',                 'Firma el commit con GPG.'],
  ['--no-verify',                    'Omite los hooks de Git (pre-commit, commit-msg, etc.).'],
  ['--reset-author',                 'Al enmendar, reinicia el autor al usuario actual.'],

  ['--force, -f',                    'Fuerza la operación sobrescribiendo el destino.'],
  ['--force-with-lease',             'Fuerza la operación pero solo si el remoto está actualizado (más seguro).'],
  ['-u, --set-upstream',             'Establece la relación upstream para futuros pushes/pulls.'],
  ['--tags',                         'Incluye todas las etiquetas (tags) en la operación.'],
  ['--delete',                       'Elimina una referencia remota.'],
  ['--dry-run',                      'Muestra lo que se haría sin ejecutarlo realmente.'],
  ['--prune',                        'Elimina referencias remotas que ya no existen.'],
  ['--atomic',                       'Ejecuta la operación atómicamente (todo o nada).'],
  ['--mirror',                       'Refleja exactamente el repositorio local en el remoto.'],

  ['--rebase',                       'Usa rebase en lugar de merge al integrar cambios remotos.'],
  ['--ff-only',                      'Solo permite avance rápido; falla si no es posible.'],
  ['--no-commit',                    'Aplica los cambios pero no crea el commit.'],
  ['--squash',                       'Comprime todos los cambios en un solo commit.'],
  ['--autostash',                    'Guarda cambios locales automáticamente y los restaura después.'],

  ['-d',                             'Elimina una rama (solo si está fusionada).'],
  ['-D',                             'Elimina una rama forzadamente (incluso sin fusionar).'],
  ['-m',                             'Renombra una rama / mensaje del commit de merge.'],
  ['-M',                             'Renombra una rama forzadamente.'],
  ['-r, --remotes',                  'Muestra solo las ramas remotas.'],
  ['--merged',                       'Muestra solo elementos fusionados en la actual.'],
  ['--no-merged',                    'Muestra solo elementos NO fusionados.'],
  ['-u, --set-upstream-to',          'Establece una rama remota como upstream.'],
  ['--unset-upstream',               'Elimina la configuración upstream de una rama.'],
  ['--show-current',                 'Muestra el nombre de la rama actual.'],
  ['--edit-description',             'Edita la descripción de la rama.'],
  ['-c',                             'Crea una nueva rama y cambia a ella.'],
  ['-C',                             'Crea una nueva rama forzadamente.'],

  ['-b',                             'Crea una nueva rama y cambia a ella.'],
  ['-B',                             'Crea o restablece una rama y cambia a ella.'],
  ['--detach',                       'Desvincula HEAD del árbol de trabajo.'],
  ['--track',                        'Configura una rama remota como upstream.'],
  ['--orphan',                       'Crea una nueva rama sin historial (huérfana).'],
  ['--ours',                         'En conflictos, usa nuestra versión del archivo.'],
  ['--theirs',                       'En conflictos, usa la versión del otro.'],
  ['--discard-changes',              'Descarta cambios locales al cambiar de rama.'],
  ['--guess',                        'Intenta adivinar el nombre de la rama remota.'],

  ['--no-ff',                        'Evita avance rápido; preserva el historial de ramificación.'],
  ['--abort',                        'Cancela la operación en curso y vuelve al estado anterior.'],
  ['--continue',                     'Continúa la operación después de resolver conflictos.'],
  ['--skip',                         'Omite el commit actual y continúa.'],
  ['--onto',                         'Replica commits sobre una base diferente.'],
  ['-p, --preserve-merges',          'Conserva commits de merge (obsoleto, usa --rebase-merges).'],
  ['--rebase-merges',                'Recrea commits de merge durante el rebase.'],
  ['--root',                         'Opera sobre todos los commits desde el inicio del repositorio.'],
  ['--autosquash',                   'Combina automáticamente commits fixup!/squash!.'],
  ['--keep-empty',                   'Conserva commits vacíos durante la operación.'],
  ['--empty',                        'Cómo manejar commits vacíos (drop, keep, ask).'],
  ['--whitespace',                   'Cómo manejar espacios en blanco (fix, strip, error).'],
  ['--strategy',                     'Especifica la estrategia de merge.'],
  ['-X, --strategy-option',          'Pasa opciones a la estrategia de merge.'],
  ['--rerere-autoupdate',            'Actualiza automáticamente el caché rerere.'],
  ['--reschedule-failed-exec',       'Re-programa ejecuciones fallidas.'],
  ['-x, --exec',                     'Ejecuta un comando shell en cada commit.'],
  ['--signoff',                      'Agrega línea Signed-off-by.'],
  ['--verify',                       'Ejecuta los hooks correspondientes.'],

  ['-u, --include-untracked',        'Incluye archivos no trackeados.'],
  ['-a, --all',                      'Incluye todos los archivos (incluso ignorados).'],
  ['--keep-index',                   'Mantiene los cambios del staging fuera del stash.'],
  ['--index',                        'Al aplicar, también restaura el staging.'],
  ['-q, --quiet',                    'Suprime la salida normal, solo muestra errores.'],

  ['--oneline',                      'Muestra cada commit en una sola línea (hash corto + mensaje).'],
  ['--graph',                        'Dibuja el árbol de historial con caracteres ASCII.'],
  ['-n, --max-count',                'Limita el número de elementos mostrados.'],
  ['--since',                        'Filtra por fecha (más reciente que).'],
  ['--until',                        'Filtra por fecha (más antiguo que).'],
  ['--grep',                         'Filtra por mensaje.'],
  ['--name-only',                    'Muestra solo nombres de archivos.'],
  ['--first-parent',                 'Sigue solo el primer padre (ignora merges internos).'],
  ['--abbrev-commit',                'Usa hashes cortos de commit.'],
  ['--format',                       'Formato personalizado de salida.'],
  ['--decorate',                     'Muestra referencias (tags, ramas).'],
  ['-L',                             'Sigue la historia de una línea o función específica.'],
  ['--diff-filter',                  'Filtra por tipo de cambio (A/M/D).'],
  ['--follow',                       'Sigue renombres a través de la historia.'],
  ['-S',                             'Busca commits que modifican una cadena específica.'],
  ['-G',                             'Busca cambios que coinciden con una expresión regular.'],

  ['--staged, --cached',             'Muestra diferencias entre staging y último commit.'],
  ['--stat',                         'Muestra estadísticas resumidas.'],
  ['--word-diff',                    'Muestra diff por palabras en lugar de líneas.'],
  ['--check',                        'Advierte sobre conflictos de espacios en blanco.'],
  ['--color-words',                  'Muestra diff por palabras con colores.'],
  ['--no-color',                     'Suprime colores en la salida.'],
  ['-U, --unified',                  'Número de líneas de contexto (default: 3).'],
  ['--binary',                       'Muestra diff binario.'],
  ['--histogram',                    'Usa algoritmo de diff por histograma.'],
  ['--minimal',                      'Usa algoritmo de diff minimal.'],
  ['--patience',                     'Usa algoritmo de diff patience.'],
  ['--no-index',                     'Compara archivos fuera del repositorio.'],
  ['-R',                             'Intercambia las fuentes de la comparación.'],

  ['--soft',                         'Revierte HEAD pero mantiene cambios en staging.'],
  ['--mixed',                        'Revierte HEAD y staging, mantiene cambios en working dir (default).'],
  ['--hard',                         'Revierte HEAD, staging y working dir (peligroso: pierde cambios).'],
  ['--keep',                         'Revierte HEAD pero mantiene cambios locales.'],
  ['--merge',                        'Revierte HEAD y reinicia el proceso de merge.'],
  ['-N, --intent-to-add',            'Marca archivos como intent-to-add al resetear.'],

  ['-r',                             'Opera recursivamente sobre directorios.'],
  ['--cached',                       'Opera solo sobre el staging, no el disco.'],

  ['-k',                             'Ignora archivos que no existen (no da error).'],

  ['-a, --annotate',                 'Crea una tag anotada (con mensaje y metadatos).'],
  ['--sort',                         'Ordena la salida.'],
  ['--contains',                     'Muestra elementos que contienen un objeto específico.'],
  ['--points-at',                    'Muestra elementos que apuntan a un objeto específico.'],
  ['--column',                       'Muestra en formato de columnas.'],

  ['--no-tags',                      'No incluye etiquetas.'],
  ['-e, --edit',                     'Abre el editor para editar.'],
  ['-x',                             'Agrega referencia al commit original en el mensaje.'],
  ['--ff',                           'Usa avance rápido si es posible.'],

  ['--staged',                       'Opera solo sobre el staging area.'],
  ['--worktree',                     'Opera solo sobre el árbol de trabajo (default).'],
  ['--source',                       'Restaura desde un commit específico.'],
  ['-W, --worktree',                 'Opera solo sobre el árbol de trabajo.'],
  ['-S, --staged',                   'Opera solo sobre el staging.'],
  ['--overlay',                      'Restaura sin eliminar archivos no coincidentes.'],
  ['--recurse-submodules',           'Opera también sobre submódulos.'],

  ['--global',                       'Configura para todos los repositorios del usuario.'],
  ['--local',                        'Configura solo para el repositorio actual (default).'],
  ['--system',                       'Configura para todo el sistema.'],
  ['--list',                         'Lista todas las configuraciones.'],
  ['--get',                          'Obtiene el valor de una clave específica.'],
  ['--unset',                        'Elimina una clave de configuración.'],
  ['--add',                          'Agrega un nuevo valor a una clave multi-valor.'],
  ['--replace-all',                  'Reemplaza todos los valores de una clave.'],
  ['--edit',                         'Abre el archivo en el editor.'],
  ['--file',                         'Usa un archivo de configuración específico.'],
  ['--type',                         'Especifica el tipo del valor (int, bool, path).'],
  ['--show-origin',                  'Muestra la procedencia de cada configuración.'],
  ['--get-all',                      'Obtiene todos los valores de una clave multi-valor.'],
  ['--get-urlmatch',                 'Obtiene el valor que mejor coincide con una URL.'],
  ['--bool',                         'Interpreta el valor como booleano.'],
  ['--int',                          'Interpreta el valor como entero.'],
  ['--expiry-date',                  'Interpreta el valor como fecha de expiración.'],
  ['--no-type',                      'No interpreta el tipo del valor.'],
  ['--default',                      'Valor por defecto si no existe la clave.'],
  ['--includes',                     'Respeta includes al leer configuración.'],
  ['--no-includes',                  'Ignora includes al leer configuración.'],
  ['--blob',                         'Lee configuración desde un blob de Git.'],
  ['--comment',                      'Agrega un comentario al valor.'],
  ['--fixed-value',                  'Usa coincidencia exacta del valor.'],
]

export const FLAG_KNOWLEDGE = new Map<string, string>(ENTRIES)

/**
 * Combina flags generados por la AI con el diccionario curado de flags.
 * Los flags curados complementan cuando la AI no generó significados.
 */
export function combineFlags(aiFlags: Flag[], command: string): Flag[] {
  const result: Flag[] = [...aiFlags]
  const seen = new Set(result.map(f => f.flag))
  const tokens = command.split(' ')

  for (const token of tokens) {
    if (seen.has(token)) continue

    // Match exacto en diccionario
    if (FLAG_KNOWLEDGE.has(token)) {
      result.push({ flag: token, meaning: FLAG_KNOWLEDGE.get(token)! })
      seen.add(token)
      continue
    }

    // Match por variantes separadas por coma
    let matched = false
    for (const [key, meaning] of ENTRIES) {
      const variants = key.split(',').map(v => v.trim())
      if (variants.includes(token)) {
        result.push({ flag: token, meaning })
        seen.add(token)
        matched = true
        break
      }
    }
    if (matched) continue

    // HEAD~n → placeholder para número de commits
    if (/^HEAD~\d+$/.test(token)) {
      result.push({
        flag: token,
        meaning: 'Especifica el commit N posiciones atrás desde HEAD.',
      })
      seen.add(token)
    }
  }

  return result
}
