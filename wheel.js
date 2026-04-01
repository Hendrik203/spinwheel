(function () {
  const canvas = document.getElementById("wheel");
  const ctx    = canvas.getContext("2d");
  const btn    = document.getElementById("spinBtn");
  const result = document.getElementById("result");

  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const radius = W / 2 - 8;

  const segments = CONFIG.segments;
  const count    = segments.length;

  const palette = [
    "#2a2a2a",
    "#3a3a3a",
    "#1e1e1e",
    "#333333",
    "#2e2e2e",
    "#3d3d3d",
  ];

  const sliceAngle = (2 * Math.PI) / count;

  const totalWeight = segments.reduce((s, seg) => s + seg.probability, 0);

  function pickWinner() {
    const rand = Math.random() * totalWeight;
    let acc = 0;
    for (let i = 0; i < count; i++) {
      acc += segments[i].probability;
      if (rand < acc) return i;
    }
    return count - 1;
  }

  let currentAngle = -Math.PI / 2;

  function drawWheel(angle) {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < count; i++) {
      const startA = angle + i * sliceAngle;
      const endA   = startA + sliceAngle;
      const color  = palette[i % palette.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startA, endA);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startA, endA);
      ctx.closePath();
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 2;
      ctx.stroke();

      const midA = startA + sliceAngle / 2;
      const textR = radius * 0.62;
      const tx = cx + textR * Math.cos(midA);
      const ty = cy + textR * Math.sin(midA);

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(midA + Math.PI / 2);
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = "#ddd";
      ctx.font         = `bold ${count > 6 ? 11 : 13}px sans-serif`;
      ctx.fillText(segments[i].label, 0, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function targetAngle(winnerIndex, extraSpins) {
    const segMid = winnerIndex * sliceAngle + sliceAngle / 2;
    let target = -Math.PI / 2 - segMid;
    while (target <= currentAngle) target += 2 * Math.PI;
    target += extraSpins * 2 * Math.PI;
    return target;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  let spinning = false;

  btn.addEventListener("click", function () {
    if (spinning) return;
    spinning = true;
    result.classList.add("hidden");

    const winner    = pickWinner();
    const extraSpin = 7 + Math.floor(Math.random() * 4);
    const startA    = currentAngle;
    const endA      = targetAngle(winner, extraSpin);
    const duration  = CONFIG.spinDuration;
    let startTime   = null;

    btn.disabled    = true;
    btn.textContent = "…";

    function animate(ts) {
      if (!startTime) startTime = ts;
      const t      = Math.min((ts - startTime) / duration, 1);
      currentAngle = startA + easeOut(t) * (endA - startA);
      drawWheel(currentAngle);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        spinning         = false;
        btn.disabled     = false;
        btn.textContent  = "Nochmal";
        result.textContent = segments[winner].label;
        result.classList.remove("hidden");
      }
    }

    requestAnimationFrame(animate);
  });

  drawWheel(currentAngle);
})();
