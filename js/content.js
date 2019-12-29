(function() {
  // keep track of the extension status
  var active;

  // check the extension status
  chrome.runtime.sendMessage({ type: "EXTENSION_STATUS" }, function(res) {
    active = res.active;
  });

  // handle extension status change
  chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    if (req.type == "EXTENSION_STATUS_UPDATE") {
      active = req.active;
    }
  });

  //mapped to German umlaut characters
  var keyCodes = {
    A: "\u00c4",
    O: "\u00d6",
    U: "\u00dc",
    S: "\u00df",
    a: "\u00e4",
    o: "\u00f6",
    u: "\u00fc"
  };

  // event handler for keydown
  function handleKeyDown(e) {
    try {
      var input = getCharCode(e);

      // stop handling when inactive
      if (!active) return;

      if (input == "e" || input.toLocaleLowerCase() == "s") {
        var target = e.target,
          isEditable = target.contentEditable == "true",
          prevChar = getPrevChar(target, isEditable),
          key = keyCodes[prevChar];

        // exclude invalid combinations and when following a diphthong
        if (
          (input.toLocaleLowerCase() == "s" && prevChar != "S") ||
          (input == "e" && prevChar == "S") ||
          followDiphthong(target, isEditable)
        )
          return;

        //process further for valid characters
        if (key) {
          e.preventDefault();
          insertTo(target, key);
        }
      }
    } catch (error) {
      console.log("Unhandled error: ", error);
    }
  }

  // replace previous characters with Umlaut character
  function insertTo(target, key, isEditable) {
    if (isEditable) {
    } else {
      var start = target.selectionStart,
        end = target.selectionEnd,
        val = target.value;
      target.value =
        val.substring(0, start - 1) + key + val.substring(end, val.length);
      target.selectionStart = start;
      target.selectionEnd = end;
    }
  }

  // follow diphthong: au | eu | äu
  function followDiphthong(target, isEditable) {
    var text = target.value,
      pos = target.selectionStart;

    if (isEditable) {
      target.focus();
      var origRange = document.getSelection().getRangeAt(0),
        range = origRange.cloneRange();
      range.selectNodeContents(target);
      range.setEnd(origRange.endContainer, origRange.endOffset);
      pos = range.toString().length;
    }

    if (pos < 2) return false;

    var prev2 = text.slice(pos - 2, pos);
    return prev2 == "au" || prev2 == "eu" || prev2 == "äu";
  }

  // get previous character from the cursor
  function getPrevChar(target, isEditable) {
    var text = target.value,
      pos = target.selectionStart;

    if (isEditable) {
      target.focus();
      var origRange = document.getSelection().getRangeAt(0),
        range = origRange.cloneRange();
      range.selectNodeContents(target);
      range.setEnd(origRange.endContainer, origRange.endOffset);
      pos = range.toString().length;
    }

    return text.slice(pos - 1, pos);
  }

  // determine the input character
  function getCharCode(e) {
    var input;

    if (e.key !== undefined) {
      input = e.key;
    } else {
      input = String.fromCharCode(e.keyCode);

      if (!e.shiftKey) {
        input = input.toLocaleLowerCase();
      }
    }
    return input;
  }

  // handle keydown event
  document.addEventListener("keydown", handleKeyDown, true);
})();
