/* ============================================================
   CONTENT — all UI copy lives here
   Keys are referenced by data-text="key" attributes in the HTML.
   ============================================================ */
const content = {

  // ── SHARED ─────────────────────────────────────────────────
    cancel:   "Cancel",
    done_btn: "Done",
    save_btn: "Save",
    delete_btn: "Delete",
    add_btn: "Add",
    home:     "Dashboard",
    projects: "Projects",
    spaces:   "Spaces",
    calendar: "Tasks",
    profile:  "Settings",
    notes:  "Notes",
    details:  "Details",
    description:  "Description",
    linked_spaces: "Linked spaces",
    linked_projects: "Linked projects",
    linked_tasks: "Linked tasks",


  // ── OB-1: WELCOME ─────────────────────────────────────────
    ob1_tagline:     "Your home, all in one place",
    ob1_tagline_sub: "Projects, spaces, tasks, yard and garden, all in sync.",
    ob1_cta:         "Get started",
    ob1_signin:      "Already have an account? Sign in",
    si_signin:       "Sign in",
    si_signin_Alba:  "Welcome back, Alba",
    si_welcome:      "Sign in to pick up where you left off",


  // ── OB-2: HOME NAME, TYPE & LOCATION ──────────────────────
    ob2_title:          "Tell us about your home",
    ob2_sub:            "We'll personalize suggestions for you.",
    ob2_label_name:     "Name your nest",
    ob2_name_hint:      "Naming your home lets you manage multiple properties later.",
    ob2_label_type:     "Home type",
    ob2_type_house:     "Single-family house",
    ob2_sub_house:      "Standalone home with land and full ownership",
    ob2_type_condo:     "Condo / apartment",
    ob2_sub_condo:      "Private unit within a shared building",
    ob2_type_town:      "Townhouse",
    ob2_sub_town:       "Multi-level home with shared walls, private entry",
    ob2_label_location: "Location",
    location_error:     "Please enter only your 5 digit zip code",
    ob2_location_hint:  "Powers seasonal suggestions for your region.",
    ob_cta:             "Continue",
    ob_skip:            "Skip for now",


  // ── OB-3: YARD SIZE ───────────────────────────────────────
    ob3_title:          "How big is your yard?",
    ob3_sub:            "We'll help you with your lawn care and equipment.",
    ob3_label_size:     "Yard size",
    ob3_yard_none:      "No yard",
    ob3_yard_none_sub:  "No usable outdoor space",
    ob3_yard_small:     "Small",
    ob3_yard_small_sub: "Under 500 sq ft",
    ob3_yard_med:       "Medium",
    ob3_yard_med_sub:   "500\u201310,000 sq ft (up to &frac14 acre)",
    ob3_yard_large:     "Large",
    ob3_yard_large_sub: "10,000\u201343,560 sq ft (up to 1 acre)",
    ob3_yard_acreage:     "Acreage",
    ob3_yard_acreage_sub: "Over 43,560 sq ft (1+ acres)",


  // ── OB-4: MAP YOUR HOME (rebuilt) ─────────────────────────
    ob4_title:           "Map your home",
    ob4_sub:             "Add the levels and spaces of your home — you can update at any time.",
    ob4_label_levels:    "Your home",
    ob4_add_level:       "+ Add level",
    ob4_level_picker_title: "Add a level",
    ob4_level_picker_sub:   "Pick from common levels or type your own.",
    ob4_room_picker_title:  "Add a space",
    ob4_room_picker_sub:    "Pick from common spaces or type your own.",
    ob4_action_rename:   "Rename",
    ob4_action_move:     "Change level",
    ob4_action_remove:   "Remove",


  // ── OB-5: EQUIPMENT & FEATURES ────────────────────────────
    ob5_title:            "What does your home have?",
    ob5_sub:              "We'll suggest relevant tasks for your calendar.\nSelect all that apply.",
    ob5_label_indoors:    "Indoors",
    ob5_label_id1:        "Washing machine",
    ob5_sub_id1:          "Tub, seals, hoses, filters",
    ob5_label_id2:        "Dryer",
    ob5_sub_id2:          "Vent line, lint trap",
    ob5_label_id3:        "Dishwasher",
    ob5_sub_id3:          "Filter, gaskets, seals",
    ob5_label_id4:        "Garbage Disposal",
    ob5_sub_id4:          "Deodorize, connections",
    ob5_label_id5:        "Furnace",
    ob5_sub_id5:          "Filter, flame sensor",
    ob5_label_id6:        "Boiler",
    ob5_sub_id6:          "Flush system, inspection",
    ob5_label_oudoors:    "Outdoors",
    ob5_label_lawn:       "Lawn / grass",
    ob5_sub_lawn:         "Mowing, fertilizing, grub control",
    ob5_label_garden:     "Garden",
    ob5_sub_garden:       "Planting, watering, seasonal prep",
    ob5_label_mower:      "Lawn mower",
    ob5_sub_mower:        "Blade sharpening, oil changes",
    ob5_label_snow:       "Snow blower",
    ob5_sub_snow:         "Seasonal prep, fuel stabilizer",
    ob5_label_irrigation: "Irrigation system",
    ob5_sub_irrigation:   "Winterizing, spring startup",
    ob5_label_pool:       "Pool / hot tub",
    ob5_sub_pool:         "Opening, closing, chemical balance",


  // ── OB-6: FOCUS AREAS ─────────────────────────────────────
    ob6_title:                  "What matters most right now?",
    ob6_sub:                    "Your dashboard will surface these first.\nSelect all that apply.",
    ob6_label:                  "Interests",
    ob6_focus_projects:         "Active projects",
    ob6_focus_projects_desc:    "Track progress, instructions, and materials for home improvement projects.",
    ob6_focus_maintenance:      "Tasks",
    ob6_focus_maintenance_desc: "Stay on top of recurring tasks, seasonal chores, and appliance care.",
    ob6_focus_garden:           "Garden & lawn",
    ob6_focus_garden_desc:      "Track plants, planting dates, and seasonal care across years.",
    ob6_focus_materials:        "Materials & costs",
    ob6_focus_materials_desc:   "Manage shopping lists, track spend, and consolidate across projects.",


  // ── OB-7: CALENDAR PREFERENCES ────────────────────────────
    ob7_title:             "Calendar preferences",
    ob7_sub:               "How would you like to organize suggestions?",
    ob7_label_remind:      "AI task suggestions",
    ob7_remind_all:        "All tasks",
    ob7_remind_all_sub:    "Get suggestions for all seasonal and recurring tasks.",
    ob7_remind_less:       "Less common tasks only",
    ob7_remind_less_sub:   "Only get suggestions for tasks I might forget.",
    ob7_remind_none:       "No suggestions on tasks",
    ob7_remind_none_sub:   "Turn off suggestions.",
    ob7_label_cal:         "Calendar",
    ob7_cal_dedicated:     "Dedicated Nestful calendar",
    ob7_cal_dedicated_sub: "Create a separate calendar just for home tasks.",
    ob7_cal_google:        "Merge into an existing calendar",
    ob7_cal_google_sub:    "Add tasks to a calendar I already use.",
    ob7_cta:               "Let's go \u2192",


  // ── DASHBOARD ─────────────────────────────────────────────
    dash_greeting:          "Good morning",
    dash_greeting_sub:      "Let's take care of your home together.",
    dash_label_projects:    "active",
    dash_label_maintenance: "upcoming",
    dash_label_spaces:      "mapped",
    see_all:                "See all",
    dash_task_1: "Active",
    dash_task_2: "Last week",
    dash_task_3: "April 18",
    dash_task_4: "April 29",
    tasks: "Up next",


  // ── PROJECTS ──────────────────────────────────────────────
    proj_filter_all:      "All",
    proj_filter_progress: "Active",
    proj_filter_planned:  "Planned",
    proj_filter_done:     "Done",
    proj_filter_idea:     "Idea",

    proj_area_living:   "Living room",
    proj_area_backyard: "Backyard",
    proj_area_office:   "Office",
    proj_area_kitchen:  "Kitchen",
    proj_area_spring:   "Spring",
    proj_area_summer:   "Summer",

    proj_detail_progress:  "Progress",
    proj_detail_steps:     "Instructions",
    proj_detail_materials: "Materials list",
    proj_detail_refs:      "Reference links",

    new_proj_title_lbl:   "Project title",
    new_proj_status_lbl:  "Status",
    new_proj_create_btn:  "Create project",
    new_proj_sheet_title: "New project",
    new_proj_sheet_sub:   "Quick details — fill in instructions and materials next.",

    confirm_delete_proj_title: "Delete this project?",
    confirm_delete_proj_sub:   "This can't be undone.",
    confirm_delete_task_title: "Delete this task?",
    confirm_delete_task_sub:   "This can't be undone.",


  // ── TASKS ─────────────────────────────────────────────────
    proj_paint:          "Paint living room", 
    task_lawn_mow_short: "First lawn mow",
    task_lawn_mow:       "First lawn mow of the season",
    task_hvac_short:     "HVAC filter check",
    task_hvac:           "HVAC filter replacement",
    task_faucets:        "Check outdoor faucets",
    task_gutters:        "Clean gutters",


  // ── CALENDAR ──────────────────────────────────────────────
    cal_filter_all:       "All",
    cal_filter_upcoming:  "Upcoming",
    cal_filter_overdue:   "Overdue",
    cal_filter_suggested: "Suggested",
    cal_filter_past:      "Done",

    cal_label_upcoming:    "Upcoming tasks",
    cal_label_overdue:     "Overdue tasks",
    cal_label_done:        "Completed tasks",
    cal_label_suggestions: "AI suggestions for your home",

    cal_suggest_grub:        "Apply grub preventer",
    cal_suggest_grub_desc:   "Best applied late April\u2013May in your region (MA) before soil temps exceed 55\u00B0F.",
    cal_suggest_dryer:       "Clean dryer vent",
    cal_suggest_dryer_desc:  "Annual task \u2014 lint buildup is a leading cause of home fires.",
    cal_suggest_heater:      "Flush water heater",
    cal_suggest_heater_desc: "Recommended annually to remove sediment and extend water heater life.",

    task_detail_title_lbl:  "Title",
    task_detail_date_lbl:   "Date",
    // task_detail_cat_lbl:    "Category",
    task_detail_recur_lbl:  "Repeat",
    task_detail_notes_lbl:  "Notes",
    task_detail_new_title:  "New task",
    task_detail_save_btn:   "Save",

    recur_oneoff:    "Never",
    recur_daily:    "Daily",
    recur_weekly:  "Weekly",
    recur_biweekly:  "Bi-weekly",
    recur_monthly: "Monthly",
    recur_seasonal:  "Seasonally",
    recur_annual:    "Annually",


  // ── SPACES ────────────────────────────────────────────────
    space_living:   "Living room",
    space_bath:     "Main bathroom",
    space_kitchen:  "Kitchen",
    space_backyard: "Backyard",
    space_detail_annotations:  "Annotations",
    space_detail_measurements: "Saved measurements",
    // space_detail_projects:     "LinkProjects in this space",
    space_empty_label:         "Empty",
    space_mapped_label:        "Mapped",
    space_add_details:         "+ Add details",
    space_add_first_annotation:"+ Add annotation",
    

  // ── EMPTY STATES ──────────────────────────────────────────
    empty_proj_all:      "No projects yet — tap + to add one.",
    empty_proj_filtered: "Nothing here yet for this filter.",
    empty_cal_all:       "No tasks yet — tap + to add one.",
    empty_cal_filtered:  "No tasks for this filter.",
    empty_proj_in_space: "No projects linked to this space yet.",

};


/* ============================================================
   MASTER TAG LIST — single source of truth for all "areas".
   Used by: project tag editor, space matching, task linking.
   Names match space names so tagging stays consistent.

   if add any add image and update in script.js AREA_IMG_PATHS
   ============================================================ */
    const MASTER_TAGS = [
      "Kitchen",
      "Pantry",
      "Living room",
      "Dining room",
      "Bedroom",
      "Walk-in closet",
      "Office",
      "Bathroom",
      "Laundry",
      "Hallway",
      "Mudroom",
      "Sunroom",
      "Garage bay",
      "Workshop",
      "Storage",
    ];

/* ============================================================
   PRESETS for OB-4 / Spaces — what shows up in the picker
   ============================================================ */
    const LEVEL_PRESETS = [
      { key: "1st",      label: "1st floor", type: "indoor" },
      { key: "2nd",      label: "2nd floor", type: "indoor" },
      { key: "3rd",      label: "3rd floor", type: "indoor" },
      { key: "4th",      label: "4th floor", type: "indoor" },
      { key: "basement", label: "Basement",  type: "indoor" },
      { key: "attic",    label: "Attic",     type: "indoor" },
      { key: "garage",   label: "Garage",    type: "garage" },
    ];

    const ROOM_PRESETS_BY_TYPE = {
      indoor:  ["Kitchen", "Pantry", "Living room", "Dining room", "Bedroom", "Walk-in closet", "Office", "Bathroom", "Laundry", "Hallway", "Mudroom", "Sunroom", "Storage"],
      garage: ["Garage bay", "Workshop", "Storage", "Mudroom"],
    };


/* ============================================================
   SEED STATE — initial data shown in the prototype.
   ============================================================ */
    const SEED_PROJECTS = [
      {
        id: "p1",
        title: "Paint living room",
        status: "progress",
        img: "card1",
        color: null,
        spaces: ["Living room"],
        instructions: [
          { id: "s1", text: "Clean and prep walls — fill holes, sand rough spots", done: true },
          { id: "s2", text: "Tape trim, windows, and ceiling edge", done: true },
          { id: "s3", text: "Apply primer coat (252 sq ft wall area — pulled from Space mapper)", done: false },
          { id: "s4", text: "Let primer dry 2–4 hours", done: false },
          { id: "s5", text: "Apply first coat — Sherwin-Williams Passive SW 7064", done: false },
          { id: "s6", text: "Apply second coat after 4 hours dry time", done: false },
        ],
        materials: [
          { id: "m1", name: "Passive SW 7064",   quantity: "2 gal",   link: "https://www.sherwin-williams.com", cost: 68, done: false },
          { id: "m2", name: "Primer",            quantity: "1 gal",   link: "https://www.homedepot.com",        cost: 24, done: false },
          { id: "m3", name: "Painter's tape",    quantity: "2 rolls", link: "https://www.homedepot.com",        cost: 12, done: false },
          { id: "m4", name: "Roller + tray set", quantity: "",        link: "",                                 cost: 18, done: false },
        ],
        refs: [
          { id: "r1", title: "How to paint a room — beginner guide", link: "thisoldhouse.com" },
          { id: "r2", title: "Sherwin-Williams Passive — color details", link: "sherwin-williams.com" },
        ],
        notes: "Doing this in two sessions over the weekend — primer Saturday, color Sunday after it cures overnight.",
      },
      {
        id: "p2",
        title: "Raised garden bed",
        status: "planned",
        img: "card2",
        color: null,
        spaces: [],
        instructions: [
          { id: "p2s1", text: "Pick a spot with 6+ hours of direct sun and mark out a 4' × 8' footprint", done: false },
          { id: "p2s2", text: "Level the ground and lay landscape fabric to block weeds", done: false },
          { id: "p2s3", text: "Cut cedar boards to length — two 8' and two 4' per box", done: false },
          { id: "p2s4", text: "Assemble corners with exterior screws — pre-drill to prevent splitting", done: false },
          { id: "p2s5", text: "Set the frame in place and stake corners to keep it square", done: false },
          { id: "p2s6", text: "Fill with a 60/30/10 mix of topsoil, compost, and peat", done: false },
          { id: "p2s7", text: "Water thoroughly and let settle for 24 hours before planting", done: false },
        ],
        materials: [
          { id: "p2m1", name: "Cedar boards 2×8×8'",   quantity: "4",         link: "https://www.homedepot.com",  cost: 96, done: false },
          { id: "p2m2", name: "Cedar boards 2×8×4'",   quantity: "4",         link: "https://www.homedepot.com",  cost: 52, done: false },
          { id: "p2m3", name: "Exterior wood screws",  quantity: "1 box",     link: "https://www.homedepot.com",  cost: 14, done: false },
          { id: "p2m4", name: "Landscape fabric",      quantity: "1 roll",    link: "https://www.lowes.com",      cost: 22, done: false },
          { id: "p2m5", name: "Garden soil mix",       quantity: "16 cu ft",  link: "",                            cost: 110, done: false },
          { id: "p2m6", name: "Corner stakes",         quantity: "",          link: "",                            cost: 0, done: false },
        ],
        refs: [
          { id: "p2r1", title: "How to build a raised garden bed",         link: "gardeners.com" },
          { id: "p2r2", title: "Best soil mix for raised beds",            link: "epicgardening.com" },
        ],
        notes: "Want to start with low-maintenance crops the first year — tomatoes, basil, peppers. Avoiding root vegetables until I see how the drainage performs.",
      },
      {
        id: "p3",
        title: "Office refresh",
        status: "idea",
        img: "card3",
        color: null,
        spaces: ["Office"],
        instructions: [
          { id: "p3s1", text: "Declutter desk and shelves — donate or trash anything unused in 6 months", done: false },
          { id: "p3s2", text: "Measure the wall for a new bookshelf — confirm height clearance for outlets", done: false },
          { id: "p3s3", text: "Order new desk lamp and cable management tray", done: false },
          { id: "p3s4", text: "Repaint accent wall behind the desk (Sherwin-Williams Naval SW 6244)", done: false },
          { id: "p3s5", text: "Assemble shelving and hang artwork", done: false },
        ],
        materials: [
          { id: "p3m1", name: "Bookshelf",            quantity: "1",       link: "https://www.westelm.com",   cost: 320, done: false },
          { id: "p3m2", name: "Desk lamp",            quantity: "1",       link: "https://www.cb2.com",       cost: 89,  done: false },
          { id: "p3m3", name: "Cable management tray",quantity: "1",       link: "https://www.amazon.com",    cost: 28,  done: false },
          { id: "p3m4", name: "Naval SW 6244",        quantity: "1 gal",   link: "https://www.sherwin-williams.com", cost: 52, done: false },
        ],
        refs: [
          { id: "p3r1", title: "Small home office ideas — layouts under 80 sq ft", link: "apartmenttherapy.com" },
        ],
        notes: "Inspiration board on Pinterest. Want a calmer feel — dark accent wall, warm wood tones, less clutter on the desk surface.",
      },
      {
        id: "p4",
        title: "Kitchen backsplash",
        status: "idea",
        img: "card4",
        color: null,
        spaces: ["Kitchen"],
        instructions: [
          { id: "p4s1", text: "Decide on tile style — leaning toward zellige or handmade subway", done: false },
          { id: "p4s2", text: "Measure backsplash area between counters and upper cabinets", done: false },
          { id: "p4s3", text: "Order tile samples and test against cabinet color in different light", done: false },
          { id: "p4s4", text: "Get quotes from 2–3 local installers", done: false },
          { id: "p4s5", text: "Schedule installation — plan for 2 days without kitchen access", done: false },
        ],
        materials: [
          { id: "p4m1", name: "Tile samples",     quantity: "3-4",   link: "https://www.firedearth.com", cost: 24, done: false },
          { id: "p4m2", name: "Tile (estimated)", quantity: "32 sq ft", link: "",                           cost: 480, done: false },
          { id: "p4m3", name: "Grout + adhesive", quantity: "",      link: "",                           cost: 0, done: false },
        ],
        refs: [
          { id: "p4r1", title: "Zellige vs ceramic — what to know before buying", link: "remodelista.com" },
          { id: "p4r2", title: "How to estimate tile for a backsplash",           link: "thespruce.com" },
        ],
        notes: "",
      },
    ];

    const SEED_LEVELS = [
      { id: "lvl1", key: "1st", label: "1st floor", type: "indoor", rooms: [
        { id: "rm1", name: "Living room" },
        { id: "rm2", name: "Kitchen" },
      ]},
      { id: "lvl2", key: "2nd", label: "2nd floor", type: "indoor", rooms: [
        { id: "rm3", name: "Bedroom" },
        { id: "rm4", name: "Office" },
        { id: "rm5", name: "Bathroom" },
      ]},
    ];

// Pre-mapped detail by room name. Empty rooms get auto-created shells.
    const SEED_SPACE_DETAILS = {
      "Living room": {
        measurements: [
          { id: "lm1", label: "Room width",            value: "18",  unit: "ft" },
          { id: "lm2", label: "Room depth",            value: "14",  unit: "ft" },
          { id: "lm3", label: "Ceiling height",        value: "9",   unit: "ft" },
          { id: "lm4", label: "Wall area (paintable)", value: "252", unit: "sq ft" },
        ],
        notes: [
          { id: "ln1", title: "Accent wall",  body: "Sherwin-Williams Passive SW 7064 · Eggshell finish" },
          { id: "ln2", title: "Door trim",    body: "Don't forget door trim — not included in wall sq ft" },
        ],
      },
      "Kitchen": {
        measurements: [
          { id: "km1", label: "Room width",   value: "12",  unit: "ft" },
          { id: "km2", label: "Room depth",   value: "16",  unit: "ft" },
          { id: "km3", label: "Counter run",  value: "14",  unit: "ft" },
        ],
        notes: [
          { id: "kn1", title: "Backsplash area", body: "Approx 32 sq ft between counters and uppers" },
        ],
      },
      "Bedroom": {
        measurements: [
          { id: "pm1", label: "Room width",     value: "14", unit: "ft" },
          { id: "pm2", label: "Room depth",     value: "12", unit: "ft" },
          { id: "pm3", label: "Ceiling height", value: "8",  unit: "ft" },
        ],
        notes: [],
      },
    };

    const SEED_TASKS = [
      { id: "t1", title: "Replace HVAC filter",       dateValue: "2026-04-12",  projects: [], recurrence: "annual",  notes: "Use MERV 11 or higher", refs: [], status: "overdue",  areas: [] },
      { id: "t2", title: "Test smoke detectors",       dateValue: "2026-04-18",   projects: [], recurrence: "oneoff",    notes: "", refs: [], status: "overdue",  areas: [] },
      { id: "t3", title: "Clean gutters",              dateValue: "2026-05-22",  projects: [], recurrence: "annual",  notes: "Check downspouts too", refs: [], status: "upcoming", areas: [] },
      { id: "t4", title: "Service lawn mower",         dateValue: "2026-05-28",    projects: [], recurrence: "annual",  notes: "", refs: [], status: "upcoming", areas: [] },
      { id: "t5", title: "Deep clean kitchen",         dateValue: "2026-03-30", projects: [], recurrence: "oneoff",    notes: "", refs: [], status: "done",     areas: ["Kitchen"] },
    ];

    const SEED_SUGGESTIONS = [
      { id: "s1", title: "Flush water heater",   dateValue: "2026-05-15", desc: "Sediment buildup reduces efficiency. Annual flush recommended.", recurrence: "annual", notes: "Sediment buildup at the bottom of the tank reduces heating efficiency and can shorten the life of the unit. A yearly flush keeps energy bills lower and extends the lifespan by a few years on average.", refs: [{ id: "s1r1", title: "How to flush a water heater — step by step", link: "familyhandyman.com" }, { id: "s1r2", title: "Signs your water heater needs maintenance", link: "thisoldhouse.com" }, ], projects: [], areas: [] },

      { id: "s2", title: "Reseal deck", dateValue: "2026-06-02", desc: "Last sealed 2 years ago. Best done in dry weather.", recurrence: "annual", notes: "Deck sealer typically lasts 2 to 3 years depending on sun exposure and foot traffic. Best applied on a dry day with at least 48 hours of clear weather ahead so the sealer cures fully.", 
    refs: [
      { id: "s2r1", title: "How to clean and reseal a wood deck", link: "bobvila.com" },
      { id: "s2r2", title: "Best deck sealers for 2026", link: "thisoldhouse.com" },
    ], projects: [], areas: [] },

      { id: "s3", title: "Replace fridge filter", dateValue: "2026-05-20", desc: "6-month replacement cycle is due.", recurrence: "monthly", notes: "Most refrigerator water filters are rated for 6 months or 200 gallons, whichever comes first. Check the model number on the existing filter before ordering a replacement.", 
    refs: [
      { id: "s3r1", title: "Find the right replacement filter by model", link: "filtersfast.com" },
    ], projects: [], areas: ["Kitchen"] },
    ];

    // the amount doesn't matter just add more if want or switch them out
    const QUOTES = [
      'A home is a work in progress.',
      'Small projects, big differences.',
      'Little by little, your home becomes your haven.',
      'The best time to plant a tree was 20 years ago. The second best is today.',
      'Care for your space and it cares for you.',
    ];
    window.QUOTES = QUOTES;
/* ============================================================
   POPULATE [data-text] elements at boot
   ============================================================ */
    document.querySelectorAll("[data-text]").forEach((el) => {
      const key = el.dataset.text;
      const value = content[key];
      if (value !== undefined) {
        el.innerHTML = value;
      } else {
        console.warn(`Missing content key: "${key}"`);
      }
    });
