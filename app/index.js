console.log('Starting api...');

const express = require('express');
const { Client } = require('pg');

const ENV_DEV = 'development';
const ENV_PROD = 'production';

const {
	ENV = ENV_PROD,
	PORT = 3000,
} = process.env;

const teamsTableName = 'teams';
const betsTableName = 'bets';

const initDatabase = async pgClient => {
	await pgClient.query(
		`CREATE TABLE IF NOT EXISTS ${teamsTableName} (
			id		SERIAL PRIMARY KEY,
			name	VARCHAR(32) UNIQUE NOT NULL
		)`
	);
	
	const result = await pgClient.query(`SELECT * FROM ${teamsTableName}`);
	if (result.rows.length === 0) {
		await Promise.all([
			'Hellmouth Sunbeams',
			'Charleston Shoe Thieves',
			'Yellowstone Magic',
			'LA Unlimited Tacos',
			'Houston Spies',
			'Miami Dale',
			'Breckenridge Jazz Hands',
			'Kansas City Breath Mints',
			'Hawai\'i Fridays',
			'Chicago Firefighters',
			'Canada Moist Talkers',
			'Ohio Worms',
			'Mexico City Wild Wings',
			'Tokyo Lift',
			'New York Millennials',
			'Philly Pies',
			'Baltimore Crabs',
			'Hades Tigers',
			'Atlantis Georgias',
			'Seattle Garages',
			'Dallas Steaks',
			'Core Mechanics',
			'Boston Flowers',
			'San Francisco Lovers',
		].map(async teamName => {
			const insertQuery = `INSERT INTO ${teamsTableName}(name) VALUES($1)`;
			await pgClient.query(insertQuery, [teamName]);
		}));
	}
	
	await pgClient.query(
		`CREATE TABLE IF NOT EXISTS ${betsTableName} (
			id		SERIAL PRIMARY KEY,
			team_id	INT NOT NULL,
			amount	INT NOT NULL,
			FOREIGN KEY (team_id)
				REFERENCES teams (id)
		)`
	);
};

(async () => {
	const pgClient = new Client({
		statement_timeout: 60e3,
		query_timeout: 60e3,
		connectionTimeoutMillis: 60e3,
	});
	try {
		await pgClient.connect();
	} catch (err) {
		console.log('Connection timeout...');
	}
	
	console.log('Connected to postgres database');
	
	// Initialize database if null
	await initDatabase(pgClient);
	
	const app = express();
	app.use(express.json());

	app.get('/bets', async (req, res) => {
		const allBets = await pgClient.query(`SELECT * FROM ${betsTableName}`);
		res.json(allBets.rows);
	});
	
	app.post('/bet', async (req, res) => {
		const {
			teamId = null,
			amount = null,
		} = req.body;
		
		if ([teamId, amount].some(v => v === null) === true) {
			// We didn't get all the required data from the body
			return res.sendStatus(400);
		}
		
		if (amount <= 0) return res.sendStatus(400);
		
		const teamResult = await pgClient.query(`SELECT * FROM ${teamsTableName} WHERE id = ($1)`, [teamId]);
		
		if (teamResult.rows.length === 0) return res.sendStatus(400);
		
		await pgClient.query(`INSERT INTO ${betsTableName}(team_id, amount) VALUES($1, $2)`, [teamId, amount]);
		
		res.send(`Added bet: $${amount} has been bet on team_id ${teamId}`);
	});
	
	app.delete('/bet/:id', async (req, res) => {
		const {
			id = null,
		} = req.params;
		
		if ((id === null) || (id < 0))
			return res.sendStatus(400);
		
		const result = await pgClient.query(`DELETE FROM ${betsTableName} WHERE id = ($1)`, [id]);
		
		if (result.rowCount === 0)
			return res.sendStatus(400);
		
		res.send(`Deleted bet ${id}`);
	});

	app.listen(PORT, () => {
		console.log(`GAMBLE BLAMBLE listening on port ${PORT}`);
	});
})();


