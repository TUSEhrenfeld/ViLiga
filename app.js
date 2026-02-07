document.addEventListener("DOMContentLoaded", () => {
  const showError = (msg) => {
    console.error(msg);
    const el = document.getElementById("matchdays");
    if (el) el.innerHTML = `<p style="color:red;font-weight:700;">${msg}</p>`;
  };

  fetch('data.json')
    .then(res => {
      if (!res.ok) throw new Error(`Konnte data.json nicht laden (HTTP ${res.status}). Dateiname/Pfad prüfen!`);
      return res.json();
    })
    .then(data => {
      buildTable(data);
      buildMatchdays(data);
    })
    .catch(err => {
      showError(err.message);
    });

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

      // Schutz: unbekannte Teams finden
      if (!stats[m.teamA]) throw new Error(`Unbekanntes Team in matches: "${m.teamA}" (steht nicht in teams[])`);
      if (!stats[m.teamB]) throw new Error(`Unbekanntes Team in matches: "${m.teamB}" (steht nicht in teams[])`);

      stats[m.teamA].games++;
      stats[m.teamB].games++;

      stats[m.teamA].setsFor += m.scoreA;
      stats[m.teamA].setsAgainst += m.scoreB;

      stats[m.teamB].setsFor += m.scoreB;
      stats[m.teamB].setsAgainst += m.scoreA;

      // Punktevergabe (3:2 => 2:1, sonst 2:0)
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

    Object.values(stats).forEach(s => {
      s.setDiff = s.setsFor - s.setsAgainst;
    });

    const sorted = Object.entries(stats).sort((a, b) => {
      if (b[1].points !== a[1].points) return b[1].points - a[1].points;
      if (b[1].setDiff !== a[1].setDiff) return b[1].setDiff - a[1].setDiff;
      return b[1].setsFor - a[1].setsFor;
    });

    const tbody = document.querySelector('#table tbody');
    if (!tbody) throw new Error('Tabelle nicht gefunden: Es fehlt <table id="table"><tbody>...</tbody></table> in index.html');

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

  function buildMatchdays(data) {
    const container = document.getElementById('matchdays');
    if (!container) throw new Error('Element #matchdays fehlt in index.html');

    container.innerHTML = '';

    const matchdays = {};
    data.matches.forEach(m => {
      if (!matchdays[m.matchday]) matchdays[m.matchday] = [];
      matchdays[m.matchday].push(m);
    });

    Object.keys(matchdays).forEach(day => {
      const dayDiv = document.createElement('div');
      dayDiv.classList.add('matchday');

      const header = document.createElement('h2');
      header.textContent = `Spieltag ${day}`;
      dayDiv.appendChild(header);

      matchdays[day].forEach(m => {
        const p = document.createElement('p');
        p.classList.add('match-result');

        let teamAClass = '';
        let teamBClass = '';
        if (m.scoreA !== null && m.scoreB !== null) {
          if (m.scoreA > m.scoreB) teamAClass = 'winner';
          else if (m.scoreB > m.scoreA) teamBClass = 'winner';
        }

        p.innerHTML = `<strong class="${teamAClass}">${m.teamA}</strong> ${m.scoreA ?? '-'} : ${m.scoreB ?? '-'} <strong class="${teamBClass}">${m.teamB}</strong>`;
        dayDiv.appendChild(p);
      });

      container.appendChild(dayDiv);
    });
  }
});
