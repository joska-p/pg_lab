#!/usr/bin/env node

import { runTemplateCLI } from 'bingo';
import type { Template } from 'bingo';

import template from '../src/template.ts';

// runTemplateCLI accepts the base `Template` type, which is wider than the
// strongly typed template returned by createTemplate(). The value is created locally by
// createTemplate(), so the cast only bridges bingo's incompatible generic parameters.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
process.exitCode = await runTemplateCLI(template as unknown as Template);
