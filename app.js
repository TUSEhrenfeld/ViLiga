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
      setsFor: 0,
      setsAgainst: 0,
      setDiff: 0
    };
  });

  data.matches.forEach(m => {
    if (m.scoreA === null || m.scoreB === null) return;

    stats[m.teamA].games++;
    stats[m.teamB].games++;

    stats[m.teamA].setsFor += m.scoreA;
    stats[m.teamA].setsAgainst += m.scoreB;

    stats[m.teamB].setsFor += m.scoreB;
    stats[m.teamB].setsAgainst += m.scoreA;

    // Punktevergabe (Volleyball-Regel)
    if (m.scoreA === 3 && m.scoreB === 2) {
      stats[m.teamA].points += 2;
      stats[m.teamB].points += 1;
    } else if (m.scoreB === 3 && m.scoreA === 2) {
      stats[m.teamB].points += 2;
      stats[m.teamA].points += 1;
    } else if (m.scoreA > m.scoreB) {
      stats[m.teamA].points += 2;
    } else {
      stats[m.teamB].points += 2;
    }
  });

  // Satzdifferenz berechnen
  Object.values(stats).forEach(s => {
    s.setDiff = s.setsFor - s.setsAgainst;
  });

  // Sortierung: Punkte → Satzdifferenz → gewonnene Sätze
  const sorted = Object.entries(stats).sort((a, b) => {
    if (b[1].points !== a[1].points) return b[1].points - a[1].points;
    if (b[1].setDiff !== a[1].setDiff) return b[1].setDiff - a[1].setDiff;
    return b[1].setsFor - a[1].setsFor;
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
        <td>${s.setDiff}</td>
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
