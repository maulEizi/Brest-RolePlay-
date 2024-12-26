const Discord = require("discord.js");
const db = require('quick.db');
const owner = new db.table("Owner");
const cl = new db.table("Color");
const ml = new db.table("modlog");
const config = require("../config");
const p3 = new db.table("Perm3");

module.exports = {
    name: 'banlist',
    usage: 'banlist',
    description: `Affiche la liste des utilisateurs bannis.`,
    async execute(client, message, args) {

        let color = cl.fetch(`color_${message.guild.id}`);
        if (color == null) color = config.bot.couleur;

        if (owner.get(`owners.${message.author.id}`) || 
            config.bot.buyer.includes(message.author.id) || 
            config.bot.funny.includes(message.author.id) === true || 
            message.member.roles.cache.has(p3.get(`perm3_${message.guild.id}`))) {

            try {
                // Récupérer la liste des bannis
                const banList = await message.guild.bans.fetch();

                if (banList.size === 0) {
                    return message.reply("Aucun utilisateur n'est actuellement banni.");
                }

                // Formater la liste des bannis
                const banInfo = banList
                    .map(ban => `**${ban.user.tag}** (ID: ${ban.user.id})`)
                    .join('\n');

                // Envoyer la liste dans un embed
                const embed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle('Liste des utilisateurs bannis')
                    .setDescription(banInfo)
                    .setFooter({ text: `Demandé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                return message.channel.send({ embeds: [embed] });

            } catch (error) {
                console.error("Erreur lors de la récupération des bannissements :", error);
                return message.reply("Une erreur est survenue lors de la récupération des bannissements.");
            }

        } else {
            return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
        }
    }
};