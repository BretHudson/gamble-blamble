const express = require('express');
const { Client } = require('pg');

const ENV_DEV = 'development';
const ENV_PROD = 'production';

const {
	ENV = ENV_PROD,
	PORT = 3000,
} = process.env;

const initDatabase = async pgClient => {
	const teamsTableName = 'teams';
	const betsTableName = 'bets';
	
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
	const pgClient = new Client();
	await pgClient.connect();
	
	console.log('Connected to postgres database');
	
	// Initialize database if null
	await initDatabase(pgClient);
	
	const app = express();

	app.route('/bet')
		.get((req, res) => {
			res.send('Here are all the bets!');
		})
		.post((req, res) => {
			res.send('Added bet');
		})
		.delete((req, res) => {
			res.send('Deleted bet');
		});

	app.listen(PORT, () => {
		console.log(`GAMBLE BLAMBLE listening on port ${PORT}`);
	});
})();


