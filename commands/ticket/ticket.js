const { Client, Message } = require('discord.js')

module.exports = {
    name : 'ticket',
    /**
     * @param {Client} client
     * @param {Message} message
     */
    run : async(client, message) => {
        const ch = message.guild.channels.cache.find(ch => ch.name === message.author.id)
        if(ch) return message.channel.send('You already have a ticket open.')
        message.guild.channels.create(`${message.author.id}`, {
            type : 'text',
            parent : '829582353872977940',
            permissionOverwrites : [
                {
                    id : message.guild.id,
                    deny : ['VIEW_CHANNEL', 'SEND_MESSAGES']
                },
                {
                    id : message.author.id,
                    allow : ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'ATTACH_FILES']
                }
            ]
        }).then(async channel=> {
            message.reply(`click <#${channel.id}> to view your ticket`).then(m => m.delete({ timeout : 5000 }))
            channel.send(`${message.author}, welcome to your ticket!`)
        })
    }
}