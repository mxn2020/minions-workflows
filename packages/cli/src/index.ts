#!/usr/bin/env node

/**
 * @minions-workflows/cli — CLI for Minions Workflows
 *
 * Uses minions-sdk's JsonFileStorageAdapter for sharded, atomic file storage:
 *   <rootDir>/<id[0..1]>/<id[2..3]>/<id>.json
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
    createMinion,
    updateMinion,
    softDelete,
    generateId,
    TypeRegistry,
} from 'minions-sdk';
import type { Minion } from 'minions-sdk';
import { JsonFileStorageAdapter } from 'minions-sdk/node';
import { customTypes } from '@minions-workflows/sdk';

const program = new Command();
const STORE_DIR = process.env.MINIONS_STORE || '.minions';

// Register custom types
const registry = new TypeRegistry();
for (const t of customTypes) {
    registry.register(t);
}

// Lazily initialize storage (async)
let _storage: any | null = null;
async function getStorage() {
    if (!_storage) {
        _storage = await JsonFileStorageAdapter.create(STORE_DIR);
    }
    return _storage;
}

function findType(slug: string) {
    const type = registry.getBySlug(slug);
    if (!type) {
        console.error(chalk.red(`Unknown type: ${slug}`));
        console.error(chalk.dim(`Available: ${customTypes.map(t => t.slug).join(', ')}`));
        process.exit(1);
    }
    return type;
}

program
    .name('workflows')
    .description('Workflow definitions, step sequences, transitions, and run history')
    .version('0.1.0');

// ─── info ──────────────────────────────────────────────────
program
    .command('info')
    .description('Show project info')
    .action(() => {
        console.log(chalk.bold('Minions Workflows'));
        console.log(chalk.dim('Workflow definitions, step sequences, transitions, and run history'));
        console.log('');
        console.log(`  SDK:    ${chalk.cyan('@minions-workflows/sdk')}`);
        console.log(`  CLI:    ${chalk.cyan('@minions-workflows/cli')}`);
        console.log(`  Python: ${chalk.cyan('minions-workflows')}`);
        console.log(`  Store:  ${chalk.cyan(STORE_DIR)}`);
        console.log(`  Types:  ${chalk.cyan(String(customTypes.length))}`);
    });

// ─── types ─────────────────────────────────────────────────
const types = program.command('types').description('Manage MinionType schemas');

types
    .command('list')
    .alias('ls')
    .description('List all available MinionTypes')
    .action(() => {
        console.log(chalk.bold(`\n  ${customTypes.length} MinionTypes available:\n`));
        for (const type of customTypes) {
            const fieldCount = type.schema.length;
            console.log(`  ${type.icon}  ${chalk.bold(type.name)} ${chalk.dim(`(${type.slug})`)}`);
            console.log(`     ${chalk.dim(type.description || '')}`);
            console.log(`     ${chalk.dim(`${fieldCount} fields: ${type.schema.map(f => f.name).join(', ')}`)}`);
            console.log('');
        }
    });

types
    .command('show <slug>')
    .description('Show detailed schema for a MinionType')
    .action((slug: string) => {
        const type = findType(slug);
        console.log(`\n  ${type.icon}  ${chalk.bold(type.name)}`);
        console.log(`  ${chalk.dim(type.description || '')}`);
        console.log(`  ${chalk.dim(`ID: ${type.id}  Slug: ${type.slug}`)}\n`);
        console.log(chalk.bold('  Fields:\n'));
        for (const field of type.schema) {
            const typeColor = field.type === 'string' ? 'green' : field.type === 'number' ? 'yellow' : field.type === 'boolean' ? 'blue' : 'magenta';
            const req = field.required ? chalk.red('*') : ' ';
            console.log(`    ${req} ${chalk.bold(field.name)}  ${(chalk as any)[typeColor](field.type)}${field.description ? `  ${chalk.dim(field.description)}` : ''}`);
        }
        console.log('');
    });

// ─── create ────────────────────────────────────────────────
program
    .command('create <type>')
    .description('Create a new Minion of the specified type')
    .option('-d, --data <json>', 'Field data as JSON string')
    .option('-f, --file <path>', 'Read field data from a JSON file')
    .option('-t, --title <title>', 'Minion title')
    .option('-s, --status <status>', 'Status: active, todo, in_progress, completed, cancelled')
    .option('-p, --priority <priority>', 'Priority: low, medium, high, urgent')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async (typeSlug: string, opts: any) => {
        const type = findType(typeSlug);
        const storage = await getStorage();

        let fields: Record<string, unknown> = {};
        if (opts.file) {
            const { readFileSync } = await import('fs');
            fields = JSON.parse(readFileSync(opts.file, 'utf-8'));
        } else if (opts.data) {
            fields = JSON.parse(opts.data);
        }

        const title = opts.title || (fields as any).title || (fields as any).name || type.name;
        const tags = opts.tags ? opts.tags.split(',').map((t: string) => t.trim()) : undefined;

        const { minion } = createMinion({
            title,
            fields,
            status: opts.status || 'active',
            priority: opts.priority,
            tags,
            createdBy: 'cli',
        }, type);

        await storage.set(minion);

        console.log(chalk.green(`\n  ✔ Created ${type.icon} ${type.name}`));
        console.log(`  ${chalk.dim('ID:')}    ${minion.id}`);
        console.log(`  ${chalk.dim('Title:')} ${minion.title}`);
        console.log(`  ${chalk.dim('Path:')}  ${STORE_DIR}/${minion.id.replace(/-/g, '').slice(0, 2)}/${minion.id.replace(/-/g, '').slice(2, 4)}/${minion.id}.json`);
        console.log('');
    });

// ─── list ──────────────────────────────────────────────────
program
    .command('list [type]')
    .alias('ls')
    .description('List all Minions, optionally filtered by type')
    .option('--status <status>', 'Filter by status')
    .option('--json', 'Output as JSON')
    .option('-n, --limit <n>', 'Max results', parseInt)
    .action(async (typeSlug: string | undefined, opts: any) => {
        const storage = await getStorage();
        const filter: any = {};
        if (typeSlug) {
            const type = findType(typeSlug);
            filter.minionTypeId = type.id;
        }
        if (opts.status) filter.status = opts.status;
        if (opts.limit) filter.limit = opts.limit;

        const minions = await storage.list(filter);

        if (opts.json) { console.log(JSON.stringify(minions, null, 2)); return; }
        if (minions.length === 0) { console.log(chalk.dim('\n  No Minions found.\n')); return; }

        console.log(chalk.bold(`\n  ${minions.length} Minion(s):\n`));
        for (const m of minions) {
            const type = registry.getById(m.minionTypeId) || registry.getBySlug(m.minionTypeId);
            const icon = type?.icon || '?';
            const status = m.status ? chalk.dim(`[${m.status}]`) : '';
            console.log(`  ${icon}  ${chalk.bold(m.title)} ${status}`);
            console.log(`     ${chalk.dim(m.id)} ${chalk.dim(type?.slug || m.minionTypeId)}`);
        }
        console.log('');
    });

// ─── show ──────────────────────────────────────────────────
program
    .command('show <id>')
    .description('Show a Minion by ID')
    .option('--json', 'Output as JSON')
    .action(async (id: string, opts: any) => {
        const storage = await getStorage();
        const minion = await storage.get(id);

        if (!minion) {
            console.error(chalk.red(`\n  Minion not found: ${id}\n`));
            process.exit(1);
        }

        if (opts.json) { console.log(JSON.stringify(minion, null, 2)); return; }

        const type = registry.getById(minion.minionTypeId) || registry.getBySlug(minion.minionTypeId);
        console.log(`\n  ${type?.icon || '?'}  ${chalk.bold(minion.title)}`);
        console.log(`  ${chalk.dim(`Type: ${type?.slug || minion.minionTypeId}  ID: ${minion.id}`)}`);
        console.log(`  ${chalk.dim(`Status: ${minion.status || '-'}  Priority: ${minion.priority || '-'}`)}`);
        console.log(`  ${chalk.dim(`Created: ${minion.createdAt}  Updated: ${minion.updatedAt}`)}`);
        if (minion.tags?.length) console.log(`  ${chalk.dim(`Tags: ${minion.tags.join(', ')}`)}`);
        console.log(chalk.bold('\n  Fields:\n'));
        for (const [key, value] of Object.entries(minion.fields || {})) {
            console.log(`    ${chalk.dim('•')} ${chalk.bold(key)}: ${value}`);
        }
        console.log('');
    });

// ─── update ────────────────────────────────────────────────
program
    .command('update <id>')
    .description('Update fields on an existing Minion')
    .option('-d, --data <json>', 'Fields to update as JSON')
    .option('-s, --status <status>', 'Update status')
    .option('-p, --priority <priority>', 'Update priority')
    .option('-t, --title <title>', 'Update title')
    .option('--tags <tags>', 'Replace tags (comma-separated)')
    .action(async (id: string, opts: any) => {
        const storage = await getStorage();
        const existing = await storage.get(id);
        if (!existing) {
            console.error(chalk.red(`\n  Minion not found: ${id}\n`));
            process.exit(1);
        }

        const updates: any = {};
        if (opts.data) updates.fields = { ...existing.fields, ...JSON.parse(opts.data) };
        if (opts.status) updates.status = opts.status;
        if (opts.priority) updates.priority = opts.priority;
        if (opts.title) updates.title = opts.title;
        if (opts.tags) updates.tags = opts.tags.split(',').map((t: string) => t.trim());

        const typeDef = registry.getById(existing.minionTypeId) || registry.getBySlug(existing.minionTypeId);
        if(!typeDef) { console.error(chalk.red(`\n  Minion type not found: ${existing.minionTypeId}\n`)); process.exit(1); }
        const { minion: updated } = updateMinion(existing, { ...updates, updatedBy: 'cli' }, typeDef);
        await storage.set(updated);

        const type = registry.getById(updated.minionTypeId) || registry.getBySlug(updated.minionTypeId);
        console.log(chalk.green(`\n  ✔ Updated ${type?.icon || '?'} ${updated.title}`));
        for (const [key, value] of Object.entries(updates)) {
            if (key === 'fields') {
                for (const [fk, fv] of Object.entries(value as any)) {
                    console.log(`    ${chalk.dim('•')} fields.${fk} → ${fv}`);
                }
            } else {
                console.log(`    ${chalk.dim('•')} ${key} → ${value}`);
            }
        }
        console.log('');
    });

// ─── delete ────────────────────────────────────────────────
program
    .command('delete <id>')
    .description('Soft-delete a Minion (set deletedAt timestamp)')
    .option('--hard', 'Permanently remove the file from disk')
    .action(async (id: string, opts: any) => {
        const storage = await getStorage();
        const existing = await storage.get(id);
        if (!existing) {
            console.error(chalk.red(`\n  Minion not found: ${id}\n`));
            process.exit(1);
        }

        if (opts.hard) {
            await storage.delete(id);
            console.log(chalk.yellow(`\n  🗑  Permanently deleted ${id}\n`));
        } else {
            const deleted = softDelete(existing, 'cli');
            await storage.set(deleted);
            console.log(chalk.yellow(`\n  ✔ Soft-deleted ${existing.title}`));
            console.log(chalk.dim(`    Use --hard to permanently remove\n`));
        }
    });

// ─── search ────────────────────────────────────────────────
program
    .command('search <query>')
    .description('Full-text search across all Minions')
    .option('--json', 'Output as JSON')
    .action(async (query: string, opts: any) => {
        const storage = await getStorage();
        const results = await storage.search(query);

        if (opts.json) { console.log(JSON.stringify(results, null, 2)); return; }
        if (results.length === 0) { console.log(chalk.dim(`\n  No results for "${query}".\n`)); return; }

        console.log(chalk.bold(`\n  ${results.length} result(s) for "${query}":\n`));
        for (const m of results) {
            const type = registry.getById(m.minionTypeId) || registry.getBySlug(m.minionTypeId);
            const icon = type?.icon || '?';
            const status = m.status ? chalk.dim(`[${m.status}]`) : '';
            console.log(`  ${icon}  ${chalk.bold(m.title)} ${status}`);
            console.log(`     ${chalk.dim(m.id)} ${chalk.dim(type?.slug || m.minionTypeId)}`);
        }
        console.log('');
    });

// ─── validate ──────────────────────────────────────────────
program
    .command('validate <file>')
    .description('Validate a JSON file against its MinionType schema')
    .action(async (file: string) => {
        const { readFileSync } = await import('fs');
        const { validateFields } = await import('minions-sdk');
        const data = JSON.parse(readFileSync(file, 'utf-8')) as Minion;
        const type = registry.getById(data.minionTypeId) || registry.getBySlug(data.minionTypeId);

        if (!type) {
            console.error(chalk.red(`\n  Unknown type: ${data.minionTypeId}\n`));
            process.exit(1);
        }

        const result = validateFields(data.fields, type.schema);
        if (result.valid) {
            console.log(chalk.green(`\n  ✔ Valid ${type.icon} ${type.name}\n`));
        } else {
            console.log(chalk.red(`\n  ✘ ${result.errors.length} validation error(s):\n`));
            for (const err of result.errors) {
                console.log(`    ${chalk.red('•')} ${err.field}: ${err.message}`);
            }
            console.log('');
            process.exit(1);
        }
    });

// ─── stats ─────────────────────────────────────────────────
program
    .command('stats')
    .description('Show statistics about stored Minions')
    .action(async () => {
        const storage = await getStorage();
        console.log(chalk.bold('\n  Minion Statistics:\n'));

        let total = 0;
        for (const type of customTypes) {
            const minions = await storage.list({ minionTypeId: type.id });
            const count = minions.length;
            total += count;
            const bar = chalk.cyan('█'.repeat(Math.min(count, 30)));
            console.log(`  ${type.icon}  ${(type.name || '').padEnd(22)} ${String(count).padStart(4)}  ${count > 0 ? bar : chalk.dim('0')}`);
        }
        console.log(`\n  ${chalk.bold('Total:')} ${total} Minion(s)`);
        console.log(`  ${chalk.dim(`Store: ${STORE_DIR}`)}\n`);
    });

program.parse();
