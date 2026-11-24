#!/usr/bin/env node

import { runTemplateCLI } from 'bingo';
import type { Template } from 'bingo';

import template from '../src/template.ts';

// `runTemplateCLI` is not generic over the options shape and only accepts the
// broad `Template` type. `createTemplate()` returns a narrower, strongly typed
// template, so cast through `unknown` to bridge bingo's incompatible generics.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
process.exitCode = await runTemplateCLI(template as unknown as Template);
