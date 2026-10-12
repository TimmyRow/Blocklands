# Blocklands

A standalone Minecraft-inspired browser sandbox built with Three.js. Original procedural pixel textures; no Minecraft assets or Java client code.

Run `npm install`, then `npm run dev`. Create a world or continue the locally saved world. Click **Enter world** to capture the mouse. `npm run build` creates the static release in `dist`; `npm test` exercises world generation, block targeting, inventory, and crafting.

## Controls

WASD move; mouse look; Space jump/swim; left Shift sneak; left Ctrl sprint; left mouse hold to mine/attack; right mouse place/use/eat; E inventory; 1–9 or wheel hotbar; Q drop; middle click pick block; Esc pause; F3 coordinates. In Creative, double-tap Space to fly, then Space/Shift to ascend/descend.

## Gameplay

Survival starts with three apples. Punch logs, open E, craft planks, sticks, and a table. Place the table and right-click it for tools and building recipes. Pickaxes unlock stone, coal, iron, and diamond. Place and use a furnace to smelt with coal. Pigs provide food; sheep provide wool for beds. Chests store items. Beds set your respawn point and skip night. Zombies appear at night and burn in daylight. Sneaking prevents walking off ledges. Swimming, drowning, fall damage, hunger, regeneration, tool wear, death drops, and respawn are implemented.

The seeded world measures 160 × 160 blocks and 64 blocks high, with trees, river, underground caves, ores, clouds, and a 20-minute day/night cycle. Creative provides an unlimited item catalog and flight. Local browser storage saves the most recent world every 20 seconds and when leaving; a new world replaces that save only after the Create button is used. Inventory and containers are saved with block edits, mobs, player stats, and position.

## Scope

This is an independent browser interpretation of the core sandbox loop, not the full Minecraft Java game. It uses a finite world and recipe buttons rather than Minecraft's exact crafting grid. It does not implement multiplayer, redstone, dimensions, enchanting, all blocks/mobs, or Minecraft file compatibility. Terrain collision uses an exact grid-aligned player AABB suited to mutable voxel terrain, with substeps and ledge checks. Runs best in a desktop browser with mouse capture and hardware acceleration.
