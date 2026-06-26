export async function runWithConcurrency<T>(
  tasks: T[],
  concurrency: number,
  worker: (task: T, index: number) => Promise<void>,
): Promise<void> {
  const limit = Math.max(1, Math.min(concurrency, tasks.length || 1));
  let index = 0;

  async function runner() {
    while (index < tasks.length) {
      const i = index++;
      await worker(tasks[i], i);
    }
  }

  await Promise.all(Array.from({ length: limit }, runner));
}
