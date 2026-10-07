/*
=========================================================
UASSET — API ENTRY

Every /api/* request is rewritten here by vercel.json.
The real route table lives in ./[...route].js.
=========================================================
*/

export {
  default,
  config
} from "./[...route].js";
