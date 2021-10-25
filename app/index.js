const express = require('express');

const ENV_DEV = 'development';
const ENV_PROD = 'production';

const {
	ENV = ENV_PROD,
	PORT = 3000,
} = process.env;

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

