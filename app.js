const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () =>
      console.log("Server Running at http://localhost:4000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const gettingEachPlayerDetails = (eachPlayer) => {
  return {
    playerId: `${eachPlayer.player_id}`,
    playerName: `${eachPlayer.player_name}`,
  };
};

const gettingMatchDetails = (eachMatch) => {
  return {
    matchId: eachMatch.match_id,
    match: eachMatch.match,
    year: eachMatch.year,
  };
};

const gettingPlayerScore = (getPlayer) => {
  return {
    playerId: getPlayer.player_id,
    playerName: getPlayer.player_name,
    totalScore: getPlayer.total_score,
    totalFours: getPlayer.total_fours,
    totalSixes: getPlayer.total_sixes,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM player_details;
    `;
  const getPlayers = await db.all(getPlayersQuery);
  response.send(
    getPlayers.map((eachPlayer) => gettingEachPlayerDetails(eachPlayer))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
    *
    FROM player_details
    WHERE
    player_id = ${playerId};
    `;
  const getPlayer = await db.get(getPlayerQuery);
  response.send(gettingEachPlayerDetails(getPlayer));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const getPlayerQuery = `
    UPDATE 
    player_details
    SET
    player_name = ${playerName}
    WHERE
    player_id = ${playerId};
    `;
  const getPlayer = await db.run(getPlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT 
    *
    FROM match_details
    WHERE
    match_id = ${matchId};
    `;
  const getMatch = await db.get(getMatchQuery);
  response.send(gettingMatchDetails(getMatch));
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesQuery = `
    SELECT 
    *
    FROM player_details INNER JOIN match_details
    WHERE
    player_id = ${playerId};
    `;
  const getMatch = await db.all(getMatchesQuery);
  response.send(getMatch.map((eachMatch) => gettingMatchDetails(eachMatch)));
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerQuery = `
    SELECT 
    *
    FROM match_details INNER JOIN player_details
    WHERE
    match_id = ${matchId};
    `;
  const getPlayers = await db.all(getPlayersQuery);
  response.send(
    getPlayers.map((eachPlayer) => gettingEachPlayerDetails(eachPlayer))
  );
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoreQuery = `
    SELECT 
    player_id,
    player_name,
    SUM(score) AS total_score,
    SUM(fours) AS total_fours,
    SUM(sixes) AS total_sixes,    
    FROM player_details INNER JOIN player_match_score
    WHERE
    player_id = ${playerId};
    `;
  const getPlayerScore = await db.all(getPlayerScoreQuery);
  response.send(gettingPlayerScore(getPlayerScore));
});

module.exports = app;
