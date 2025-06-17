---
title: PCR
description: PCR is a full-stack web application that I developed for in-house use at a construction company. The application aggregated data from multiple sources to streamline workflows.
tags: 
    - Web Development
    - VueJS
    - Nuxt
    - PostgreSQL
    - Supabase
images: 
    - /api/images/projects/pcr/dashboard.png
    - /api/images/projects/pcr/metrics.png
featured: true
type: code
sitemap: 
  lastmod: 2025-06-17
---
## Project Overview
I was struck with COVID mid-2024 and had a week free to work on a project. I opted to use that time to develop a web application to streamline operations within the department I was working in at the time.
The problem was that we had multiple data sources and manual processes that were inefficient and prone to errors. I wanted to create a centralized platform that could aggregate data from various sources and provide real-time insights to project managers and stakeholders.
The goal was to create a user-friendly and efficient platform that would allow users to easily access and analyze data, while also providing the company with the tools they needed to manage the project effectively.

## Design
The web application was built with Nuxt and Supabase. Due to millions of rows of data, there was heavy use of PostgreSQL features such as materialized views and CTEs to optimize performance and ensure that the application could handle large amounts of data.
The application utilized Supabase for user authentication and data management, allowing for a seamless integration with the PostgreSQL database. The application was designed to be responsive and mobile-friendly, allowing users to access their projects from anywhere, at any time.
There was also a dedicated backend to process data from various data sources including external databases and Excel files. The backend was created utilizing Kotlin, Ktor, and Exposed, which provided a powerful and scalable solution to process millions of rows of data utilizing features such as coroutines.

## Lessons learned
- **Data Aggregation**: Aggregating data from multiple sources requires a deep understanding of the data landscape and how to effectively manage and process large amounts of data. It is important to create a product that provides value to users and solves their pain points.
- **Relational Databases**: Utilizing PostgreSQL features such as materialized views and CTEs is critical to optimizing performance and ensuring that the application can handle large amounts of data. This requires a strong understanding of relational database design and optimization techniques.
- **User Experience**: This was one of the first projects I had to develop for non-technical users so it was critical to create a friendly and intuitive interface. It is important to ensure that users can easily navigate the application and find the information they need.
- **Real-time Data**: As several datasets could refresh throughout the day, clever usage of websockets and Supabase's real-time features were used to ensure that users always had the most up-to-date information.

## Demos
::contentvid{videoUrl="/api/images/projects/pcr/dashboard.mp4"}
### Dashboard
This is the home page of the application providing KPI's at a glance.
::

::contentvid{videoUrl="/api/images/projects/pcr/metrics.mp4"}
### Metrics
This is the metrics page of the application providing a detailed view of the health of the application and how it was performing.
::

::contentvid{videoUrl="/api/images/projects/pcr/packages.mp4"}
### Packages
This page is the detailed view that aggregates several data sources such as a schedule, budget, quality sign-offs, drawings, and more.
::