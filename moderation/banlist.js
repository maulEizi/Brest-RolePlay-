client.on('messageCreate', async (message) => {
    // Ignore les messages du bot et ceux qui ne commencent pas par le préfixe
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Extraire la commande et les arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Commande banlist
    if (command === 'banlist') {
        try {
            // Vérifier les permissions
            if (!message.member.permissions.has('BAN_MEMBERS')) {
                return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
            }

            // Récupérer la liste des bannissements
            const banList = await message.guild.bans.fetch();

            if (banList.size === 0) {
                return message.reply('Aucun utilisateur n\'est actuellement banni.');
            }

            // Formater la liste des utilisateurs bannis
            const banInfo = banList
                .map(ban => `**${ban.user.tag}** (ID: ${ban.user.id})`)
                .join('\n');

            // Répondre avec la liste
            return message.channel.send(`Liste des utilisateurs bannis :\n${banInfo}`);
        } catch (error) {
            console.error('Erreur lors de la récupération des bannissements :', error);
            return message.reply('Une erreur est survenue lors de la récupération des bannissements.');
        }
    }
});