const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const db = require('quick.db');
const cl = new db.table('Color');
const ml = new db.table('modlog');
const config = require('../config');

module.exports = {
    name: 'formulaire',
    usage: 'formulaire [ID]',
    description: `Crée un formulaire auquel les membres peuvent répondre.`,
    async execute(client, message, args) {
        let color = cl.fetch(`color_${message.guild.id}`);
        if (!color) color = config.bot.couleur;

        // Vérifier les permissions de l'auteur
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return message.reply("Vous n'avez pas la permission de créer un formulaire.");
        }

        // Vérifier si un ID est fourni
        const formId = args[0];
        if (!formId) {
            return message.reply("Veuillez fournir un ID pour le formulaire.");
        }

        // Création du bouton
        const button = new ButtonBuilder()
            .setCustomId(`form_${formId}`)
            .setLabel('Répondre au formulaire')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        // Envoyer un message avec le formulaire
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`Formulaire : ${formId}`)
            .setDescription("Appuyez sur le bouton ci-dessous pour répondre à ce formulaire.")
            .setFooter({ text: `Créé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        message.channel.send({ embeds: [embed], components: [row] });

        // Réponse pour l'auteur de la commande
        message.reply(`Le formulaire **${formId}** a été créé avec succès.`);
    },
};

// Gestionnaire d'interactions pour répondre au formulaire
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    if (!customId.startsWith('form_')) return;

    const formId = customId.split('_')[1];

    // Créer un modal pour recueillir les réponses
    const modal = new ModalBuilder()
        .setCustomId(`modal_${formId}`)
        .setTitle(`Formulaire : ${formId}`);

    const question1 = new TextInputBuilder()
        .setCustomId('question1')
        .setLabel('Pourquoi voulez-vous rejoindre cette initiative ?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const question2 = new TextInputBuilder()
        .setCustomId('question2')
        .setLabel('Avez-vous de l\'expérience dans ce domaine ?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(question1);
    const row2 = new ActionRowBuilder().addComponents(question2);

    modal.addComponents(row1, row2);

    await interaction.showModal(modal);
});

// Gestionnaire d'interactions pour enregistrer les réponses
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    if (!customId.startsWith('modal_')) return;

    const formId = customId.split('_')[1];

    // Récupérer les réponses
    const answer1 = interaction.fields.getTextInputValue('question1');
    const answer2 = interaction.fields.getTextInputValue('question2');

    // Envoyer les réponses dans le salon de logs
    const logChannelId = ml.get(`${interaction.guild.id}.modlog`);
    const logChannel = interaction.guild.channels.cache.get(logChannelId);

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`Réponse au formulaire : ${formId}`)
        .addFields(
            { name: 'Utilisateur', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Question 1', value: answer1, inline: false },
            { name: 'Question 2', value: answer2, inline: false },
        )
        .setFooter({ text: `Réponse reçue`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    if (logChannel) {
        logChannel.send({ embeds: [embed] });
    } else {
        console.warn("Aucun salon de logs trouvé pour ce serveur.");
    }

    // Confirmer la réception à l'utilisateur
    await interaction.reply({ content: 'Votre réponse a été enregistrée avec succès !', ephemeral: true });
});