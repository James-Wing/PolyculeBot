const { MessageEmbed } = require('discord.js');
const Family = require('../../models/Relationships.js');
const Relationships = require('../../models/Relationships.js');

module.exports = {
    name: 'tree',
    aliases: ['relationships', 'chart', 'spouses', 'partner', 'partners', 'spouse', 'so', 'sos'],
    description: 'Maps out all of your relations',
    //botPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    run: async (message, args, client) => {
        let target = message.mentions.users.first();

        //If no one is pinged, execute code
        if (!target) {
            let queryA = { "User": message.author.id }

            Relationships.findOne(queryA, {}).then(async (polyculeA) => {
                //await console.log(polyculeA)
                if (!polyculeA) {
                    await message.channel.send('You have no relationships!').catch(err => { return; });
                }

                if (polyculeA.Spouses.length == 0) {
                    await message.channel.send('You have no relationships!').catch(err => { return; });
                }

                let objArr = [];
                let otherArr = [];

                async function returnFamilyMap(ID) {
                    return client.users.fetch(ID).then(async U => {
                        return U.username, objArr.push(U.username)
                    }).catch(async err => {
                        await console.log(err)
                        return;
                    })
                }

                async function subset(parent) {
                    let arr = [];
                    //await console.log(parent);
                    return Family.findOne({ "User": parent }, {}).then(async (data) => {
                        //await console.log(data.User);
                        if (!data) {
                            await arr.push('test string')
                            return arr;
                        }
                        if (data.Spouses.length == 0) {
                            await arr.push('test string')
                            return arr;
                        }
                        for (let key of data.Spouses) {
                            await client.users.fetch(key.Spouse).then(async U => {
                                await arr.push(U.username);
                            })
                            if (arr.length == data.Spouses.length) {
                                return arr;
                            }
                        }
                    }).catch(async err => { await console.log(err); return; })
                }

                let newArr = [];

                for (let bruh of polyculeA.Spouses) {
                    //await console.log(bruh.Spouse);
                    await subset(bruh.Spouse).then(async result => {
                        await console.log(result);
                        for (let r of result) {
                            if (r !== 'test string') {
                                await otherArr.push(r);
                            }
                        }
                        //await objArr.push(r);
                        //await console.log(result);
                    })
                    //await console.log(otherArr);
                    newArr = [...new Set(otherArr)]
                    let index = await newArr.indexOf(message.author.username);
                    if (index > -1) {
                        await newArr.splice(index, 1);
                    }
                    //await console.log(newArr);
                }

                for (let key of polyculeA.Spouses) {
                    await returnFamilyMap(key.Spouse).then(async function (result) {
                        if (objArr.length === polyculeA.Spouses.length) {
                            let embed = new MessageEmbed()
                                .setDescription('**__Relationships:__** \n' + objArr.join("\n"))
                                .setFooter(`Mutual relationships:\n` + newArr.join("\n"))
                            await message.channel.send({ embeds: [embed] }).catch(async err => {
                                await message.author.send({ embeds: [embed] }).catch(e => { return; });
                            });
                        }
                    })
                }
            }).catch(async ouch => {
                if (ouch.message !== "Cannot read property 'Spouses' of null") {
                    await console.log(ouch)
                    await message.channel.send('There was an error running this command!').catch(async yikes => {
                        await message.author.send('There was an error running this command!').catch(e => { return; });
                    });
                };
            });
        } if (target) {
            let queryA = { "User": target.id }

            Relationships.findOne(queryA, {}).then(async (polyculeA) => {
                if (!polyculeA) {
                    return message.channel.send('That user has no relationships!').catch(err => { return; });
                }
                if (polyculeA.Spouses.length == 0) {
                    await message.channel.send('That user has no relationships!').catch(err => { return; });
                }
                //await console.log(polyculeA)
                let objArr = [];
                let otherArr = [];

                async function returnFamilyMap(ID) {
                    return client.users.fetch(ID).then(async U => {
                        return U.username, objArr.push(U.username)
                    }).catch(err => {
                        console.log(err)
                        return;
                    })
                }

                async function subset(parent) {
                    let arr = [];
                    //await console.log(parent);
                    return Family.findOne({ "User": parent }, {}).then(async (data) => {
                        //await console.log(data.User);
                        if (!data) {
                            await arr.push('test string')
                            return arr;
                        }
                        if (data.Spouses.length == 0) {
                            await arr.push('test string')
                            return arr;
                        }
                        for (let key of data.Spouses) {
                            await client.users.fetch(key.Spouse).then(async U => {
                                await arr.push(U.username);
                            })
                            if (arr.length == data.Spouses.length) {
                                return arr;
                            }
                        }
                    }).catch(async err => { await console.log(err); return; })
                }

                let newArr = [];

                for (let bruh of polyculeA.Spouses) {
                    //await console.log(bruh.Spouse);
                    await subset(bruh.Spouse).then(async result => {
                        await console.log(result);
                        for (let r of result) {
                            if (r !== 'test string') {
                                await otherArr.push(r);
                            }
                        }
                        //await objArr.push(r);
                        //await console.log(result);
                    })
                    //await console.log(otherArr);
                    newArr = [...new Set(otherArr)]
                    let index = await newArr.indexOf(target.username);
                    if (index > -1) {
                        await newArr.splice(index, 1);
                    }
                    //await console.log(newArr);
                }

                for (let key of polyculeA.Spouses) {
                    await returnFamilyMap(key.Spouse).then(async function (result) {
                        if (objArr.length === polyculeA.Spouses.length) {
                            let embed = new MessageEmbed()
                                .setDescription('**__Relationships:__** \n' + objArr.join("\n"))
                                .setFooter(`Mutual relationships:\n` + newArr.join("\n"))
                            await message.channel.send({ embeds: [embed] }).catch(async err => {
                                await message.author.send({ embeds: [embed] }).catch(e => { return; });
                            });
                        }
                    })
                }
            }).catch(async ouch => {
                if (ouch.message !== "Cannot read property 'Spouses' of null") {
                    await console.log(ouch)
                    await message.channel.send('There was an error running this command!').catch(async yikes => {
                        await message.author.send('There was an error running this command!').catch(e => { return; });
                    });
                };
            });
        } /*else {
                await message.channel.send('This message should be unreachable, what?').catch(async bruh => {
                    await console.log(bruh);
                    return;
                });
            }*/
    }
}
