import type { ChannelModel } from './types';

/** Depth floor of a shared trunk: `0` = three independent trees. */
export const MIN_SHARE_DEPTH = 0;

/** Compiler default channel model: independent channels in raw sRGB. Grammar always carries its own. */
export const RAW_CHANNELS: ChannelModel = { space: 'srgb', shareDepth: MIN_SHARE_DEPTH };
