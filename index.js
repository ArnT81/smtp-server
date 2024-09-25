require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer')
const { PORT, SSL_KEY, SSL_CERT } = process.env;
const origin = __dirname.includes('Desktop') ? 'http://127.0.0.1:5500' : 'https://www.yourwebsite.com';

app.use(express.json());
app.use(cors({
	origin: origin,
	methods: ['GET']
}));


let documentation = {
	info: "This server uses nodemailer to dynamically creates an smtp-connection with the https://nodemailer.com/ library",
	documentation: "This server requires you to append the mail-property to the settings object",
	OBS: "Never expose your username or password",
	example: {
		settings: {
			service: "hotmail",
			host: "smtp.office365.com",
			port: 587, //587
			secure: false,
			auth: {
				user: 'username',
				pass: 'password',
			},
			mail: {
				from: '"Example" <example@mail.com>',
				to: "Reciever",
				subject: "Subject",
				html: "<p>The content of the mail</p>"
			}
		},
		request: { method: "POST", headers: { "Content-type": "application/json" }, body: "JSON.stringify(settings)" }
	}
}


app.get('/', (req, res) => {
	res.json(documentation)
});


app.post('/', (req, res) => {
	try {
		const mailSettings = req.body.mail;
		delete req.body.mail;
		const transporter = nodemailer.createTransport(req.body);

		(async () => {
			const info = await transporter.sendMail(mailSettings);
			res.send(info);
		})()?.catch(error => {
			res.status(500).send(error);
		});

	} catch (error) {
		res.status(500).json({ message: "Something went wrong with the server" });
	}
})


if (__dirname.includes('Desktop')) app.listen(PORT, () => console.log('Server started on port', PORT));
else {
	const sslServer = https.createServer({
		key: fs.readFileSync(SSL_KEY),
		cert: fs.readFileSync(SSL_CERT),
	}, app)
	sslServer.listen(PORT, () => console.log('Secure server started on port', PORT));
};