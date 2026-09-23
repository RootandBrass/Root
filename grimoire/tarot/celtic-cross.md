---
title: "Celtic Cross"
date: "2026-09-23"
type: "tarot-spread"
---

<div class="celtic-cross-page">
  <header class="celtic-cross-header">
    <p class="kicker">Tarot Spread</p>
    <div class="celtic-cross-symbol">✦</div>
    <h1>Celtic Cross</h1>
    <p class="celtic-cross-lead">A ten-card spread for looking deeply at a situation, the forces surrounding it, and where the present path may lead.</p>
  </header>

  <div class="celtic-cross-layout" aria-label="Celtic Cross card layout">
    <div class="cc-card cc-5"><span>5</span><small>Your Strength</small></div>
    <div class="cc-card cc-3"><span>3</span><small>Past</small></div>
    <div class="cc-card cc-1"><span>1</span><small>Present</small></div>
    <div class="cc-card cc-2"><span>2</span><small>The Problem</small></div>
    <div class="cc-card cc-4"><span>4</span><small>Future</small></div>
    <div class="cc-card cc-6"><span>6</span><small>Root of the Problem</small></div>
    <div class="cc-staff">
      <div class="cc-card"><span>10</span><small>Outcome</small></div>
      <div class="cc-card"><span>9</span><small>Advice</small></div>
      <div class="cc-card"><span>8</span><small>External Influences</small></div>
      <div class="cc-card"><span>7</span><small>How to Face It</small></div>
    </div>
  </div>

  <section class="celtic-cross-meanings">
    <h2>The Positions</h2>
    <ol>
      <li><strong>Present</strong><span>The heart of the situation.</span></li>
      <li><strong>The Problem</strong><span>The challenge, crossing influence, or immediate obstacle.</span></li>
      <li><strong>Past</strong><span>What has shaped the present.</span></li>
      <li><strong>Future</strong><span>What is developing next.</span></li>
      <li><strong>Your Strength</strong><span>Resources, perspective, or qualities available to you.</span></li>
      <li><strong>Root of the Problem</strong><span>The underlying cause or foundation.</span></li>
      <li><strong>How to Face It</strong><span>Your approach, attitude, or position.</span></li>
      <li><strong>External Influences</strong><span>People, circumstances, and forces around you.</span></li>
      <li><strong>Advice</strong><span>Guidance, hopes or fears, and what deserves attention.</span></li>
      <li><strong>Outcome</strong><span>The likely direction if the current pattern continues.</span></li>
    </ol>
  </section>

  <div class="celtic-cross-back"><a href="/grimoire/tarot/">← Back to Tarot</a></div>
</div>

<style>
.celtic-cross-page{max-width:900px;margin:0 auto;padding:90px 0 120px;color:#d9d1c4}
.celtic-cross-header{text-align:center;max-width:720px;margin:0 auto 65px}
.celtic-cross-symbol{color:#d88b26;font-size:2rem;margin:18px 0}
.celtic-cross-header h1{font-size:clamp(2.8rem,9vw,5.8rem);color:#eee5d6;letter-spacing:.12em}
.celtic-cross-lead{max-width:620px;margin:28px auto 0;color:#b9aa98;font-style:italic;line-height:1.8}
.celtic-cross-layout{position:relative;display:grid;grid-template-columns:1fr 1fr 1fr .75fr;grid-template-rows:repeat(3,180px);gap:18px;align-items:center;margin:0 auto 80px;padding:38px;border:1px solid rgba(182,138,60,.25);background:rgba(10,9,9,.72)}
.cc-card{min-height:145px;padding:18px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(216,139,38,.45);background:linear-gradient(145deg,rgba(65,31,27,.9),rgba(20,16,16,.96));box-shadow:inset 0 0 30px rgba(216,139,38,.04)}
.cc-card span{display:grid;place-items:center;width:48px;height:48px;border:1px solid rgba(216,139,38,.55);border-radius:50%;color:#eee5d6;font-size:1.35rem}
.cc-card small{margin-top:12px;color:#cdbb9d;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase}
.cc-5{grid-column:2;grid-row:1}.cc-3{grid-column:1;grid-row:2}.cc-1{grid-column:2;grid-row:2}.cc-2{grid-column:2;grid-row:2;transform:rotate(90deg) scale(.72);z-index:2}.cc-2 small{transform:rotate(-90deg)}.cc-2 span{transform:rotate(-90deg)}.cc-4{grid-column:3;grid-row:2}.cc-6{grid-column:2;grid-row:3}
.cc-staff{grid-column:4;grid-row:1/4;display:flex;flex-direction:column;gap:12px}.cc-staff .cc-card{min-height:120px}
.celtic-cross-meanings{max-width:760px;margin:0 auto}.celtic-cross-meanings h2{text-align:center;color:#eee5d6;font-weight:normal;letter-spacing:.12em;font-size:2rem;margin-bottom:35px}
.celtic-cross-meanings ol{list-style:none;counter-reset:cc;padding:0;margin:0;border-top:1px solid rgba(182,138,60,.25)}
.celtic-cross-meanings li{counter-increment:cc;display:grid;grid-template-columns:42px 190px 1fr;gap:16px;padding:20px 8px;border-bottom:1px solid rgba(182,138,60,.18);align-items:start}
.celtic-cross-meanings li:before{content:counter(cc);color:#d88b26;font-size:1.1rem}
.celtic-cross-meanings strong{color:#eee5d6;font-weight:normal}.celtic-cross-meanings span{color:#aa9d8c}
.celtic-cross-back{text-align:center;margin-top:65px}.celtic-cross-back a{color:#d88b26;text-decoration:none;text-transform:uppercase;letter-spacing:.14em;font-size:.7rem}
@media(max-width:640px){.celtic-cross-page{padding:55px 0 85px}.celtic-cross-layout{grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,125px) auto;padding:18px 8px;gap:8px}.cc-card{min-height:105px;padding:10px 4px}.cc-card span{width:36px;height:36px;font-size:1rem}.cc-card small{font-size:.52rem}.cc-staff{grid-column:1/4;grid-row:4;display:grid;grid-template-columns:repeat(4,1fr);margin-top:18px}.cc-staff .cc-card{min-height:105px}.celtic-cross-meanings li{grid-template-columns:28px 1fr;gap:8px 12px}.celtic-cross-meanings li span{grid-column:2}.celtic-cross-header h1{letter-spacing:.08em}}
</style>
