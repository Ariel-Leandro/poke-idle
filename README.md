# poke-idle

**Poké Idle** is a web game prototype based on **Idle RPG, Auto-Battle, and incremental progression** mechanics.

The project was developed using **HTML5, CSS3, and JavaScript**, exploring automated combat, creature management, progression, inventory systems, and browser-based data persistence.

---

## About the Project

The goal of the project is to create an incremental RPG experience where battles happen automatically while the player manages their team, creatures, resources, and progression.

The core gameplay loop is based on:

**Battle → Reward → Progression → Management → New Battle**

---

## Technologies

- **HTML5**
- **CSS3**
- **JavaScript ES6+**
- **Canvas API**
- **LocalStorage**
- **JSON**

---

## Main Systems

### Auto-Battle System

- Automated real-time combat.
- Combatant speed control.
- Attack cooldown system.
- Automatic move execution.
- Ability priority logic.

### Creature System

The project uses data structures to represent the **151 original Pokémon**, including attributes such as:

- HP
- Attack
- Defense
- Special Attack
- Special Defense
- Speed

These attributes are used throughout progression and combat calculations.

### Type and Damage System

A type-effectiveness matrix was implemented to determine:

- Advantages
- Disadvantages
- Immunities
- Damage multipliers

These relationships are used during battle damage calculations.

### Attack System

Moves have individual characteristics, including:

- Type
- Category
- Power
- Accuracy
- Cooldown
- Additional effects

### Team and Box System

Players can manage their creatures through:

- Active team
- Up to 3 Pokémon simultaneously in battle
- Storage Box
- Creature organization and swapping

### Inventory and Economy

The project also includes systems for:

- Battle drops
- Poké Balls
- Potions
- Resources
- Item shop
- In-game currency

### Data Persistence

Player progress is stored using **LocalStorage**, including:

- Current team
- Creatures
- Inventory
- Resources
- Box state
- Game progress

---

## Interface and HUD

The interface was designed to provide quick access to important information during battles.

Implemented elements include:

- HP bars
- Creature status
- Attack cooldowns
- Battle Log
- Move information
- Team management
- Inventory menus and panels

The **Canvas API** is also used for visual elements and combat-related animations.

---

## Architecture

The project applies concepts such as:

- Object-Oriented Programming
- State management
- Data structures
- DOM manipulation
- Arrays and objects
- JSON
- Game Loop
- Dynamic rendering
- Data persistence

The architecture is designed to separate **creature data, game logic, and interface presentation**, making the systems easier to reuse and maintain.

---

## Technical Challenges

### Auto-Battle Management

Managing multiple attacks and cooldowns simultaneously required a time-based control structure capable of tracking elapsed game time.

### Data Organization

The large number of creatures, attributes, and attacks required organized data structures to reduce duplication and improve maintainability.

### Interface Updates

The game state must be continuously reflected in the interface, updating elements such as HP, cooldowns, status information, and battle data.

---

## Current Status

The project currently has a **functional prototype** with the following main systems:

- Auto-Battle
- Creatures and attributes
- Attacks
- Type system
- Team management
- Storage Box
- Inventory
- Item shop
- Battle drops
- Progress persistence

---

## Next Steps

- Expand combat animations.
- Implement creature evolution.
- Add new progression mechanics.
- Expand battle systems.
- Improve interface and visual feedback.
- Expand the game's content.

---

## Skills Demonstrated

The development of **Poké Idle** demonstrates practical experience with:

**Web Game Development • JavaScript • Object-Oriented Programming • Game Loop • Combat AI • State Management • Data Structures • Data Persistence • Canvas API • Game Design • RPG Systems**
