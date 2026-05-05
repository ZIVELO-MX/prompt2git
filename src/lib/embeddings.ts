export async function generateEmbedding(input: string, apiKey: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: input,
      dimensions: 1536,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(err.error?.message ?? `Embedding error ${res.status}`)
  }

  const data = await res.json() as { data: Array<{ embedding: number[] }> }
  return data.data[0]?.embedding ?? []
}
