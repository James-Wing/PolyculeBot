const { MessageEmbed } = require('discord.js');
const RM = require('../../models/Relationships.js');
const Titles = require('../../models/Titles');

module.exports = {
    name: 'end-relationship',
    aliases: ['divorce', 'unpartner', 'end'],
    description: 'Enter a relationship with a mentioned user!',
    //botPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    run: async (message, args, client) => {
        const User = await message.mentions.users.first();
        if (!User) return message.reply(`You need to mention a user!`).catch(() => { return; });

        const author = { "User": message.author.id };
        const asked = { "User": User.id };

        await RM.findOne(author, {}).then(async (authorData) => {
            if (!authorData) return message.reply(`You aren't in any relationships!`).catch(() => { return; });
            await RM.findOne(asked, {}).then(async (askedData) => {
                if (!askedData) return message.reply(`${User.username} isn't in any relationships!`).catch(() => { return; });

                const index = authorData.Spouses.findIndex(test => {
                    return test.Spouse === askedData.User
                });

                console.log(index);

                if (index == -1) return message.reply(`${User.username} isn't in any relationship with you!`).catch(() => { return; });

                const endEmbed = new MessageEmbed()
                    .setTitle('Confirmation')
                    .setDescription(`Are you sure you want to end your relationship with ${User.username}?`);

                const msg = await message.channel.send({ embeds: [endEmbed] }).catch(() => { return; });

                await msg.react('✅').catch(() => {
                    return msg.reply('I do not have permission to reply to messages!').catch(() => {
                        return;
                    });
                });

                await msg.react('❎').catch(() => {
                    return msg.reply('I do not have permission to reply to messages!').catch(() => {
                        return;
                    });
                });

                const filter = (reaction, sent) => {
                    return ['✅', '❎'].includes(reaction.emoji.name) && sent.id === message.author.id;
                }

                await msg.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected) => {
                    const Reaction = collected.first()._emoji;

                    if (Reaction.name === '✅') {
                        await authorData.Spouses.splice(index, 1);
                        await console.log(authorData);
                        await authorData.save();

                        const askIndex = askedData.Spouses.indexOf(obj => obj.Spouse === message.author.id);

                        await askedData.Spouses.splice(askIndex, 1);
                        await console.log(askedData);
                        await askedData.save();

                        await msg.reply(`You are no longer in a relationship with ${User.username}!`).catch(() => { return; });
                    } else {
                        msg.reply('OK, you are still in a relationship with ' + User.username + '!').catch(() => { return; });
                    }
                }).catch(e => {
                    console.log(e);
                    return msg.reply('You failed to give a reaction, process cancelled!').catch(() => {return;});
                });
            }).catch(e => {
                console.log(e);
                return message.reply('There was an error fetching that user\'s data! The developer has already received an error report, fixes can take 1 to 3 days.').catch(() => {return;});
            });
        }).catch(e => {
            console.log(e);
            return message.reply(`There was an error fetching your data, the developer has already received the error report. Fixes should take 1 to 3 days!`).catch(() => {return;});
        });
    }
}