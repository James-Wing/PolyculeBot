const fs = require('fs');
//const Discord = require('discord.js');
const { Intents, Client, Collection, MessageEmbed } = require('discord.js');
const mongoose = require("mongoose");

const config = require('./config.json');
let prefix = config.prefix;
let token = config.token;
let devID = config.devID;
let mongo = config.mongo;

const myIntents = new Intents();
myIntents.add([Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS])

const client = new Client({
	intents: myIntents,
})

/*const client = new Discord.Client({
	//intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS],
	intents: myIntents,
});*/
client.commands = new Collection();
client.cooldowns = new Collection();

mongoose.connect(mongo, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
});

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

client.once('ready', () => {
	console.log('ready!');
});

client.on('messageCreate', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.ownerOnly === true && message.author.id !== devID) {
		return message.reply('you must be the bot developer to use this command.')
	};

	if (command.guildOnly === true && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.reply('You can not do this!');
		}
	}

	if (command.botPermissions) {
		const botPerms = message.channel.permissionsFor(message.guild.members.resolve(client.user));
		if (!botPerms || !botPerms.has(command.permissions)) {
			return message.reply('I do not have permission to perform this command!').catch(async () => { message.author.send('I do not have permission to speak in that channel.').catch(async () => {return;}); });
		}
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	const { cooldowns } = client;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.run(message, args, client);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});
/*client.on('messageCreate', async (message) => {
	if(message.content === 'p!announce') {
		if(message.author.id === '449332956474114048') {
			const guildArray = await client.guilds.cache.array();
			for (const G of guildArray) {
				await client.users.fetch(G.ownerId).then(async u => {
					await u.send(message.content).catch(err => {return console.log(err)});
				}).catch(() => {return;});
			}
		} else {
			return;
		}
	} else {
		return;
	}
})*/

client.login(token)