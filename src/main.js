import './style.css';

const skillSystems = {
  classic: {
    label: 'Classic',
    options: [
      { value: 'beginner', label: 'Beginner', rating: 1 },
      { value: 'intermediate', label: 'Intermediate', rating: 2 },
      { value: 'advanced', label: 'Advanced', rating: 3 },
    ],
  },
  club: {
    label: 'Club',
    options: [
      { value: 'b', label: 'B', rating: 1 },
      { value: 'a', label: 'A', rating: 3 },
    ],
  },
};

const initialState = {
  skillSystem: 'classic',
  teamCount: 4,
  players: [
    { name: 'Ava', skill: 'advanced' },
    { name: 'Noah', skill: 'intermediate' },
    { name: 'Mia', skill: 'beginner' },
    { name: 'Liam', skill: 'advanced' },
    { name: 'Zoe', skill: 'intermediate' },
    { name: 'Eli', skill: 'beginner' },
  ],
  teams: [],
  matches: [],
  semifinals: [],
  final: null,
};

const STORAGE_KEY = 'volleyflow-planner-state';
const app = document.querySelector('#app');
const savedState = loadState();
const state = savedState ?? structuredClone(initialState);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...structuredClone(initialState), ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentSystem() {
  return skillSystems[state.skillSystem] ?? skillSystems.classic;
}

function skillRating(skill) {
  const system = currentSystem();
  return system.options.find((option) => option.value === skill)?.rating ?? 1;
}

function skillLabel(skill) {
  const system = currentSystem();
  return system.options.find((option) => option.value === skill)?.label ?? skill;
}

function balanceTeams(players, teamCount) {
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `Team ${index + 1}`,
    players: [],
  }));

  const sortedPlayers = [...players]
    .map((player, index) => ({ ...player, rating: skillRating(player.skill), index }))
    .sort((left, right) => {
      if (right.rating !== left.rating) return right.rating - left.rating;
      return left.name.localeCompare(right.name) || left.index - right.index;
    });

  let direction = 1;
  let teamIndex = 0;

  for (const player of sortedPlayers) {
    teams[teamIndex].players.push(player);
    teamIndex += direction;
    if (teamIndex >= teamCount) {
      direction = -1;
      teamIndex = teamCount - 1;
    } else if (teamIndex < 0) {
      direction = 1;
      teamIndex = 0;
    }
  }

  return teams.map((team) => {
    const totalRating = team.players.reduce((sum, player) => sum + player.rating, 0);
    return {
      ...team,
      totalRating,
      averageRating: team.players.length ? totalRating / team.players.length : 0,
    };
  });
}

function roundRobinPairs(teams) {
  const list = teams.map((team) => team.id);
  if (list.length < 2) return [];

  const working = [...list];
  if (working.length % 2 === 1) working.push(null);
  const rounds = working.length - 1;
  const half = working.length / 2;
  const schedule = [];

  for (let round = 0; round < rounds; round += 1) {
    for (let index = 0; index < half; index += 1) {
      const left = working[index];
      const right = working[working.length - 1 - index];
      if (!left || !right) continue;
      schedule.push({
        id: `rr-${round + 1}-${index + 1}`,
        round: round + 1,
        teamA: left,
        teamB: right,
        scoreA: '',
        scoreB: '',
        winnerId: '',
      });
    }

    const fixed = working[0];
    const rotating = working.slice(1);
    rotating.unshift(rotating.pop());
    working.splice(0, working.length, fixed, ...rotating);
  }

  return schedule;
}

function standingsFromMatches(teams, matches) {
  const base = new Map(
    teams.map((team) => [team.id, { team, played: 0, wins: 0, losses: 0, scored: 0, allowed: 0, diff: 0 }]),
  );

  for (const match of matches) {
    const scoreA = Number(match.scoreA);
    const scoreB = Number(match.scoreB);
    if (!Number.isFinite(scoreA) || !Number.isFinite(scoreB)) continue;
    const teamA = base.get(match.teamA);
    const teamB = base.get(match.teamB);
    if (!teamA || !teamB) continue;

    teamA.played += 1;
    teamB.played += 1;
    teamA.scored += scoreA;
    teamA.allowed += scoreB;
    teamB.scored += scoreB;
    teamB.allowed += scoreA;
    teamA.diff = teamA.scored - teamA.allowed;
    teamB.diff = teamB.scored - teamB.allowed;

    if (match.winnerId === match.teamA) {
      teamA.wins += 1;
      teamB.losses += 1;
    } else if (match.winnerId === match.teamB) {
      teamB.wins += 1;
      teamA.losses += 1;
    }
  }

  return [...base.values()].sort((left, right) => {
    if (right.wins !== left.wins) return right.wins - left.wins;
    if (right.diff !== left.diff) return right.diff - left.diff;
    if (right.scored !== left.scored) return right.scored - left.scored;
    return left.team.name.localeCompare(right.team.name);
  });
}

function buildSemifinals(standings) {
  if (standings.length < 4) return [];
  const topFour = standings.slice(0, 4).map((entry) => entry.team.id);
  return [
    { id: 'sf-1', round: 'Semifinal', teamA: topFour[0], teamB: topFour[3], scoreA: '', scoreB: '', winnerId: '' },
    { id: 'sf-2', round: 'Semifinal', teamA: topFour[1], teamB: topFour[2], scoreA: '', scoreB: '', winnerId: '' },
  ];
}

function buildFinal(semifinals, teamsById) {
  const winners = semifinals.filter((match) => match.winnerId).map((match) => match.winnerId);
  if (winners.length < 2) return null;
  return {
    id: 'final',
    round: 'Final',
    teamA: winners[0],
    teamB: winners[1],
    scoreA: '',
    scoreB: '',
    winnerId: '',
  };
}

function teamMap() {
  return new Map(state.teams.map((team) => [team.id, team]));
}

function getTeamName(teamId) {
  return teamMap().get(teamId)?.name ?? teamId;
}

function updatePlayer(index, field, value) {
  state.players[index] = { ...state.players[index], [field]: value };
  saveState();
  render();
}

function addPlayer() {
  state.players.push({ name: '', skill: currentSystem().options[0]?.value ?? 'beginner' });
  saveState();
  render();
}

function removePlayer(index) {
  state.players.splice(index, 1);
  saveState();
  render();
}

function generateTournament() {
  const players = state.players.filter((player) => player.name.trim());
  const teamCount = Math.max(2, Math.min(Number(state.teamCount) || 2, players.length || 2));
  if (players.length < 2) return;

  state.teamCount = teamCount;
  state.teams = balanceTeams(players, teamCount);
  state.matches = roundRobinPairs(state.teams);
  state.semifinals = [];
  state.final = null;
  saveState();
  render();
}

function updateMatch(stage, id, field, value) {
  const list = stage === 'roundRobin' ? state.matches : stage === 'semis' ? state.semifinals : state.final ? [state.final] : [];
  const match = list.find((item) => item.id === id);
  if (!match) return;

  match[field] = value;
  if (field === 'winnerId' && !value) {
    match.scoreA = '';
    match.scoreB = '';
  }

  if (stage === 'semis') {
    state.final = buildFinal(state.semifinals, teamMap());
  }

  saveState();
  render();
}

function ensurePlayoffs() {
  const standings = standingsFromMatches(state.teams, state.matches);
  state.semifinals = buildSemifinals(standings);
  state.final = buildFinal(state.semifinals, teamMap());
  saveState();
  render();
}

function resetAll() {
  Object.assign(state, structuredClone(initialState));
  saveState();
  render();
}

function samplePlayers() {
  state.players = [
    { name: 'Ava', skill: currentSystem().options[2]?.value ?? currentSystem().options[0].value },
    { name: 'Noah', skill: currentSystem().options[1]?.value ?? currentSystem().options[0].value },
    { name: 'Mia', skill: currentSystem().options[0].value },
    { name: 'Liam', skill: currentSystem().options[2]?.value ?? currentSystem().options[0].value },
    { name: 'Zoe', skill: currentSystem().options[1]?.value ?? currentSystem().options[0].value },
    { name: 'Eli', skill: currentSystem().options[0].value },
  ];
  saveState();
  render();
}

function teamSelect(match, field) {
  return `
    <select data-stage="${match.stage}" data-id="${match.id}" data-field="${field}" class="select">
      <option value="">Select winner</option>
      <option value="${match.teamA}" ${match.winnerId === match.teamA ? 'selected' : ''}>${getTeamName(match.teamA)}</option>
      <option value="${match.teamB}" ${match.winnerId === match.teamB ? 'selected' : ''}>${getTeamName(match.teamB)}</option>
    </select>
  `;
}

function renderMatch(match, stage) {
  const teamAName = getTeamName(match.teamA);
  const teamBName = getTeamName(match.teamB);
  const winnerLabel = match.winnerId ? getTeamName(match.winnerId) : 'Not set';
  const disabled = !state.teams.length;

  return `
    <div class="match-card">
      <div class="match-head">
        <strong>${match.round ?? 'Round Robin'}</strong>
        <span>${winnerLabel}</span>
      </div>
      <div class="match-grid">
        <div class="match-team">
          <span>${teamAName}</span>
          <input type="number" min="0" data-stage="${stage}" data-id="${match.id}" data-field="scoreA" value="${match.scoreA ?? ''}" ${disabled ? 'disabled' : ''} placeholder="0" />
        </div>
        <div class="match-team">
          <span>${teamBName}</span>
          <input type="number" min="0" data-stage="${stage}" data-id="${match.id}" data-field="scoreB" value="${match.scoreB ?? ''}" ${disabled ? 'disabled' : ''} placeholder="0" />
        </div>
      </div>
      <label class="winner-row">
        Winner
        <select data-stage="${stage}" data-id="${match.id}" data-field="winnerId" ${disabled ? 'disabled' : ''}>
          <option value="">Select winner</option>
          <option value="${match.teamA}" ${match.winnerId === match.teamA ? 'selected' : ''}>${teamAName}</option>
          <option value="${match.teamB}" ${match.winnerId === match.teamB ? 'selected' : ''}>${teamBName}</option>
        </select>
      </label>
    </div>
  `;
}

function render() {
  const system = currentSystem();
  const standings = standingsFromMatches(state.teams, state.matches);
  const matchCompletion = state.matches.filter((match) => match.winnerId).length;
  const semisReady = standings.length >= 4;
  const semifinalCards = state.semifinals.length ? state.semifinals : semisReady ? buildSemifinals(standings) : [];
  const finalCard = state.final ?? buildFinal(semifinalCards, teamMap());

  app.innerHTML = `
    <div class="shell">
      <header class="hero">
        <div>
          <p class="eyebrow">VolleyFlow Planner</p>
          <h1>Build fair teams, run every matchup, and crown the winners.</h1>
          <p class="lead">Add players, choose your skill system, generate balanced teams, then track round robin results into semifinals and a final.</p>
        </div>
        <div class="hero-stats">
          <div><strong>${state.players.length}</strong><span>Players</span></div>
          <div><strong>${state.teams.length || '-'}</strong><span>Teams</span></div>
          <div><strong>${matchCompletion}/${state.matches.length || 0}</strong><span>Results logged</span></div>
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
                ${Object.entries(skillSystems)
                  .map(
                    ([key, config]) => `<option value="${key}" ${state.skillSystem === key ? 'selected' : ''}>${config.label}</option>`,
                  )
                  .join('')}
              </select>
            </label>
            <label>
              Team count
              <input id="teamCount" type="number" min="2" max="12" value="${state.teamCount}" />
            </label>
          </div>

          <div class="player-list">
            ${state.players
              .map(
                (player, index) => `
                  <div class="player-row">
                    <input data-index="${index}" data-field="name" type="text" value="${player.name}" placeholder="Player name" />
                    <select data-index="${index}" data-field="skill" class="select">
                      ${system.options
                        .map(
                          (option) => `<option value="${option.value}" ${player.skill === option.value ? 'selected' : ''}>${option.label}</option>`,
                        )
                        .join('')}
                    </select>
                    <button class="icon-btn" data-remove-player="${index}" aria-label="Remove player">×</button>
                  </div>
                `,
              )
              .join('')}
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
            <button id="playoffsBtn" class="ghost" ${state.teams.length ? '' : 'disabled'}>Build semifinals</button>
          </div>

          <div class="team-grid">
            ${state.teams
              .map(
                (team) => `
                  <article class="team-card">
                    <div class="team-head">
                      <h3>${team.name}</h3>
                      <span>Rating ${team.totalRating}</span>
                    </div>
                    <ul>
                      ${team.players
                        .map((player) => `<li>${player.name} <span>${skillLabel(player.skill)}</span></li>`)
                        .join('')}
                    </ul>
                    <p class="team-foot">Average rating ${team.averageRating.toFixed(1)}</p>
                  </article>
                `,
              )
              .join('') || '<p class="empty">Generate teams to see the balance chart.</p>'}
          </div>
        </section>

        <section class="panel wide">
          <div class="panel-head">
            <div>
              <p class="section-label">Round Robin</p>
              <h2>Everyone plays everyone</h2>
            </div>
            <span class="badge">${state.matches.length} matches</span>
          </div>

          <div class="match-list">
            ${state.matches.map((match) => renderMatch(match, 'roundRobin')).join('') || '<p class="empty">Generate teams to build the schedule.</p>'}
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
                ${standings
                  .map(
                    (entry) => `
                      <tr>
                        <td>${entry.team.name}</td>
                        <td>${entry.wins}</td>
                        <td>${entry.losses}</td>
                        <td>${entry.scored}</td>
                        <td>${entry.allowed}</td>
                        <td>${entry.diff}</td>
                      </tr>
                    `,
                  )
                  .join('') || '<tr><td colspan="6">No standings yet.</td></tr>'}
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
            ${semifinalCards
              .map((match) => ({ ...match, stage: 'semis' }))
              .map((match) => renderMatch(match, 'semis'))
              .join('') || '<p class="empty">Run round robin results first, then build the top 4 bracket.</p>'}
          </div>
          <div class="final-box">
            ${finalCard ? renderMatch({ ...finalCard, stage: 'final' }, 'final') : '<p class="empty">The final appears after both semifinals have a winner.</p>'}
          </div>
        </section>
      </main>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const skillSystem = document.querySelector('#skillSystem');
  if (skillSystem) {
    skillSystem.addEventListener('change', (event) => {
      state.skillSystem = event.target.value;
      if (state.players.some((player) => !currentSystem().options.some((option) => option.value === player.skill))) {
        state.players = state.players.map((player) => ({ ...player, skill: currentSystem().options[0].value }));
      }
      saveState();
      render();
    });
  }

  const teamCount = document.querySelector('#teamCount');
  if (teamCount) {
    teamCount.addEventListener('change', (event) => {
      state.teamCount = Number(event.target.value) || 2;
      saveState();
      render();
    });
  }

  document.querySelector('#addPlayerBtn')?.addEventListener('click', addPlayer);
  document.querySelector('#generateBtn')?.addEventListener('click', generateTournament);
  document.querySelector('#playoffsBtn')?.addEventListener('click', ensurePlayoffs);
  document.querySelector('#sampleBtn')?.addEventListener('click', samplePlayers);
  document.querySelector('#resetBtn')?.addEventListener('click', resetAll);

  document.querySelectorAll('[data-index]').forEach((element) => {
    element.addEventListener('change', (event) => {
      const index = Number(event.target.dataset.index);
      const field = event.target.dataset.field;
      updatePlayer(index, field, event.target.value);
    });
  });

  document.querySelectorAll('[data-remove-player]').forEach((button) => {
    button.addEventListener('click', (event) => {
      removePlayer(Number(event.currentTarget.dataset.removePlayer));
    });
  });

  document.querySelectorAll('[data-stage]').forEach((element) => {
    element.addEventListener('change', (event) => {
      const target = event.target;
      updateMatch(target.dataset.stage, target.dataset.id, target.dataset.field, target.value);
    });
  });
}

render();
