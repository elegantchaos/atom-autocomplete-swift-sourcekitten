'use babel';
const child_process = require('child_process');

class SwiftProvider {
  constructor() {
    // offer suggestions only when editing swift files
    this.selector = '.source.swift';

    // except when editing a comment
    this.disableForSelector = '.comment';

    // make these suggestions appear above default suggestions
    this.suggestionPriority = 2;
  }

  getSuggestions(options) {
    const {editor, bufferPosition} = options;

    // getting the prefix on our own instead of using the one Atom provides
    const text = editor.getText()
    const index = editor.getBuffer().characterIndexForPosition(bufferPosition)
    return this.findMatchingSuggestions(text, index);
  }

  findMatchingSuggestions(text, index) {
    // using a Promise lets you fetch and return suggestions asynchronously
    // this is useful for hitting an external API without causing Atom to freeze
    return new Promise((resolve) => {
      let result = child_process.spawnSync('/home/sam/.local/bin/sourcekitten', [ 'complete', '--text', text, '--offset', index ]);
      let output = result.stdout.toString();
      let suggestions = JSON.parse(output)
      let inflatedSuggestions = suggestions.map(this.inflateSuggestion);
      resolve(inflatedSuggestions);
    });
  }

  // clones a suggestion object to a new object with some shared additions
  // cloning also fixes an issue where selecting a suggestion won't insert it
  inflateSuggestion(suggestion) {
    return {
      description : suggestion.descriptionKey,
      text : suggestion.sourcetext
      // description : suggestion.description,
      // replacementPrefix :
      //     replacementPrefix, // ensures entire prefix is replaced
      // iconHTML : '<i class="icon-comment"></i>',
      // type : 'snippet',
      // rightLabelHTML :
      //     '<span class="aab-right-label">Snippet</span>' // look in
      //                                                    // /styles/atom-slds.less
    };
  }

  onDidInsertSuggestion(options) {
    atom.notifications.addSuccess(options.suggestion.displayText +
                                  ' was inserted.');
  }
}
export default new SwiftProvider();
