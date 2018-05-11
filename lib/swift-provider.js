'use babel';
import {BufferedProcess} from 'atom'

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
    const {editor, bufferPosition, prefix} = options;

    // getting the prefix on our own instead of using the one Atom provides
    const text = editor.getText()
    const index = editor.getBuffer().characterIndexForPosition(bufferPosition)
    const replacementPrefix = prefix.substr(0, 1) === '.' ? prefix.substr(1) : prefix
    console.debug("prefix:" + prefix)
    console.debug("rep:" + replacementPrefix)
    console.debug("position:" + bufferPosition)
    console.debug("index:" + index)
    return this.findMatchingSuggestions(text, index, replacementPrefix);
  }

  findMatchingSuggestions(text, index, replacementPrefix) {
    // using a Promise lets you fetch and return suggestions asynchronously
    // this is useful for hitting an external API without causing Atom to freeze
    return new Promise((resolve) => {
      const command = 'sourcekitten'
      const args = [ 'complete', '--text', text, '--offset', index ]
      let output = ""
      let stdout = function(text) {
        output += text
      }
      let exit = function(code) {
        if (code == 0) {
          let suggestions = JSON.parse(output)
          console.debug(suggestions.map(function (x) { return x.name }))
          let inflatedSuggestions = suggestions.map(function(suggestion) {
            return {
              displayText: suggestion.descriptionKey,
              description: suggestion.docBrief,
              name: suggestion.name,
              text: replacementPrefix + suggestion.sourcetext,
              type: suggestion.typeName,
              replacementPrefix: replacementPrefix
            }
          });
          console.debug(suggestions)
          resolve(inflatedSuggestions);
        } else {
          resolve([])
        }
      }

      this.process = new BufferedProcess({command, args, stdout, exit})
    });
  }


  onDidInsertSuggestion(options) {
    atom.notifications.addSuccess(options.suggestion.displayText +
                                  ' was inserted.');
  }
}
export default new SwiftProvider();
