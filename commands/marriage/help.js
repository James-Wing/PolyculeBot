const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'help',
    //botPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    run: async (message, args, client) => {
        let helpEmbed = new MessageEmbed()
        .setTitle('Commands')
        .setDescription('`config-add`: add titles to your config.\n`partner`: enter a relationship with a user.\n`tree`: list all users you\'re in a relationship with.\n`unpartner`: end a relationship with a mentioned user.')//.catch(() => {return;});

        message.channel.send({embeds:[helpEmbed]}).catch(err => {
            console.log(err);
            message.author.send('There was an error sending the help embed, however the error was been logged and the developer is working on fixing it. Please try again later!').catch(() => {return;});
        })
    }
}