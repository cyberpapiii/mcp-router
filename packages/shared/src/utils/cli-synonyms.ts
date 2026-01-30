/**
 * CLI synonym dictionary for expanding search queries.
 * Maps common terms to their synonyms/aliases used in CLI tools.
 */
export const CLI_SYNONYMS: Record<string, string[]> = {
  // File operations
  delete: ['remove', 'rm', 'trash', 'erase', 'unlink', 'del'],
  list: ['ls', 'show', 'display', 'enumerate', 'dir', 'll'],
  create: ['make', 'new', 'add', 'init', 'touch', 'mkdir', 'mkfile'],
  read: ['get', 'cat', 'view', 'show', 'display', 'fetch', 'load'],
  write: ['put', 'set', 'save', 'store', 'update', 'echo', 'output'],
  copy: ['cp', 'duplicate', 'clone', 'replicate'],
  move: ['mv', 'rename', 'relocate', 'transfer'],

  // Search/find
  find: ['search', 'locate', 'grep', 'query', 'lookup', 'seek'],
  filter: ['grep', 'select', 'match', 'where'],

  // Execution
  execute: ['run', 'exec', 'invoke', 'call', 'start', 'launch'],
  stop: ['kill', 'terminate', 'halt', 'end', 'quit', 'exit'],

  // Git operations
  commit: ['save', 'checkpoint', 'snapshot'],
  push: ['upload', 'sync', 'publish', 'deploy'],
  pull: ['download', 'fetch', 'sync', 'update'],
  branch: ['fork', 'diverge'],
  merge: ['combine', 'join', 'integrate'],
  diff: ['compare', 'changes', 'delta'],
  status: ['state', 'info', 'check'],

  // Navigation
  navigate: ['cd', 'go', 'change', 'switch'],
  back: ['previous', 'return', 'undo'],

  // Info/help
  info: ['about', 'details', 'describe', 'status', 'stat'],
  help: ['usage', 'manual', 'docs', 'guide', 'man'],

  // Common verbs
  open: ['launch', 'start', 'load', 'access'],
  close: ['quit', 'exit', 'end', 'shutdown'],
  edit: ['modify', 'change', 'update', 'alter'],
  check: ['verify', 'validate', 'test', 'inspect'],

  // Messaging/communication
  send: ['post', 'message', 'notify', 'transmit'],
  receive: ['get', 'fetch', 'retrieve', 'pull'],

  // Calendar/scheduling
  schedule: ['book', 'plan', 'calendar', 'event'],
  meeting: ['event', 'appointment', 'call'],
};

/**
 * Expand a query string with CLI synonyms.
 * @param query - Original search query
 * @param customSynonyms - Optional custom synonym mappings to merge
 * @returns Expanded query with synonyms
 */
export function expandQueryWithSynonyms(
  query: string,
  customSynonyms?: Record<string, string[]>
): string {
  const synonyms = customSynonyms
    ? { ...CLI_SYNONYMS, ...customSynonyms }
    : CLI_SYNONYMS;

  const terms = query.toLowerCase().split(/\s+/);
  const expanded = terms.flatMap(term => {
    // Check if this term is a key in synonyms
    const directSynonyms = synonyms[term] || [];

    // Also check if this term appears as a synonym value
    const reverseSynonyms: string[] = [];
    for (const [key, values] of Object.entries(synonyms)) {
      if (values.includes(term) && key !== term) {
        reverseSynonyms.push(key);
      }
    }

    return [term, ...directSynonyms, ...reverseSynonyms];
  });

  return [...new Set(expanded)].join(' ');
}

/**
 * Get all synonyms for a term (bidirectional lookup).
 */
export function getSynonymsFor(term: string): string[] {
  const lowerTerm = term.toLowerCase();
  const result = new Set<string>();

  // Direct lookup
  if (CLI_SYNONYMS[lowerTerm]) {
    CLI_SYNONYMS[lowerTerm].forEach(s => result.add(s));
  }

  // Reverse lookup
  for (const [key, values] of Object.entries(CLI_SYNONYMS)) {
    if (values.includes(lowerTerm)) {
      result.add(key);
      values.forEach(s => result.add(s));
    }
  }

  result.delete(lowerTerm); // Don't include the original term
  return Array.from(result);
}
