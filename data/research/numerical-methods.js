window.FPCL = window.FPCL || {};

/* Research page: one block per topic, in page order. Also editable at /admin.
   title   the topic heading. id (optional) is the name used in links such as overview.html -> page.html#id
   blocks  what comes under the heading, in order: { type: "text", text } is a paragraph and
           { type: "figure", images: [...], caption } is a row of pictures with its caption.
           <i>, <sub>, <sup> and <br> may be used in titles, paragraphs and captions. */

FPCL.topics = [
  {
    title: "Two-Parameter Mixed Model for Large-Eddy Simulations",
    id: "two-parameter-mixed-model",
    blocks: [
      {
        type: "text",
        text: "In an effort to improve prediction performance of large-eddy simulation in a transitional boundary layer flow, two-parameter mixed models (i.e., combination of scale-similarity model and sub-grid stress model) have been developed and assessed."
      }
    ]
  },
  {
    title: "Compressible Flow",
    blocks: []
  },
  {
    title: "Wall-Modeled Large-Eddy Simulations",
    blocks: [
      {
        type: "text",
        text: "Although large-eddy simulation (LES) has come to play an important engineering tool in the prediction and analysis of complex turbulent flows for past several decades, application of LES approach in an engineering environment is still very difficult due to the huge computational cost in the near-wall region at high Reynolds numbers. Thus, various wall-modeled LESs (hereafter, WMLES) have been proposed so far, and these methods are generally classified into three types such as equilibrium wall-stress model, non-equilibrium wall-stress model and hybrid RANS/LES model."
      },
      {
        type: "figure",
        images: [
          "images/research/numerical-methods-01.png"
        ],
        caption: "[Figure 1] Classification of wall-modeled LES (WMLES) techniques"
      },
      {
        type: "text",
        text: "Because most previous WMLES methods either use equilibrium assumption or require quite fine grids along the wall-normal direction, we have proposed an artificial neural network (ANN)-based wall-stress model."
      },
      {
        type: "figure",
        images: [
          "images/research/numerical-methods-02.png"
        ],
        caption: "[Figure 2] Schematic of artificial neural network (ANN)-based wall-stress model. Input parameters of ANN are extracted using outer layer information, and wall-shear stress τ<sub>w</sub> is obtained by ANN with the input parameters. The wall-shear stress τ<sub>w</sub> is imposed at the wall"
      }
    ]
  },
  {
    title: "Interface-Sharpening Procedure for Incompressible Multi-Phase Flows",
    blocks: []
  },
  {
    title: "Machine Learning in Turbulent Flows",
    id: "machine-learning",
    blocks: [
      {
        type: "text",
        text: "Time-varying turbulent flows are ubiquitous in engineering field and in the life sciences, such as biological propulsion, bio-inspired engineering, automobiles, ships, airplanes. It is observed that the control of unsteady turbulent flow can improve the efficiency, thrust, lift, maneuverability. Machine learning aims to categorize on such dominant patterns of unsteady turbulent flow. In particular, artificial neural networks are one of the types in machine learning. As the \"neural\" of word suggests, they are human brain-inspired systems. They are excellent tools for finding patterns which are far too complex, such as unsteady turbulent flow."
      },
      {
        type: "figure",
        images: [
          "images/research/numerical-methods-03.png"
        ],
        caption: "[Figure 3] Types of machine learning algorithm"
      },
      {
        type: "figure",
        images: [
          "images/research/numerical-methods-04.png"
        ],
        caption: "[Figure 4] Schematic of the fully connected artificial neural network (ANN). Left, network structure; right, single neuron"
      }
    ]
  }
];
