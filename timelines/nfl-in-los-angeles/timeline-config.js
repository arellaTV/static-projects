var kpccTimelineConfig = {
    // choose spreadsheet or flat-file
    dataSource: "spreadsheet",

    // example spreadsheet key
    key: "1UK1oCe5HVKMCBjMFl_cO0HcJjEgmK8HseR3aYfjHnD8",

    // example path to data file
    sourceFile: "timeline-data.json",

    // example path to meta file
    metaFile: "timeline-meta.json",

    // name of sheet containing timeline entries
    sheetName: "Posts",

    // name of sheet containing timeline meta
    sheetMeta: "MetaData",

    // make the timeline embeddable
    embedThis: true,

    // url of the timeline
    projectDirectory: "http://projects.scpr.org/timelines/nfl-in-los-angeles/",

    // newest or oldest
    defaultDirection: "newest",

    // collapsed or expanded
    defaultExpansion: "expanded",

    // display social sharing links
    sharing: true,

    // groupSegmentByYear or groupSegmentByDecade
    groupFunction: "groupSegmentByYear",

    // adjust timeline width
    width: "90%"
};