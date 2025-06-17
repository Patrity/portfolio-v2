---
title: Kronos
description: A 3D third-person online multiplayer game inspired by the MMORPG Runescape
tags:
  - GameDev
  - Java
  - Kotlin
  - Rest API
images:
  - /api/images/projects/kronos/kronos.webp
featured: false
type: code
sitemap: 
  lastmod: 2025-06-17
---

## Project Overview

Kronos was an online multiplayer game that I worked on, leading a team of three other developers.
The game launched and sustained a playerbase of hundreds of players for several months. Challenges included
community management, dynamic and fast-paced development cycles, and securing the infrastructure. There were many lessons learned
throughout the process, both prior to launch and during the life of the game.

## Design

Both the game server and client were developed in Java but large systems were later implemented in Kotlin. The design included a central server to authenticate connections,
multiple game servers to handle player load and varying server types, a deployment for the web server which housed a highscore system and an ecommerce platform for in-game purchases, and a RESTful
API to handle data requests between the game server, web server, and the client.

## Lessons learned

- **Dynamic Development**: The game was developed in a dynamic environment, which meant that we had to be able to adapt quickly to changes and new ideas. This required a flexible development process and the ability to pivot when necessary.
- **Infrastructure Security**: Securing the infrastructure was a top priority. We had to ensure that our servers were protected from attacks and that player data was secure. This required constant monitoring and updates to our security protocols.
- **Player Engagement**: Keeping players engaged and interested in the game was a constant challenge. We had to constantly update the game with new content and features to keep players coming back.
- **Testing and Quality Assurance**: Testing and quality assurance were critical to the success of the game. We had to ensure that the game was stable and free of bugs before launch, and that we had a plan in place for ongoing testing and updates after launch.
- **Team Management**: Leading a team of developers required strong communication and collaboration skills. We had to work together to ensure that everyone was on the same page and that we were all working towards the same goals.
- **Time Management**: Balancing the demands of the game with other responsibilities was a constant challenge. Delegation was key to ensuring that tasks were completed on time and that the team was not overwhelmed.
- **Game Economy Design**: Balanced in-game rewards and progression systems to maintain player interest without diminishing achievement value.
