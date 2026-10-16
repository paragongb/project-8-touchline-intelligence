const fixtures=[
  {id:'m01',round:'Round 8',date:'18 Oct · 20:00',home:'Northbridge FC',away:'Riverside United',h:'NBR',a:'RSU'},
  {id:'m02',round:'Round 8',date:'19 Oct · 17:30',home:'Borough Athletic',away:'Kingsport City',h:'BOR',a:'KSC'},
  {id:'m03',round:'Round 8',date:'19 Oct · 21:00',home:'Eastgate Rovers',away:'Harbour FC',h:'EGR',a:'HBR'}
];
const squad=[
  ['NBR-01','Elias Ward','GK',78],['NBR-02','Theo Mercer','RB',72],['NBR-03','Luca Bennett','CB',76],['NBR-04','Marcus Vale','CB',80],['NBR-05','Owen Clarke','LB',74],
  ['NBR-06','Idris Cole','DM',82],['NBR-07','Jonah Reed','CM',77],['NBR-08','Malik Hayes','AM',85],['NBR-09','Rory Quinn','RW',81],['NBR-10','Samir Noor','ST',84],['NBR-11','Finn Parker','LW',79],
  ['NBR-12','Caleb Moss','GK',69],['NBR-13','Jude Ellis','CB',71],['NBR-14','Noah Price','FB',73],['NBR-15','Tariq Bell','CM',75],['NBR-16','Alex Rowan','AM',77],['NBR-17','Leo Grant','W',76],['NBR-18','Dylan Shaw','ST',72]
].map(([id,name,pos,rating])=>({id,name,pos,rating}));
const formations={
  '4-3-3':[[50,91],[18,70],[39,76],[61,76],[82,70],[50,60],[34,47],[66,47],[20,25],[50,17],[80,25]],
  '4-2-3-1':[[50,91],[18,70],[39,76],[61,76],[82,70],[39,61],[61,61],[20,39],[50,35],[80,39],[50,16]],
  '4-4-2':[[50,91],[18,70],[39,76],[61,76],[82,70],[19,49],[40,52],[60,52],[81,49],[38,19],[62,19]],
  '3-4-2-1':[[50,91],[28,75],[50,78],[72,75],[15,52],[39,56],[61,56],[85,52],[37,34],[63,34],[50,15]]
};
const tacticOptions={
  'Build-up':['Patient','Balanced','Direct'],
  'Attacking width':['Narrow','Balanced','Wide'],
  'Passing style':['Short','Mixed','Direct'],
  'Pressing':['Low block','Mid block','High press'],
  'Defensive line':['Deep','Balanced','High'],
  'Defensive shape':['Compact','Balanced','Aggressive']
};
const list=document.querySelector('#fixture-list');
const dialog=document.querySelector('#planner-dialog');
let activeFixture=null,plan=null,selectedId=null;
const defaults={formation:'4-3-3',starters:squad.slice(0,11).map((p,i)=>({...p,x:formations['4-3-3'][i][0],y:formations['4-3-3'][i][1],role:defaultRole(p.pos)})),bench:squad.slice(11).map(p=>({...p})),tactics:Object.fromEntries(Object.keys(tacticOptions).map(k=>[k,'Balanced'])),strategy:''};
function defaultRole(pos){return ({GK:'Sweeper keeper',CB:'Central defender',RB:'Fullback',LB:'Fullback',FB:'Fullback',DM:'Holding midfielder',CM:'Box-to-box',AM:'Playmaker',RW:'Inside forward',LW:'Inside forward',W:'Winger',ST:'Target forward'})[pos]||'Balanced';}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
list.innerHTML=fixtures.map(f=>`<article class="fixture"><div class="fixture-top"><span>${f.round} · ${f.date}</span><span class="status">Open</span></div><div class="teams"><div class="team"><span class="crest">${f.h}</span>${f.home}</div><div class="team"><span class="crest">${f.a}</span>${f.away}</div></div><button data-id="${f.id}">Build match plan →</button></article>`).join('');
function cloneDefault(){return structuredClone(defaults)}
function savePlan(showMessage=true){if(!activeFixture||!plan)return;plan.strategy=document.querySelector('#strategy-text').value;localStorage.setItem(`ti-plan-${activeFixture.id}`,JSON.stringify(plan));if(showMessage)document.querySelector('#saved-message').textContent='Match plan saved on this device.';renderFixtures();}
function renderFixtures(){for(const b of list.querySelectorAll('button[data-id]')){const saved=localStorage.getItem(`ti-plan-${b.dataset.id}`);b.textContent=saved?'Continue match plan →':'Build match plan →';}}
function openFixture(id){activeFixture=fixtures.find(f=>f.id===id);plan=JSON.parse(localStorage.getItem(`ti-plan-${id}`)||'null')||cloneDefault();document.querySelector('#dialog-title').textContent=`${activeFixture.home} plan`;document.querySelector('#dialog-fixture').textContent=`${activeFixture.home} vs ${activeFixture.away} · ${activeFixture.date}`;document.querySelector('#formation').value=plan.formation;document.querySelector('#strategy-text').value=plan.strategy||'';document.querySelector('#saved-message').textContent='Your plan is saved on this device as you work.';selectedId=plan.starters[0]?.id||null;renderPlanner();dialog.showModal();}
function renderPlanner(){
  document.querySelector('#pitch-players').innerHTML=plan.starters.map((p,i)=>`<button class="pitch-player ${p.id===selectedId?'selected':''}" data-player="${p.id}" style="left:${p.x}%;top:${p.y}%" aria-label="${escapeHtml(p.name)}, ${escapeHtml(p.role)}"><span class="player-shirt">${p.id.slice(-2)}</span><span class="player-name">${escapeHtml(p.name.split(' ')[0])}</span></button>`).join('');
  document.querySelector('#bench').innerHTML=plan.bench.map(p=>`<button class="bench-player ${selectedId?'can-swap':''}" data-bench="${p.id}"><span>${p.id.slice(-2)}</span><strong>${escapeHtml(p.name)}</strong><small>${p.pos} · ${p.rating}</small></button>`).join('');
  document.querySelector('#player-list').innerHTML=plan.starters.map(p=>`<button class="squad-row ${p.id===selectedId?'active':''}" data-select="${p.id}"><span class="row-number">${p.id.slice(-2)}</span><span class="row-person"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.pos)} · ${escapeHtml(p.role)}</small></span><b>${p.rating}</b></button>`).join('');
  document.querySelector('#lineup-count').textContent=`${plan.starters.length} / 11`;
  const chosen=plan.starters.find(p=>p.id===selectedId);const box=document.querySelector('#selected-player');const role=document.querySelector('#role-select');
  if(chosen){box.innerHTML=`<span class="selected-shirt">${chosen.id.slice(-2)}</span><div><small>${escapeHtml(chosen.pos)} · RATING ${chosen.rating}</small><strong>${escapeHtml(chosen.name)}</strong></div>`;role.disabled=false;role.innerHTML=['Sweeper keeper','Central defender','Ball-playing defender','Fullback','Wingback','Holding midfielder','Deep playmaker','Box-to-box','Playmaker','Inside forward','Winger','Target forward','Pressing forward'].map(r=>`<option ${chosen.role===r?'selected':''}>${r}</option>`).join('');}else{box.innerHTML='<span class="selected-shirt">—</span><div><small>SELECT A PLAYER</small><strong>Tap a player on the pitch</strong></div>';role.disabled=true;}
  document.querySelector('#tactic-settings').innerHTML=Object.entries(tacticOptions).map(([name,opts])=>`<fieldset class="tactic-card"><legend>${name}</legend><div>${opts.map(o=>`<button type="button" data-tactic="${name}" data-value="${o}" class="choice ${plan.tactics[name]===o?'chosen':''}">${o}</button>`).join('')}</div></fieldset>`).join('');
}
list.addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(b)openFixture(b.dataset.id)});
document.querySelector('.close').addEventListener('click',()=>{savePlan(false);dialog.close()});
dialog.addEventListener('click',e=>{if(e.target===dialog){savePlan(false)}});
document.querySelector('#formation').addEventListener('change',e=>{plan.formation=e.target.value;plan.starters.forEach((p,i)=>{p.x=formations[plan.formation][i][0];p.y=formations[plan.formation][i][1]});renderPlanner();savePlan(false)});
document.querySelector('#pitch-players').addEventListener('click',e=>{const p=e.target.closest('[data-player]');if(p){selectedId=p.dataset.player;renderPlanner()}});
document.querySelector('#player-list').addEventListener('click',e=>{const p=e.target.closest('[data-select]');if(p){selectedId=p.dataset.select;renderPlanner()}});
document.querySelector('#bench').addEventListener('click',e=>{const b=e.target.closest('[data-bench]');if(!b||!selectedId)return;const i=plan.starters.findIndex(p=>p.id===selectedId),j=plan.bench.findIndex(p=>p.id===b.dataset.bench);if(i<0||j<0)return;const old=plan.starters[i],sub=plan.bench[j];plan.starters[i]={...sub,x:old.x,y:old.y,role:defaultRole(sub.pos)};plan.bench[j]={id:old.id,name:old.name,pos:old.pos,rating:old.rating};selectedId=sub.id;renderPlanner();savePlan(false)});
document.querySelector('#role-select').addEventListener('change',e=>{const p=plan.starters.find(x=>x.id===selectedId);if(p){p.role=e.target.value;renderPlanner();savePlan(false)}});
document.querySelector('#tactic-settings').addEventListener('click',e=>{const b=e.target.closest('[data-tactic]');if(!b)return;plan.tactics[b.dataset.tactic]=b.dataset.value;renderPlanner();savePlan(false)});
document.querySelector('#strategy-text').addEventListener('input',()=>savePlan(false));
document.querySelector('#save-draft').addEventListener('click',()=>savePlan(true));
const pitch=document.querySelector('#pitch');let dragging=null;
document.querySelector('#pitch-players').addEventListener('pointerdown',e=>{const button=e.target.closest('[data-player]');if(!button)return;dragging=button.dataset.player;button.setPointerCapture(e.pointerId);selectedId=dragging;button.classList.add('dragging');});
document.querySelector('#pitch-players').addEventListener('pointermove',e=>{if(!dragging)return;const r=pitch.getBoundingClientRect(),x=Math.max(7,Math.min(93,(e.clientX-r.left)/r.width*100)),y=Math.max(5,Math.min(95,(e.clientY-r.top)/r.height*100)),p=plan.starters.find(v=>v.id===dragging);if(p){p.x=x;p.y=y;const el=document.querySelector(`[data-player="${dragging}"]`);el.style.left=`${x}%`;el.style.top=`${y}%`;}});
document.querySelector('#pitch-players').addEventListener('pointerup',()=>{if(dragging){dragging=null;renderPlanner();savePlan(false)}});
document.querySelector('#pitch-players').addEventListener('pointercancel',()=>{if(dragging){dragging=null;savePlan(false)}});
renderFixtures();
