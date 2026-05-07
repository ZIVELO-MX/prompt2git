const esbuild = require('esbuild')

const isWatch = process.argv.includes('--watch')

/** @type {esbuild.BuildOptions} */
const config = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: isWatch,
  minify: !isWatch,
  keepNames: true,
  treeShaking: true,
}

async function main() {
  if (isWatch) {
    const ctx = await esbuild.context(config)
    await ctx.watch()
    console.log('[esbuild] watching for changes…')
  } else {
    const result = await esbuild.build(config)
    if (result.errors.length > 0) {
      console.error('[esbuild] build failed:', result.errors)
      process.exit(1)
    }
    console.log('[esbuild] build complete → dist/extension.js')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
