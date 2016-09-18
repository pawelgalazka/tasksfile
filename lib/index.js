'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.call = call;
exports.run = run;
exports.generate = generate;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function call(obj, args) {
    var cons = arguments.length <= 2 || arguments[2] === undefined ? console : arguments[2];

    var taskName = args[0];

    if (obj.default) {
        obj = obj.default;
    }

    if (!taskName) {
        cons.log('Available tasks:');
        Object.keys(obj).forEach(function (t) {
            cons.log(t);
        });
        return;
    }

    Object.keys(obj).forEach(function (t) {
        var task = obj[t];
        obj[t] = function () {
            var time = Date.now();
            cons.log(_chalk2.default.blue('Running "' + t + '"...'));
            task.apply(null, arguments);
            time = ((Date.now() - time) / 1000).toFixed(2);
            cons.log(_chalk2.default.blue('Finished "' + t + '" in', time, 'sec'));
        };
    });

    var task = obj[taskName];
    if (task) {
        obj[taskName].apply(null, args.slice(1));
    } else {
        cons.log(_chalk2.default.red("Task " + taskName + " not found"));
    }
}

function run(cmd) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    options.env = options.env || process.env;
    var envPath = options.env.PATH ? options.env.PATH : process.env.PATH;

    options.env.PATH = [process.cwd() + '/node_modules/.bin/', envPath].join(_path2.default.delimiter);

    options.stdio = options.stdio || 'inherit';
    options.shell = true;
    console.log(_chalk2.default.bold(cmd));
    if (options.async) {
        return _child_process2.default.spawn(cmd, options);
    }
    return _child_process2.default.execSync(cmd, options);
}

function generate(src, dst, context) {
    console.log('Generating ' + dst + ' from template ' + src);
    var template = _fs2.default.readFileSync(src);
    var content = _lodash2.default.template(template)(context);
    _fs2.default.writeFileSync(dst, content);
}