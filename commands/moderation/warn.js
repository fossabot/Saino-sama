const db = require('../../models/warns');
const db2 = require('../../models/Guild');
const User = require('../../models/User');
const { Client, Message, MessageEmbed, Guild } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    name :'warn',
    description:'Memberikan warning kepada member',
    cooldown:5,
    /**
     * @param {Message} message
     */
    run : async(client, message, args) => {
        if(!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('You do not have permissions to use this command.').then(m => m.delete({ timeout : 5000 }))
        const user = message.mentions.members.first() || message.guild.members.cache.get(args[0])
        if(!user) return message.channel.send('User not found.').then(m => m.delete({ timeout : 5000 }))
        const reason = args.slice(1).join(" ")
        db.findOne({ guildid: message.guild.id, user: user.user.id}, async(err, data) => {
            if(err) throw err;
            if(!data) {
                data = new db({
                    guildid: message.guild.id,
                    user : user.user.id,
                    content : [
                        {
                            moderator : message.author.id,
                            reason : reason
                        }
                    ]
                })
            } else {
                const obj = {
                    moderator: message.author.id,
                    reason : reason
                }
                data.content.push(obj)
            }
            data.save()
        });

        let target = await User.findOne({
			guildID: message.guild.id,
			userID: user.user.id,
		});

        if (!target) return bot.nodb(member.user);

        //MODLOG DATA CHANNEL
        let data2 =  await db2.findOne({
            guildID: message.guild.id
        });

        // HITUNGAN DENDA/FINED
        const fmin = data2.fined.min
        const fmax = data2.fined.max
        let rand = Math.floor(Math.random() * (fmax - fmin + 1) + fmin);
        target.money -= rand;
        target.warn++;
		target.save();

        const modnickname = message.author.username
        const guildname = message.member.guild.name

        user.send(new MessageEmbed()
            .setTitle(`Kamu mendapatkan Warning di server ${guildname}`)
            .setDescription(`Tolong untuk mengikuti peraturan server yang berlaku agar terhindar dari kesalahan dan dapat menyebabkan kamu dikeluarkan dari server ${guildname}`)
            .addField("Moderator", modnickname)
            .addField("Denda", `Rp. ${rand}`)
            .addField("Alasan", `\`\`\`${reason}\`\`\``)
            .setColor("RED")
            .setTimestamp()
        )
        message.channel.send(new MessageEmbed()
            .setDescription(`Warned ${user} for ${reason}`).setColor('BLUE')
            .addField("Denda", `Rp. ${rand}`)
            .setTimestamp()
        ).then(d => d.delete({ timeout : 20000 }))

        const modlog = client.channels.cache.get(data2.modlogChannel);
        let e = new MessageEmbed()
        .setAuthor(`NEW WARN | ${user.user.tag}`)
        .setColor("BLUE")
        .addField("User", user, true)
        .addField("Moderator", message.author, true)
        .addField("Alasan", `\`\`\`${reason}\`\`\``)
        .addField("Denda yang diterima", `Rp. ${rand}`)
        .setTimestamp()
        .setFooter(`${message.member.id}`, message.guild.iconURL);
        modlog.send(e);
    }
}