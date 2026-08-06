// Roda uma vez quando o servidor Next.js inicia. Usado aqui para subir o worker
// de automações (BullMQ) no mesmo processo — suficiente para o volume atual do
// projeto. Se o volume crescer bastante, mover para um processo dedicado.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startAutomationWorker } = await import("@/lib/queue/automation-worker");
    startAutomationWorker();
    console.log("[automations] worker iniciado");
  }
}
