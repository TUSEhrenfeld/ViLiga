let leagueData;

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    leagueData = data;
    updateView();
  });

function updateView() {
  buildTable(leagueData);
  buildMatchdays(leagueData);
}

/* =========================
   TABELLE
========================= */
function buildTable(data) {
  const stats = {};

  data.teams.forEach(team => {
    stats[team] = {
      games: 0,
      points: 0,
      setsWon: 0
    };
  });

  data.matches.forEach(m => {
    if (m.scoreA === null || m.scoreB === null) return;

    stats[m.teamA].games++;
    stats[m.teamB].games++;

    stats[m.teamA].setsWon += m.scoreA;
    stats[m.teamB].setsWon += m.scoreB;

    if (m.scoreA > m.scoreB) stats[m.teamA].points += 2;
    else stats[m.teamB].points += 2;
  });

  const sorted = Object.entries(stats)
    .sort((a, b) => {
      if (b[1].points !== a[1].points) return b[1].points - a[1].points;
      return b[1].setsWon - a[1].setsWon;
    });

  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = '';

  sorted.forEach(([team, s], i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${team}</td>
        <td>${s.games}</td>
        <td>${s.points}</td>
        <td>${s.setsWon}</td>
      </tr>`;
  });
}

/* =========================
   SPIELTAGE
========================= */
function buildMatchdays(data) {
  const container = document.getElementById('matchdays');
  container.innerHTML = '';

  data.matches.forEach(m => {
    container.innerHTML += `
      <p>
        Spieltag ${m.matchday}:
        <strong>${m.teamA}</strong> ${m.scoreA ?? '-'} : ${m.scoreB ?? '-'} <strong>${m.teamB}</strong>
      </p>`;
  });
}
