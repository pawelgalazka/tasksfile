'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.call = call;
exports.run = run;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function call(obj, args) {
    var cons = arguments.length <= 2 || arguments[2] === undefined ? console : arguments[2];

    var taskName = args[0];
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
            cons.log(_chalk2['default'].blue('Running "' + t + '"...'));
            task.apply(null, arguments);
            time = ((Date.now() - time) / 1000).toFixed(2);
            cons.log(_chalk2['default'].blue('Finished "' + t + '" in', time, 'sec'));
        };
    });

    var task = obj[taskName];
    if (task) {
        obj[taskName].apply(null, args.slice(1));
    } else {
        cons.log(_chalk2['default'].red("Task " + taskName + " not found"));
    }
}

function run(cmd, options) {
    options = options || {};
    options.stdio = options.stdio || 'inherit';
    console.log(_chalk2['default'].bold(cmd));
    cmd = 'PATH=$PATH:' + process.cwd() + '/node_modules/.bin/ ' + cmd;
    if (options.async) {
        var child = _child_process2['default'].exec(cmd, options);
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        return child;
    }
    return _child_process2['default'].execSync(cmd, options);
}
