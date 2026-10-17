# Blocklands

A standalone Minecraft-inspired browser sandbox built with Three.js. Original procedural pixel textures; no Minecraft assets or Java client code.

Run `npm install`, then `npm run dev`. Create a world or continue the locally saved world. Click **Enter world** to capture the mouse. `npm run build` creates the static release in `dist`; `npm test` exercises world generation, block targeting, inventory, and crafting.

## Controls

WASD move; mouse look; Space jump/swim; left Shift sneak; left Ctrl sprint; left mouse hold to mine/attack; right mouse place/use/eat; E inventory; 1–9 or wheel hotbar; Q drop; middle click pick block; Esc pause; F3 coordinates. In Creative, double-tap Space to fly, then Space/Shift to ascend/descend.

## Survival update — v2.0

- Real 2×2 hand crafting and 3×3 workbench grids, with shifted/mirrored recipes. The searchable recipe book fills ingredients into the grid; click the output to craft. Closing the inventory returns unused ingredients safely.
- Furnaces have input, fuel, output, and progress. One item takes 8 seconds; coal or charcoal burns for 80 seconds. Logs, planks, and sticks also work as fuel. Logs smelt into charcoal. Furnaces continue while the inventory is open and retain their state in saves.
- Wheat farming: mining grass blocks can drop seeds. Right-click grass or dirt with a hoe, plant seeds on farmland, and harvest ripe wheat. Water within four blocks speeds growth to about two active minutes; dry crops grow more slowly. Crops require open sky. Three wheat craft bread.
- Iron helmet, chestplate, leggings, and boots have dedicated slots, damage reduction, and durability. Right-click held armor or use the inventory armor slots to equip. Armor drops on death and does not prevent drowning or fall damage.
- Creepers approach at night, flash before exploding, defuse when you retreat, and damage nearby blocks. Walls block their fuse detection and protect the player from blast damage. Zombies, pigs, and sheep remain.
- New worlds have Plains, Birch Forest, Highlands, and Desert biomes, with birch/spruce trees, sandstone, and cactus. Existing worlds retain the byte-identical v1 terrain generator and all edits.
- Block corner shading, progressive mining cracks, break/explosion particles, 3D held blocks, and pixel armor indicators.
- Download/import JSON world backups from the pause menu. Creating or importing a world retains the previous save, accessible through **Restore previous world** on the title screen. Downloads are the portable backup; browser storage is still device-local.

## Gameplay

Survival starts with three apples. Punch logs, open E, craft planks, sticks, and a table. Place the table and right-click it for tools and building recipes. Pickaxes unlock stone, coal, iron, and diamond. Place and use a furnace to smelt with fuel. Pigs provide food; sheep provide wool for beds. Chests store items. Beds set your respawn point and skip night. Zombies appear at night and burn in daylight. Sneaking prevents walking off ledges. Swimming, drowning, fall damage, hunger, regeneration, tool wear, death drops, and respawn are implemented.

The seeded world measures 160 × 160 blocks and 64 blocks high, with trees, river, underground caves, ores, clouds, and a 20-minute day/night cycle. Creative provides an unlimited item catalog and flight. Local browser storage saves the most recent world every 20 seconds and when leaving; a new world replaces that save only after the Create button is used. Inventory and containers are saved with block edits, mobs, player stats, and position.

## Scope

This is an independent browser interpretation of the core sandbox loop, not the full Minecraft Java game. It uses a finite world and a supported subset of shaped crafting recipes. It does not implement multiplayer, redstone, dimensions, enchanting, all blocks/mobs, fluid simulation, or Minecraft file compatibility. Terrain collision uses an exact grid-aligned player AABB suited to mutable voxel terrain, with substeps and ledge checks. Runs best in a desktop browser with mouse capture and hardware acceleration.

## Verification

`npm test` covers terrain/save compatibility, voxel traversal, survival movement and interactions, every crafting pattern, furnace timing, farming, armor, creepers, and backup validation. With the dev server running, `npm run test:browser` checks real keyboard/mouse interaction, crafting grids, equipment, timed smelting, backup download/import, inventory transfers, and screenshots at desktop and compact sizes. Run `npx playwright install chromium` first if the browser is not installed. New visual fixtures are in ignored `test-results/v2-*.png`.
