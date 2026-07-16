export function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.14);
      osc.stop(ctx.currentTime + i * 0.14 + 0.24);
    });
  } catch {

  }
}

export async function notifyNextClient(displayId, queueName) {
  playChime();

  if (typeof Notification === 'undefined') return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission().catch(() => {});
  }
  if (Notification.permission === 'granted') {
    new Notification('NoQ · Next client called', {
      body: `${displayId} — ${queueName}`,
    });
  }
}
