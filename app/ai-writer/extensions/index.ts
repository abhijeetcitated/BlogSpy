// =============================================================================
// AI WRITER EXTENSIONS - Barrel Export
// =============================================================================

// Slash Commands Extension
export {
  SlashCommandsExtension,
  slashCommandsPluginKey,
  executeSlashCommand,
  type SlashCommandsOptions,
  type SlashCommandsStorage,
  type CommandExecutorOptions,
} from '@/src/features/ai-writer/extensions/slash-commands.extension';

export { default as SlashCommandsExtensionDefault } from '@/src/features/ai-writer/extensions/slash-commands.extension';
