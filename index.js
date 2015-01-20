var fs = require("fs"),
    path = require("path"),
    mkdirp = require("mkdirp"),
    Writer = require("broccoli-writer"),
    Promise = require("rsvp").Promise;

Flatiron.prototype = Object.create(Writer.prototype);
Flatiron.prototype.constructor = Flatiron;

function Flatiron (inputTree, options) {
  if (!(this instanceof Flatiron)) return new Flatiron(inputTree, options);

  this.inputTree = inputTree;
  this.options = options;
}

Flatiron.prototype.write = function (readTree, destDir) {
  var _this = this;

  return readTree(this.inputTree).then(function(srcDir) {
    var obj = readDirectory(srcDir),
        output;

    function readDirectory (srcDir) {
      var obj = {},
          entries = fs.readdirSync(srcDir);

      Array.prototype.forEach.call(entries, function(entry) {
        if (fs.lstatSync(path.join(srcDir, entry)).isDirectory())
          obj[entry] = readDirectory(path.join(srcDir, entry));
        else
          obj[entry.split(".")[0]] = JSON.parse(fs.readFileSync(path.join(srcDir, entry)));
      });

      return obj;
    }

    output = [_this.options.variableName, JSON.stringify(obj, null, 2)];

    mkdirp.sync(path.join(destDir, path.dirname(_this.options.outputFile)));
    fs.writeFileSync(path.join(destDir, _this.options.outputFile), output.join(" = "));
  });
}

module.exports = Flatiron;
