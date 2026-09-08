---
# Leave the homepage title empty to use the site title
title:
date: 2026-09-09
type: landing

sections:

  # =========================================================
  # 1. Lab Introduction
  # =========================================================
  - block: hero
    content:
      title: |
        NTNU GPTL
      text: |
        <br>

        Welcome to **NTNU GPTL**.

        Our laboratory focuses on interdisciplinary research in
        energy systems, vehicle technologies, control strategies,
        thermal management, and intelligent engineering.

    design:
      background:
        color: white


  # =========================================================
  # 2. Development Directions
  # =========================================================
  - block: markdown
    content:
      title: Development Directions
      subtitle: ''
      text: |
        Our research and development activities focus on several key directions:

        - **Vehicle & Energy System Modeling**
        - **Control & Energy Management**
        - **Thermal Management**
        - **Real-Time Simulation & HIL**
        - **AI for Energy & Mobility**

    design:
      columns: '1'
      spacing:
        padding: ['60px', '0', '60px', '0']


  # =========================================================
  # 3. News
  # =========================================================
  - block: collection
    content:
      title: News
      subtitle:
      text:
      count: 5
      filters:
        author: ''
        category: ''
        exclude_featured: false
        publication_type: ''
        tag: ''
      offset: 0
      order: desc
      page_type: post

    design:
      view: card
      columns: '1'


  # =========================================================
  # 4. Contact Us
  # =========================================================
  - block: markdown
    content:
      title: Contact Us
      subtitle: ''
      text: |
        **National Taiwan Normal University**

        **Address:** To be updated  
        **Phone:** To be updated  
        **Email:** To be updated  

        Google Map will be added here later.

    design:
      columns: '1'
      spacing:
        padding: ['60px', '0', '60px', '0']

---