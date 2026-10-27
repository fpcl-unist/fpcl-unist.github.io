window.FPCL = window.FPCL || {};

/* Research page: one block per topic, in page order. Also editable at /admin.
   title   the topic heading. id (optional) is the name used in links such as overview.html -> page.html#id
   blocks  what comes under the heading, in order: { type: "text", text } is a paragraph and
           { type: "figure", images: [...], caption } is a row of pictures with its caption.
           <i>, <sub>, <sup> and <br> may be used in titles, paragraphs and captions. */

FPCL.topics = [
  {
    title: "Aerodynamics of Hyperloop System",
    blocks: [
      {
        type: "text",
        text: "The Hyperloop (proposed by Elon Musk at Tesla) is one of right solution for the specific case of high traffic city pairs that are less than about 1500 km or 900 miles apart. A pod-like vehicle runs through a near-vacuum tube at more than airline speed to remove air drag. The pod would accelerate to cruising speed gradually using a linear electric motor and glide above their track using passive magnetic levitation (or possibly air bearing). Here, we have studied aerodynamic characteristics of a pod in a tube at a cruising speed (300 m/s or 1080 km/h) under a near-vacuum pressure (0.001 atm)."
      }
    ]
  },
  {
    title: "Aerodynamics of Coaxial Propellers in Unmanned Aerial Vehicle (UAV) System",
    blocks: [
      {
        type: "text",
        text: "An unmanned aerial vehicle (UAV), commonly known as a drone, is an aircraft without a human pilot aboard (Wikipedia). Compared to manned aircraft with fixed-wing, UAVs have often utilized propellers (rotary-wing) to obtain lift force for several reasons. In this study, we have examined aerodynamic characteristics of coaxial propellers and provide aerodyanamic advantages of the coaxial propellers, compared to a single propeller."
      },
      {
        type: "figure",
        images: [
          "images/research/cfd-application-01.gif"
        ],
        caption: "[Figure 1] CFD analysis for a single propeller"
      },
      {
        type: "figure",
        images: [
          "images/research/cfd-application-02.gif"
        ],
        caption: "[Figure 2] CFD analysis for a coaxial propeller"
      }
    ]
  },
  {
    title: "Aerodynamics of Multi-Element Iced Airfoils",
    blocks: [
      {
        type: "text",
        text: "It is necessary to study the effects of icing on the aerodynamics around various iced airfoils because the accreted ice leads to a severe reduction in lift, increased drag and aircraft instability. In this study, we have performed large-eddy simulations of flows over two multi-element iced airfoils under supercooled large droplet (SLD) and non-SLD conditions using ANSYS Fluent software to examine the aerodynamic characteristics and complex interactions between flows generated from slat, main and flap elements."
      },
      {
        type: "figure",
        images: [
          "images/research/cfd-application-03.png"
        ],
        caption: "[Figure 3] Ice shapes on multi-element iced airfoils under SLD and non-SLD conditions"
      },
      {
        type: "figure",
        images: [
          "images/research/cfd-application-04.jpg"
        ],
        caption: "[Figure 4] Temporally averaged streamlines with velocity magnitude around slat element for clean (left), SLD (middle) and non-SLD (right) cases: (a, b, c) AOA = 0º, (d, e, f) 8º, and (g, h, i) 16º"
      }
    ]
  },
  {
    title: "Aerodynamic Optimization Design for a Canopy",
    blocks: [
      {
        type: "text",
        text: "The complex flows around the 3D canopies are accurately captured using the wall-resolved large-eddy simulation (LES) technique and simulations for the design optimization of 2D canopies are conducted using the unsteady Reynolds-averaged Navier-Stokes (URANS) technique. An assessment of the aerodynamic performance and stability of the optimized 3D canopy using the LES data showed that the aerodynamic performance (L/D) of the optimized 3D canopy improves by to 11.1% compared to that of the base 3D canopy."
      },
      {
        type: "figure",
        images: [
          "images/research/cfd-application-05.jpg"
        ],
        caption: "[Figure 5] Temporally averaged pressure coefficient (Cp) distribution on the 3D canopy surface: (a) base and (b) optimized canopies"
      },
      {
        type: "figure",
        images: [
          "images/research/cfd-application-06.jpg"
        ],
        caption: "[Figure 6] Instantaneous iso-surfaces of Q-criterion (Q=0.7) around the wingtip of the (a) base 3D canopy and (b) optimized 3D canopy. The equally-spaced planes behind the canopy are colored by the vorticity (ω)"
      }
    ]
  },
  {
    title: "Numerical Simulation of Spherical Ice Making with Volume Expansion",
    blocks: [
      {
        type: "text",
        text: "It is well known that ice expands in volume by 9-10% compared to water during the ice making process, necessitating research on the impact of this volumetric expansion on case walls. In this study, we have performed a simulation of the volumetric expansion of ice through the controlling of the material properties by filling 90% of a spherical case with water and the remaining domain with air, within a multiphase flow system involving heat and mass transfer using ANSYS Fluent software. We investigated the tendencies of ice formation and pressure variations inside the case."
      },
      {
        type: "figure",
        images: [
          "images/research/cfd-application-07.gif"
        ],
        caption: "[Figure 7] Time evolution of the liquid fraction (left) and pressure (right) during a spherical ice making"
      }
    ]
  },
  {
    title: "Simulation of Frost Growth and Densification on a Cold Surface",
    blocks: [
      {
        type: "text",
        text: "This figure summarizes a CFD simulation of frost growth and densification on a copper cooling surface. Figure (a) presents the numerical boundary conditions: humid air at 275 K (humidity ration 0.00365 kg/kg) is supplied from the inlet, while heat is removed by conduction through the cooling surface, with a length of 10 mm. The resulting temperature field (265-275 K) shows a cold region developing near the wall, which provides the driving condition for frost formation. Figure (b) visualizes the time evolution of the frost volume fraction (0-0.2) at t=3600 s, 7200s, 10,000s. As time progresses, the frost layer expands along the cooling surface and its local volume fraction increases near the wall, indicating simultaneous growth and densification."
      },
      {
        type: "figure",
        images: [
          "images/research/cfd-application-08.gif"
        ],
        caption: "[Figure 8] (a) numerical boundary conditions and heat conduction through the cooling surface and <br>(b) frost growth over time near the cooling surface"
      }
    ]
  }
];
