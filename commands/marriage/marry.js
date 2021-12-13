const { MessageEmbed } = require('discord.js');
const Titles = require('../../models/Titles');
const RM = require('../../models/Relationships');
const Relationships = require('../../models/Relationships');

module.exports = {
    name: 'ask',
    aliases: ['propose', 'marry', 'p', 'a', 'm', 'partner'],
    //botPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    run: async (message, args, client) => {
        const User = message.mentions.users.first();
        if (!User) return message.channel.send('You need to mention a user!').catch(() => { return; });
        if (User.id === message.author.id) return message.channel.send('You can\'t mention yourself!').catch(() => { return; });
        const author = { "User": message.author.id };
        const asked = { "User": User.id };

        await RM.findOne(asked, {}).then(async data => {
            if(!data) {
                const sampleData = await new Relationships({
                    User: User.id,
                    Spouses: []
                });
                message.reply('Due to absence of the asked user\'s data, a sample set has been loaded! Please run the command again.').catch(() => {return;});
                return sampleData.save();
            }
        }).catch(e => {return console.log(e);});
        await RM.findOne(author, {}).then(async data => {
            if(!data) {
                const sampleData = await new Relationships({
                    User: message.author.id,
                    Spouses: []
                });
                message.reply('Due to absence of the author user\'s data, a sample set has been loaded! Please run the command again.').catch(() => {return;});
                return sampleData.save();
            }
        }).catch(e => {return console.log(e);});

        await RM.findOne(author, {}).then(async (authorData) => {
            await RM.findOne(asked, {}).then(async (askedData) => {
                const firstIndex = await authorData.Spouses.findIndex(test => {
                    return test.Spouse === askedData.User
                });
                if (firstIndex > -1) {
                    return Titles.findOne(asked, {}).then(data => {
                        return message.reply(`You are already in a relationship with ${User.username}, they are your ${(!data || !data.Titles) ? 'partner' : data.Titles}!`)
                    }).catch((e) => {
                        console.log(e);
                        return message.reply('Error finding titles for the mentioned user, sorry!');
                    });
                }

                let embed = await new MessageEmbed()
                    .setTitle('Proposal!')
                    .setDescription(`${User.username}, do you want to enter a relationship with ${message.author.username}!`);

                let msg = await message.reply({ embeds: [embed] }).catch(() => { return; });

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
                    return ['✅', '❎'].includes(reaction.emoji.name) && sent.id === User.id;
                }

                await msg.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(async (collected) => {
                    var Reaction = collected.first()._emoji;

                    if (Reaction.name === '✅') {
                        if (askedData) {
                            await askedData.Spouses.unshift({
                                Spouse: message.author.id,
                                SpouseUsername: message.author.username,
                            })
                            await askedData.save();
                        } else {
                            let newData = await new Relationships({
                                User: User.id,
                                Spouses: [{
                                    Spouse: message.author.id,
                                    SpouseUsername: message.author.username,
                                }]
                            });
                            await newData.save();
                        }
                        if (authorData) {
                            await authorData.Spouses.unshift({
                                Spouse: User.id,
                                SpouseUsername: User.username,
                            })
                            await authorData.save();
                        } else {
                            let newData = await new Relationships({
                                User: message.author.id,
                                Spouses: [{
                                    Spouse: User.id,
                                    SpouseUsername: User.username,
                                }]
                            });
                            await newData.save();
                        }
                        await Titles.findOne(async (titleData) => {
                            await message.channel.send(`${User.username} is now your ${(!titleData || titleData.Titles.length > 0) ? 'partner' : titleData.Titles}! Congratulations ${message.author.username}!`);
                        }).catch(e => {
                            console.log(e);
                            return msg.reply('Error finding title information for the other user, sorry. Error should be fixed within a day!').catch(() => { return; });
                        });
                    } else {
                        return msg.reply(`Sorry ${message.author.username}, but ${User.username} said no :(`).catch(() => { return; });
                    }
                }).catch((e) => {
                    console.log(e);
                    return msg.reply(`Sorry ${message.author.username}, they didn't respond in time!`).catch(() => { return; });
                });
            }).catch(e => {
                console.log(e);
                return message.reply('There was an error fetching that user\'s data! The developer has already received an error report, fixes can take 1 to 3 days.').catch(() => { return; });
            });
        }).catch(e => {
            console.log(e);
            return message.reply(`There was an error fetching your data, the developer has already received the error report. Fixes should take 1 to 3 days!`).catch(() => { return; });
        });
    }
}