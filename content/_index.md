---
title:
date: 2026-09-09
type: landing

sections:

  # =========================================================
  # Lab Introduction
  # =========================================================
  - block: hero
    id: introduction
    content:
      title: |
        NTNU GPTL
      text: |
        <br>

        **Green Power Technology Laboratory**

        National Taiwan Normal University

        Our laboratory focuses on interdisciplinary research
        in energy systems, vehicle technologies, control,
        thermal management, and intelligent engineering.


  # =========================================================
  # Development Directions
  # =========================================================
  - block: markdown
    id: development
    content:
      title: Development Directions
      subtitle: ''
      text: |
        ### Vehicle & Energy System Modeling
        Modeling and simulation of vehicle and energy systems.

        ### Control & Energy Management
        Development of intelligent control and energy management strategies.

        ### Thermal Management
        Thermal system modeling, control, and energy-efficient operation.

        ### Real-Time Simulation & HIL
        Real-time simulation, controller validation, and hardware-in-the-loop testing.

        ### AI for Energy & Mobility
        Artificial intelligence applications for energy systems and intelligent mobility.

    design:
      columns: '1'
      spacing:
        padding: ['60px', '0', '60px', '0']


  # =========================================================
  # News
  # =========================================================
  - block: collection
    id: news
    content:
      title: News
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
  # Contact Us
  # =========================================================
  - block: markdown
    id: contact
    content:
      title: Contact Us
      subtitle: ''
      text: |
        **National Taiwan Normal University**

        **Address:** To be updated  
        **Phone:** To be updated  
        **Email:** To be updated  

        Google Map will be added later.

    design:
      columns: '1'
      spacing:
        padding: ['60px', '0', '60px', '0']

---