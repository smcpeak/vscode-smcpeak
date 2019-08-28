/** text-utils.ts
  * Miscellaneous text-related utilities. */


/** Return a string obtained by terminating all of the given strings
  * with 'suffix' and concatenating the result. */
export function joinWithSuffix(strs: string[], suffix: string) : string
{
  return strs.map((s) => s + suffix).join("");
}

/** Concatenate each string with 'prefix' and 'suffix' and join the
  * result into one string. */
export function joinWithPreSuffix(strs: string[], prefix: string,
  suffix: string) : string
{
  return strs.map((s) => prefix + s + suffix).join("");
}
