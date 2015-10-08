jest.dontMock('../lib/index');

var runjs = require('../lib/index');
var chalk = require('chalk');

describe('index.js', function(){
    describe('.call()', function(){
        beforeEach(function(){
            this.a = jest.genMockFn();
            this.b = jest.genMockFn();
            this.obj = {
                a: this.a,
                b: this.b
            };
            this.console = {
                log: jest.genMockFn()
            };
        });

        it('should call method with given name on given object', function(){
            runjs.call(this.obj, ['a'], this.console);
            expect(this.a).toBeCalled();
        });

        it('should call method with given name on given object with given arguments', function(){
            runjs.call(this.obj, ['b', '1', '2'], this.console);
            expect(this.b).toBeCalledWith('1', '2');
        });

        it('should print list of all methods available in object if method name not given', function(){
            runjs.call(this.obj, [], this.console);
            expect(this.console.log.mock.calls).toEqual([['Available tasks:'], ['a'], ['b']]);
        });

        it('should print error message if method not exist on given object', function(){
            runjs.call(this.obj, ['abc'], this.console);
            expect(this.console.log.mock.calls).toEqual([[chalk.red('Task abc not found')]]);
        });
    });
});