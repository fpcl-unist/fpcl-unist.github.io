window.FPCL = window.FPCL || {};

/* Equipment pages, one block per page. Also editable at /admin.
   items   the list; sub is the smaller list under an item (or [] for none)
   images  pictures under the list (one picture fills the width; several sit side by side). alt describes the picture. */

FPCL.equipmentServers = {
  items: [
    {
      text: "Dell PowerEdge R820 Rack Mount Server (Xeon Processor E5-4627v2, 3.3GHz, 32-Core, 64-Thread), 256GB RAM",
      sub: []
    },
    {
      text: "Intel Xeon Processor E5-4620v2 (2.2GHz, 32-Core, 64-Thread), 256GB RAM",
      sub: []
    },
    {
      text: "Intel Xeon Processor Gold 6136v2 (3.0GHz, 24-Core, 48-Thread), 192RAM, 4ea",
      sub: []
    },
    {
      text: "Intel Xeon Processor Gold 6240v2 (3.0GHz, 36-Core, 72-Thread), 192RAM, 2ea",
      sub: []
    },
    {
      text: "Intel Xeon Processor Gold 6226Rv2 (2.9GHz, 32-Core, 64-Thread), 256RAM, 4ea",
      sub: []
    },
    {
      text: "Intel Xeon Processor Gold 6326v2 (2.9GHz, 32-Core, 64-Thread), 256RAM, 2ea",
      sub: []
    },
    {
      text: "AMD Ryzen Threadripper Processor PRO 5975WX (3.6GHz, 32-Core, 64-Thread), 256RAM, 2ea",
      sub: []
    },
    {
      text: "Intel i7-5930k Haswell-E Processor (3.5GHz, 6-Core, 12-Thread), 64GB RAM, 4ea",
      sub: []
    },
    {
      text: "Intel i7-4930k Ivy-Bridge-L Processor (3.4GHz, 6-Core, 12-Thread), 64GB RAM, 10ea",
      sub: []
    },
    {
      text: "Intel i7-6800k Broadwell-E Processor (3.4GHz, 6-Core, 12-Thread), 64RAM, 4ea",
      sub: []
    },
    {
      text: "Intel i7-7700k Kaby Lake Processor (4.2GHz, 4-Core, 8-Thread), 64RAM, 11ea",
      sub: []
    },
    {
      text: "Intel i7-9700k Coffee Lake Refresh Processor (3.6GHz, 8-Core, 8-Thread), 64RAM",
      sub: []
    },
    {
      text: "Intel i7-10700K Comet Lake Processor (3.8GHz, 8-Core, 16-Thread), 64RAM",
      sub: []
    },
    {
      text: "Intel i7-11700k Rocket Lake-S Processor (3.6GHz, 8-Core, 16-Thread), 128RAM, 4ea",
      sub: []
    },
    {
      text: "Intel Ultra9 285k Arrow Lake-S Processor (3.7GHz, 24-Core, 24-Thread), 128RAM, 4ea",
      sub: []
    }
  ],
  images: [
    {
      image: "images/equipment/servers-1.jpg",
      alt: "Servers and workstations"
    }
  ]
};

FPCL.equipmentSoftware = {
  items: [
    {
      text: "ANSYS fluent package",
      sub: []
    },
    {
      text: "COMSOL multiphysics",
      sub: []
    },
    {
      text: "OpenFoam",
      sub: []
    }
  ],
  images: [
    {
      image: "images/equipment/software-1.jpg",
      alt: ""
    },
    {
      image: "images/equipment/software-2.jpg",
      alt: ""
    },
    {
      image: "images/equipment/software-3.png",
      alt: ""
    }
  ]
};

FPCL.equipmentWindTunnel = {
  items: [
    {
      text: "Open-loop suction type structure",
      sub: []
    },
    {
      text: "Test section: 1(W) * 1(H) * 5(L) m",
      sub: []
    },
    {
      text: "Flow uniformity: > 95%",
      sub: []
    },
    {
      text: "Turbulent intensity: < 0.4%",
      sub: []
    },
    {
      text: "Speed range: 1~20 m/s",
      sub: []
    }
  ],
  images: [
    {
      image: "images/equipment/wind-tunnel-1.jpg",
      alt: "Wind tunnel"
    }
  ]
};

FPCL.equipmentMeasurement = {
  items: [
    {
      text: "Dantec Particle Image Velocimetry (PIV) algorithm",
      sub: []
    },
    {
      text: "Nd-Yag laser (Innolas)",
      sub: [
        "SpitLight PIV Compact 400-10",
        "Dual Osc/Amp with 2 * 180mJ at 532nm"
      ]
    },
    {
      text: "Continous laser",
      sub: [
        "5W DPSS laser, 532nm"
      ]
    },
    {
      text: "High-speed camera",
      sub: [
        "SpeedSense M310 Camera 1MP 3260 fps, 6GB (Dantec)",
        "Sensor resolution: 1280 px * 800 px"
      ]
    },
    {
      text: "Hot-wire anemometer (TSI)",
      sub: [
        "IFA300, 2-Channel"
      ]
    },
    {
      text: "Manometer",
      sub: []
    }
  ],
  images: [
    {
      image: "images/equipment/measurement-1.jpg",
      alt: "Flow visualization and measurement equipment"
    }
  ]
};
