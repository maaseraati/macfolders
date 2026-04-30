/**
 * SVG path data for the macOS Big Sur+ style folder.
 * Designed in a 1024x1024 viewport. Two halves: back (with the tab) and front.
 * Coordinates are tuned to overlap so the folder looks like a single object,
 * with content layers sandwiched between the two paths.
 */

export const FOLDER_VIEWBOX = 1024;
export const STAGE_SIZE = 1024;

// Back half: full silhouette with the tab on the left.
export const FOLDER_BACK_PATH = [
  "M 132 232",
  "Q 132 196 168 196",
  "L 384 196",
  "Q 408 196 424 212",
  "L 472 260",
  "Q 488 276 512 276",
  "L 856 276",
  "Q 892 276 892 312",
  "L 892 408",
  "L 132 408",
  "Z",
].join(" ");

// Front half: the lower body that overlaps the back. Has a slight bow to the
// top edge so it reads like a real Finder folder.
export const FOLDER_FRONT_PATH = [
  "M 92 408",
  "Q 92 372 128 372",
  "L 896 372",
  "Q 932 372 932 408",
  "L 932 808",
  "Q 932 868 872 868",
  "L 152 868",
  "Q 92 868 92 808",
  "Z",
].join(" ");

// Subtle inner highlight along the top of the front body.
export const FOLDER_FRONT_HIGHLIGHT = [
  "M 100 406",
  "Q 100 384 124 384",
  "L 900 384",
  "Q 924 384 924 406",
].join(" ");

// Inset rim used for inner shadow on the inside of the folder pocket.
export const FOLDER_INSIDE_SHADOW = [
  "M 92 412",
  "L 932 412",
  "L 932 460",
  "L 92 460",
  "Z",
].join(" ");
