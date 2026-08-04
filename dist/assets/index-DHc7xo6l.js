(function(){const l=document.createElement("link").relList;if(l&&l.supports&&l.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const t of r.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&n(t)}).observe(document,{childList:!0,subtree:!0});function a(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(o){if(o.ep)return;o.ep=!0;const r=a(o);fetch(o.href,r)}})();const y={classic:{label:"Classic",options:[{value:"beginner",label:"Beginner",rating:1},{value:"intermediate",label:"Intermediate",rating:2},{value:"advanced",label:"Advanced",rating:3}]},club:{label:"Club",options:[{value:"b",label:"B",rating:1},{value:"a",label:"A",rating:3}]}},b={skillSystem:"classic",teamCount:4,players:[{name:"Ava",skill:"advanced"},{name:"Noah",skill:"intermediate"},{name:"Mia",skill:"beginner"},{name:"Liam",skill:"advanced"},{name:"Zoe",skill:"intermediate"},{name:"Eli",skill:"beginner"}],teams:[],matches:[],semifinals:[],final:null},S="volleyflow-planner-state",A=document.querySelector("#app"),L=P(),s=L??structuredClone(b);function P(){try{const e=localStorage.getItem(S);return e?{...structuredClone(b),...JSON.parse(e)}:null}catch{return null}}function p(){localStorage.setItem(S,JSON.stringify(s))}function u(){return y[s.skillSystem]??y.classic}function E(e){var a;return((a=u().options.find(n=>n.value===e))==null?void 0:a.rating)??1}function I(e){var a;return((a=u().options.find(n=>n.value===e))==null?void 0:a.label)??e}function N(e,l){const a=Array.from({length:l},(t,i)=>({id:`team-${i+1}`,name:`Team ${i+1}`,players:[]})),n=[...e].map((t,i)=>({...t,rating:E(t.skill),index:i})).sort((t,i)=>i.rating!==t.rating?i.rating-t.rating:t.name.localeCompare(i.name)||t.index-i.index);let o=1,r=0;for(const t of n)a[r].players.push(t),r+=o,r>=l?(o=-1,r=l-1):r<0&&(o=1,r=0);return a.map(t=>{const i=t.players.reduce((d,c)=>d+c.rating,0);return{...t,totalRating:i,averageRating:t.players.length?i/t.players.length:0}})}function R(e){const l=e.map(t=>t.id);if(l.length<2)return[];const a=[...l];a.length%2===1&&a.push(null);const n=a.length-1,o=a.length/2,r=[];for(let t=0;t<n;t+=1){for(let c=0;c<o;c+=1){const f=a[c],w=a[a.length-1-c];!f||!w||r.push({id:`rr-${t+1}-${c+1}`,round:t+1,teamA:f,teamB:w,scoreA:"",scoreB:"",winnerId:""})}const i=a[0],d=a.slice(1);d.unshift(d.pop()),a.splice(0,a.length,i,...d)}return r}function k(e,l){const a=new Map(e.map(n=>[n.id,{team:n,played:0,wins:0,losses:0,scored:0,allowed:0,diff:0}]));for(const n of l){const o=Number(n.scoreA),r=Number(n.scoreB);if(!Number.isFinite(o)||!Number.isFinite(r))continue;const t=a.get(n.teamA),i=a.get(n.teamB);!t||!i||(t.played+=1,i.played+=1,t.scored+=o,t.allowed+=r,i.scored+=r,i.allowed+=o,t.diff=t.scored-t.allowed,i.diff=i.scored-i.allowed,n.winnerId===n.teamA?(t.wins+=1,i.losses+=1):n.winnerId===n.teamB&&(i.wins+=1,t.losses+=1))}return[...a.values()].sort((n,o)=>o.wins!==n.wins?o.wins-n.wins:o.diff!==n.diff?o.diff-n.diff:o.scored!==n.scored?o.scored-n.scored:n.team.name.localeCompare(o.team.name))}function B(e){if(e.length<4)return[];const l=e.slice(0,4).map(a=>a.team.id);return[{id:"sf-1",round:"Semifinal",teamA:l[0],teamB:l[3],scoreA:"",scoreB:"",winnerId:""},{id:"sf-2",round:"Semifinal",teamA:l[1],teamB:l[2],scoreA:"",scoreB:"",winnerId:""}]}function $(e,l){const a=e.filter(n=>n.winnerId).map(n=>n.winnerId);return a.length<2?null:{id:"final",round:"Final",teamA:a[0],teamB:a[1],scoreA:"",scoreB:"",winnerId:""}}function v(){return new Map(s.teams.map(e=>[e.id,e]))}function h(e){var l;return((l=v().get(e))==null?void 0:l.name)??e}function C(e,l,a){s.players[e]={...s.players[e],[l]:a},p(),m()}function T(){var e;s.players.push({name:"",skill:((e=u().options[0])==null?void 0:e.value)??"beginner"}),p(),m()}function q(e){s.players.splice(e,1),p(),m()}function M(){const e=s.players.filter(a=>a.name.trim()),l=Math.max(2,Math.min(Number(s.teamCount)||2,e.length||2));e.length<2||(s.teamCount=l,s.teams=N(e,l),s.matches=R(s.teams),s.semifinals=[],s.final=null,p(),m())}function x(e,l,a,n){const r=(e==="roundRobin"?s.matches:e==="semis"?s.semifinals:s.final?[s.final]:[]).find(t=>t.id===l);r&&(r[a]=n,a==="winnerId"&&!n&&(r.scoreA="",r.scoreB=""),e==="semis"&&(s.final=$(s.semifinals,v())),p(),m())}function F(){const e=k(s.teams,s.matches);s.semifinals=B(e),s.final=$(s.semifinals,v()),p(),m()}function O(){Object.assign(s,structuredClone(b)),p(),m()}function j(){var e,l,a,n;s.players=[{name:"Ava",skill:((e=u().options[2])==null?void 0:e.value)??u().options[0].value},{name:"Noah",skill:((l=u().options[1])==null?void 0:l.value)??u().options[0].value},{name:"Mia",skill:u().options[0].value},{name:"Liam",skill:((a=u().options[2])==null?void 0:a.value)??u().options[0].value},{name:"Zoe",skill:((n=u().options[1])==null?void 0:n.value)??u().options[0].value},{name:"Eli",skill:u().options[0].value}],p(),m()}function g(e,l){const a=h(e.teamA),n=h(e.teamB),o=e.winnerId?h(e.winnerId):"Not set",r=!s.teams.length;return`
    <div class="match-card">
      <div class="match-head">
        <strong>${e.round??"Round Robin"}</strong>
        <span>${o}</span>
      </div>
      <div class="match-grid">
        <div class="match-team">
          <span>${a}</span>
          <input type="number" min="0" data-stage="${l}" data-id="${e.id}" data-field="scoreA" value="${e.scoreA??""}" ${r?"disabled":""} placeholder="0" />
        </div>
        <div class="match-team">
          <span>${n}</span>
          <input type="number" min="0" data-stage="${l}" data-id="${e.id}" data-field="scoreB" value="${e.scoreB??""}" ${r?"disabled":""} placeholder="0" />
        </div>
      </div>
      <label class="winner-row">
        Winner
        <select data-stage="${l}" data-id="${e.id}" data-field="winnerId" ${r?"disabled":""}>
          <option value="">Select winner</option>
          <option value="${e.teamA}" ${e.winnerId===e.teamA?"selected":""}>${a}</option>
          <option value="${e.teamB}" ${e.winnerId===e.teamB?"selected":""}>${n}</option>
        </select>
      </label>
    </div>
  `}function m(){const e=u(),l=k(s.teams,s.matches),a=s.matches.filter(t=>t.winnerId).length,n=l.length>=4,o=s.semifinals.length?s.semifinals:n?B(l):[],r=s.final??$(o,v());A.innerHTML=`
    <div class="shell">
      <header class="hero">
        <div>
          <p class="eyebrow">VolleyFlow Planner</p>
          <h1>Build fair teams, run every matchup, and crown the winners.</h1>
          <p class="lead">Add players, choose your skill system, generate balanced teams, then track round robin results into semifinals and a final.</p>
        </div>
        <div class="hero-stats">
          <div><strong>${s.players.length}</strong><span>Players</span></div>
          <div><strong>${s.teams.length||"-"}</strong><span>Teams</span></div>
          <div><strong>${a}/${s.matches.length||0}</strong><span>Results logged</span></div>
        </div>
      </header>

      <main class="grid">
        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Setup</p>
              <h2>Players and skill levels</h2>
            </div>
            <div class="actions">
              <button id="sampleBtn" class="ghost">Load sample names</button>
              <button id="resetBtn" class="ghost danger">Reset</button>
            </div>
          </div>

          <div class="controls">
            <label>
              Skill system
              <select id="skillSystem" class="select">
                ${Object.entries(y).map(([t,i])=>`<option value="${t}" ${s.skillSystem===t?"selected":""}>${i.label}</option>`).join("")}
              </select>
            </label>
            <label>
              Team count
              <input id="teamCount" type="number" min="2" max="12" value="${s.teamCount}" />
            </label>
          </div>

          <div class="player-list">
            ${s.players.map((t,i)=>`
                  <div class="player-row">
                    <input data-index="${i}" data-field="name" type="text" value="${t.name}" placeholder="Player name" />
                    <select data-index="${i}" data-field="skill" class="select">
                      ${e.options.map(d=>`<option value="${d.value}" ${t.skill===d.value?"selected":""}>${d.label}</option>`).join("")}
                    </select>
                    <button class="icon-btn" data-remove-player="${i}" aria-label="Remove player">×</button>
                  </div>
                `).join("")}
          </div>

          <div class="actions split">
            <button id="addPlayerBtn" class="ghost">Add player</button>
            <button id="generateBtn" class="primary">Generate teams and schedule</button>
          </div>
          <p class="helper">Balanced teams use a snake draft so high-skill players are spread across the bracket.</p>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Teams</p>
              <h2>Fair team balance</h2>
            </div>
            <button id="playoffsBtn" class="ghost" ${s.teams.length?"":"disabled"}>Build semifinals</button>
          </div>

          <div class="team-grid">
            ${s.teams.map(t=>`
                  <article class="team-card">
                    <div class="team-head">
                      <h3>${t.name}</h3>
                      <span>Rating ${t.totalRating}</span>
                    </div>
                    <ul>
                      ${t.players.map(i=>`<li>${i.name} <span>${I(i.skill)}</span></li>`).join("")}
                    </ul>
                    <p class="team-foot">Average rating ${t.averageRating.toFixed(1)}</p>
                  </article>
                `).join("")||'<p class="empty">Generate teams to see the balance chart.</p>'}
          </div>
        </section>

        <section class="panel wide">
          <div class="panel-head">
            <div>
              <p class="section-label">Round Robin</p>
              <h2>Everyone plays everyone</h2>
            </div>
            <span class="badge">${s.matches.length} matches</span>
          </div>

          <div class="match-list">
            ${s.matches.map(t=>g(t,"roundRobin")).join("")||'<p class="empty">Generate teams to build the schedule.</p>'}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Standings</p>
              <h2>Table after results</h2>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Team</th><th>W</th><th>L</th><th>PF</th><th>PA</th><th>Diff</th></tr>
              </thead>
              <tbody>
                ${l.map(t=>`
                      <tr>
                        <td>${t.team.name}</td>
                        <td>${t.wins}</td>
                        <td>${t.losses}</td>
                        <td>${t.scored}</td>
                        <td>${t.allowed}</td>
                        <td>${t.diff}</td>
                      </tr>
                    `).join("")||'<tr><td colspan="6">No standings yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <p class="section-label">Playoffs</p>
              <h2>Semifinal and final</h2>
            </div>
          </div>

          <div class="match-list">
            ${o.map(t=>({...t,stage:"semis"})).map(t=>g(t,"semis")).join("")||'<p class="empty">Run round robin results first, then build the top 4 bracket.</p>'}
          </div>
          <div class="final-box">
            ${r?g({...r},"final"):'<p class="empty">The final appears after both semifinals have a winner.</p>'}
          </div>
        </section>
      </main>
    </div>
  `,G()}function G(){var a,n,o,r,t;const e=document.querySelector("#skillSystem");e&&e.addEventListener("change",i=>{s.skillSystem=i.target.value,s.players.some(d=>!u().options.some(c=>c.value===d.skill))&&(s.players=s.players.map(d=>({...d,skill:u().options[0].value}))),p(),m()});const l=document.querySelector("#teamCount");l&&l.addEventListener("change",i=>{s.teamCount=Number(i.target.value)||2,p(),m()}),(a=document.querySelector("#addPlayerBtn"))==null||a.addEventListener("click",T),(n=document.querySelector("#generateBtn"))==null||n.addEventListener("click",M),(o=document.querySelector("#playoffsBtn"))==null||o.addEventListener("click",F),(r=document.querySelector("#sampleBtn"))==null||r.addEventListener("click",j),(t=document.querySelector("#resetBtn"))==null||t.addEventListener("click",O),document.querySelectorAll("[data-index]").forEach(i=>{i.addEventListener("change",d=>{const c=Number(d.target.dataset.index),f=d.target.dataset.field;C(c,f,d.target.value)})}),document.querySelectorAll("[data-remove-player]").forEach(i=>{i.addEventListener("click",d=>{q(Number(d.currentTarget.dataset.removePlayer))})}),document.querySelectorAll("[data-stage]").forEach(i=>{i.addEventListener("change",d=>{const c=d.target;x(c.dataset.stage,c.dataset.id,c.dataset.field,c.value)})})}m();
