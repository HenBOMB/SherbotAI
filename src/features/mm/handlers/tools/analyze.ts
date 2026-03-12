import {
    ChatInputCommandInteraction,
    TextChannel,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Colors
} from 'discord.js';
import { createToolEmbed } from '../../commands.js';
import GameManager from '../../game.js';
import { TOOL_COSTS } from '../../tools.js';

/**
 * Handle /mm analyze command
 */
export async function handleAnalyze(
    manager: GameManager,
    interaction: ChatInputCommandInteraction
): Promise<void> {
    if (!manager.isParticipant(interaction.user.id)) {
        await interaction.reply({
            content: 'You must join the investigation with `/mm join` before you can use detective tools.',
            ephemeral: true
        });
        return;
    }

    const tools = manager.getTools();
    const activeGame = manager.getActiveGame();

    if (!tools || !activeGame?.isActive()) {
        await interaction.reply({ content: 'No active game.', ephemeral: true });
        return;
    }

    // Try to get item from option or fuzzy match (we can reuse the logic implicitly if we want, but since it's targeted usually we just pass the ID)
    let targetItem = interaction.options.getString('item');
    if (!targetItem) {
        await interaction.reply({ content: 'You must specify an item to analyze.', ephemeral: true });
        return;
    }

    // Let's make targetItem the pure name without prefix for the tool manager
    if (targetItem.startsWith('physical_')) targetItem = targetItem.replace('physical_', '');

    // --- PREREQUISITE CHECK ---
    const missing = manager.getMissingRequirements(targetItem);
    if (missing.length > 0) {
        const hintsEnabled = manager.getActiveGame()!.hints.hasHints();
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGrey)
                    .setTitle('🔐 NOT ENOUGH TO GO ON')
                    .setDescription(`The forensic team reviewed your request but doesn't have enough corroborating evidence to prioritize **${targetItem.replace(/_/g, ' ')}** right now.\n\n*"Come back when you've found something more concrete, detective."*`)
                    .setFooter(hintsEnabled ? { text: 'Tip: Keep searching other locations for related evidence.' } : null)
            ]
        });
        return;
    }

    // --- CHANNEL LOCK CHECK ---
    const channelId = interaction.channelId;
    if (manager.isAnalyzing(channelId)) {
        await interaction.reply({
            content: '⚠️ The mobile forensic unit is already processing a sample in this area. Please wait for them to finish.',
            ephemeral: true
        });
        return;
    }

    // --- POINT DEDUCTION ---
    const cost = TOOL_COSTS.analyze;
    if (!activeGame.usePoints(cost)) {
        await interaction.reply({
            content: `❌ Not enough investigation points (need ${cost}).`,
            ephemeral: true
        });
        return;
    }

    // Lock the channel and start progress
    manager.setAnalyzing(channelId, true);

    const itemName = targetItem.replace(/_/g, ' ').toUpperCase();
    const startTime = Date.now();
    const duration = 5 * 60 * 1000; // 5 minutes
    const updateInterval = 15 * 1000; // 15 seconds

    const icons = ['🧫', '🔍', '🔬', '🧪', '🧤', '🧬', '🖥️', '📊', '🕯️', '💡'];

    const getProgressEmbed = (progress: number) => {
        const barLength = 20;
        const filled = Math.round(progress * barLength);
        const empty = barLength - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        const icon = icons[Math.floor(progress * (icons.length - 1))];

        let visual = '```ansi\n';
        visual += `\u001b[1;35m[ FORWARDING TO FORENSICS: ${itemName} ]\u001b[0m\n`;
        visual += '----------------------------------------\n\n';
        visual += `  \u001b[1;30mStatus:\u001b[0m \u001b[0;33mProcessing Specimens...\u001b[0m\n`;
        visual += `  \u001b[1;30mProgress:\u001b[0m [\u001b[1;34m${bar}\u001b[0m]\n\n`;
        visual += `  ${icon}  \u001b[0;37m"The game is afoot, Detective. Precision takes time."\u001b[0m\n`;
        visual += '\n----------------------------------------\n';
        visual += '```';

        return new EmbedBuilder()
            .setColor(Colors.Purple)
            .setTitle('🔬 Forensic Analysis in Progress')
            .setDescription(visual)
            .setFooter({ text: 'The forensic team will update this report once samples are resolved.' });
    };

    // Initial reply
    await interaction.reply({ embeds: [getProgressEmbed(0)] });

    const interval = setInterval(async () => {
        const elapsed = Date.now() - startTime;
        let progress = elapsed / duration;

        if (progress >= 1.0) {
            progress = 1.0;
            clearInterval(interval);

            // Finalize analysis
            const result = tools.analyze(targetItem, { skipCost: true });
            manager.setAnalyzing(channelId, false);

            if (!result.success) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setTitle('❌ Analysis Failed')
                            .setDescription(`The forensic unit encountered an error: ${result.error}`)
                    ]
                });
                return;
            }

            const rawItem = activeGame.getPhysicalEvidence(targetItem);
            const image = (rawItem && typeof rawItem !== 'string') ? rawItem.image : undefined;
            const resultEmbed = createToolEmbed(
                'analyze',
                targetItem,
                result.result,
                cost,
                result.success,
                result.error,
                { hintEngine: activeGame.hints, image }
            );

            await interaction.editReply({
                embeds: [resultEmbed.embed],
                files: resultEmbed.files
            });

            // Update stats and broadcast
            const stats = manager.getOrCreateStats(interaction.user.id, interaction.user.username);
            stats.toolsUsed++;
            manager.getDashboard().addEvent('tool_use', `Analyzed ${targetItem}`);
            manager.broadcastDashboardState();
            await manager.saveState();

        } else {
            // Update progress bar
            try {
                await interaction.editReply({ embeds: [getProgressEmbed(progress)] });
            } catch (e) {
                // If message was deleted or interaction expired, stop the interval
                clearInterval(interval);
                manager.setAnalyzing(channelId, false);
            }
        }
    }, updateInterval);
}
