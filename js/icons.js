const ICONS = [
  {
    id: "time",
    name: "Time",
    category: "Time",
    tags: ["clock", "schedule", "history"],
    description: "Minimal clock for time and recent activity.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 12V6.5"/><path d="M12 12L9.8 15.9"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>`
  },

  {
    id: "search",
    name: "Search",
    category: "Navigation",
    tags: ["find", "discover"],
    description: "Clean search icon for discovery and navigation.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16L21 21"/></svg>`
  },

  {
    id: "home",
    name: "Home",
    category: "Navigation",
    tags: ["house", "main", "dashboard"],
    description: "Simple home outline for primary navigation.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5L12 4l8 6.5"/><path d="M6.5 9.5V20h11V9.5"/><path d="M10 20v-5h4v5"/></svg>`
  },

  {
    id: "user",
    name: "User",
    category: "Users",
    tags: ["account", "profile", "person"],
    description: "Neutral user icon for account and identity surfaces.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6"/></svg>`
  },

  {
    id: "settings",
    name: "Settings",
    category: "System",
    tags: ["gear", "preferences", "configuration"],
    description: "Minimal settings icon for configuration controls.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.6"/><path d="M19 13.6l1.2 1.2-2.2 2.2-1.2-1.2a7.4 7.4 0 01-2.1.9V18h-3.1v-1.3a7.4 7.4 0 01-2.1-.9l-1.2 1.2-2.2-2.2L5.2 13.6a7.4 7.4 0 010-3.2L4 9.2 6.2 7l1.2 1.2a7.4 7.4 0 012.1-.9V6h3.1v1.3a7.4 7.4 0 012.1.9L18 7l2.2 2.2L19 10.4a7.4 7.4 0 010 3.2z"/></svg>`
  },

  {
    id: "calendar",
    name: "Calendar",
    category: "Time",
    tags: ["date", "event", "schedule"],
    description: "Compact calendar for dates and schedules.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 9.5h16"/></svg>`
  },

  {
    id: "history",
    name: "History",
    category: "Time",
    tags: ["recent", "activity", "previous"],
    description: "History arrow for recent actions and activity logs.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 11.5a7.5 7.5 0 107.5-7.5c-2.6 0-4.7 1.2-6.1 3.1"/><path d="M4.5 5.5v6h6"/><path d="M12 8v4l2.5 2"/></svg>`
  },

  {
    id: "check",
    name: "Check",
    category: "Actions",
    tags: ["done", "success", "confirm"],
    description: "Confirmation mark for actions and success states.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4 4L19 7"/></svg>`
  },

  {
    id: "plus",
    name: "Plus",
    category: "Actions",
    tags: ["add", "create", "new"],
    description: "Universal add action with balanced geometry.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`
  },

  {
    id: "edit",
    name: "Edit",
    category: "Actions",
    tags: ["write", "modify", "pencil"],
    description: "Compact edit mark for content and settings.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18l.6-3.2L15.8 5.6a1.8 1.8 0 012.6 2.6L9.2 17.4 6 18z"/><path d="M14.5 6.9l2.6 2.6"/></svg>`
  },

  {
    id: "trash",
    name: "Delete",
    category: "Actions",
    tags: ["remove", "trash", "delete"],
    description: "Restrained delete icon for destructive controls.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 7h13M9 7V4.5h6V7M7.5 7l1 13h7l1-13M10 10.5v6M14 10.5v6"/></svg>`
  },

  {
    id: "download",
    name: "Download",
    category: "Files",
    tags: ["save", "export", "download"],
    description: "Download action for digital asset files.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10"/><path d="M8.5 10.5L12 14l3.5-3.5"/><path d="M5 19.5h14"/></svg>`
  },

  {
    id: "upload",
    name: "Upload",
    category: "Files",
    tags: ["import", "upload", "send"],
    description: "Upload action for bringing files into a project.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M8.5 13.5L12 10l3.5 3.5"/><path d="M5 4.5h14"/></svg>`
  },

  {
    id: "file",
    name: "File",
    category: "Files",
    tags: ["document", "page", "file"],
    description: "Minimal document symbol for file interfaces.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h7l3 3V20.5H7z"/><path d="M14 3.5v4h3M9.5 12h5M9.5 15.5h5"/></svg>`
  },

  {
    id: "folder",
    name: "Folder",
    category: "Files",
    tags: ["directory", "collection", "folder"],
    description: "Folder outline for file groups and collections.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7.5h6l1.5 2H20v9H4z"/></svg>`
  },

  {
    id: "heart",
    name: "Favorite",
    category: "Users",
    tags: ["like", "saved", "favorite"],
    description: "Simple favorite control for saved assets.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.2-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.8-7 9-7 9z"/></svg>`
  },

  {
    id: "lock",
    name: "Lock",
    category: "Security",
    tags: ["private", "password", "secure"],
    description: "Security icon for protected account surfaces.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>`
  },

  {
    id: "eye",
    name: "Preview",
    category: "Actions",
    tags: ["view", "inspect", "preview"],
    description: "Preview control for inspecting assets before use.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5z"/><circle cx="12" cy="12" r="2.5"/></svg>`
  },

  {
    id: "mail",
    name: "Mail",
    category: "Communication",
    tags: ["email", "message", "mail"],
    description: "Minimal email icon for communication surfaces.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="6" width="15" height="12" rx="2"/><path d="M5.5 7.5l6.5 5 6.5-5"/></svg>`
  },

  {
    id: "bell",
    name: "Notification",
    category: "Communication",
    tags: ["alert", "notify", "bell"],
    description: "Notification bell for alerts and updates.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17h12l-1.4-2.3V10a4.6 4.6 0 00-9.2 0v4.7z"/><path d="M10 19a2.3 2.3 0 004 0"/></svg>`
  },

  {
    id: "shield",
    name: "Shield",
    category: "Security",
    tags: ["protect", "safe", "security"],
    description: "Security shield for privacy and protection concepts.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l7 2.8v5.1c0 4-2.4 7.4-7 9.1-4.6-1.7-7-5.1-7-9.1V6.3z"/><path d="M9 12l2 2 4-4"/></svg>`
  },

  {
    id: "arrow-right",
    name: "Arrow Right",
    category: "Navigation",
    tags: ["next", "forward", "arrow"],
    description: "Simple directional arrow for navigation and actions.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13"/><path d="M13 7l5 5-5 5"/></svg>`
  },

  {
    id: "arrow-left",
    name: "Arrow Left",
    category: "Navigation",
    tags: ["back", "previous", "arrow"],
    description: "Simple directional arrow for back navigation.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H6"/><path d="M11 7l-5 5 5 5"/></svg>`
  },

  {
    id: "more",
    name: "More",
    category: "System",
    tags: ["menu", "options", "more"],
    description: "Compact overflow control for secondary actions.",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>`
  },

  {
    id: "info",
    name: "Info",
    category: "System",
    tags: ["information", "help", "details"],
    description: "Information icon for contextual guidance and details.",
    pro: true,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 10.5v5"/><circle cx="12" cy="7.5" r="0.8" fill="currentColor" stroke="none"/></svg>`
  }
];
