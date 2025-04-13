---
title: RepCord
description: A Discord bot and web applications that allowed users to report their interactions with others on the popular chat platform, Discord. The platform recorded over 250,000 user-submitted reports and was used by over 75,000 users.
tags: [Java, Kotlin, Discord API, Web Development, VueJS, React]
images: ['/api/images/projects/repcord/banner.webp']
featured: true
type: code
---
## Project Overview
RepCord began as one of my first non-game development projects. The idea behind it was that users could join a server, interact as a bad actor, then go to another server and continue with the same behavior.
The goal was to act as a deterrant to that kind of behavior, and to allow users to report bad actors in a way that was easy and accessible. The platform was active for over three years and recorded over 250,000 user-submitted reports and was used by over 75,000 users.
Users could report other users, either positive or negative, and the reports would be stored in a database. The reports could then be viewed by other users, allowing them to see the behavior of others before interacting with them.

## Design
The platform was originally just a Discord bot, but later expanded to include a web application built with React. After successful implementation, we made the decision to pivot the web application to VueJS due to our own preference.
The bot was developed in Java, and later rewritten in Kotlin. The database was a large, relational PostgreSQL database that stored all user data, reports, and server information.
I also implemented the Stripe API to allow users to purchase premium features, such as the ability to display a cosmetic badge on their profile and have a larger impact when submitting reports.

## Lessons learned
- **Large Scale Data**: As this was one of my first non-game development projects, I learned a lot about how to manage large amounts of data and how to structure a database to support that. I also learned about how to optimize queries and how to scale a database to support a large number of users.
- **User Experience**: Creating a user-friendly interface is critical to the success of a web application. It is important to ensure that users can easily navigate the application and find the information they need.
- **Real-time Data**: Providing real-time data to users is a key part of creating a successful web application. This requires a strong understanding of how to interact with APIs and how to update the user interface in real-time.
- **Security**: Ensuring the security of user data and transactions is a top priority for any web application. This requires constant monitoring and updates to security protocols to protect against attacks and vulnerabilities.
- **Community Management**: Managing a community of users is a challenging task. It requires constant communication, transparency, and the ability to handle conflicts and issues that arise at scale. We had to ensure that our users felt heard and valued.
