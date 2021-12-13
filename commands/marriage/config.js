const { MessageEmbed } = require('discord.js');
const TitleModel = require('../../models/Titles');

module.exports = {
    name: 'config-add',
    aliases: ['configadd', 'titleadd', 'settitle', 'title-add', 'set-title'],
    //botPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
    description: 'Add titles to be used when addressing you in relation to others (such as partner, significant other)',
    run: async (message, args, client) => {
        const query = {"User":message.author.id};

        if(args.length < 1) return message.channel.send('You did not specify any title to add!');

        TitleModel.findOne(query, {}).then(async (data) => {
            if(data) {
                //let test = args.join(" ").replace(/ /g, '/')
                let newTitles = await args.join(' ').replace(/ /g, '/').replace(/-/g, ' ');
                await data.delete()
                let newData = await new TitleModel({
                    User: message.author.id,
                    Titles: await data.Titles + '/' + newTitles,
                });
                await newData.save();
                let embed = await new MessageEmbed()
                .setTitle('New Titles Added!')
                .setDescription(`You have added \`${args.length}\` new titles to your list! Please do p!config-remove or p!config-reset to remove titles. If you want a list, p!config-list will provide that!`)
                .setFooter(`Sent to: ${message.author.username}`)
                .setTimestamp();

                await message.channel.send({embeds:[embed]});
            } else if(!data) {
                let newData = await new TitleModel({
                    User: message.author.id,
                    Titles: args.join(' ').replace(/ /g, '/').replace(/-/g, ' '),
                })
                await newData.save()
                let embed = await new MessageEmbed()
                .setTitle('New Titles Added!')
                .setDescription(`You have added \`${args.length}\` new titles to your list! Please do p!config-remove or p!config-reset to remove titles. If you want a list, p!config-list will provide that!`)
                .setFooter(`Sent to: ${message.author.username}`)
                .setTimestamp();

                await message.channel.send({embeds:[embed]});
            }
        })
    }
}