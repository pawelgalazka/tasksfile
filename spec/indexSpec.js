var chalk = require('chalk');
var runjs = require('../index');

describe('index.js', function(){
    beforeEach(function(){
        spyOn(process.stdout, 'write');
    });

    describe('.call()', function(){
        beforeEach(function(){
            this.a = jasmine.createSpy('a');
            this.b = jasmine.createSpy('b');
            this.obj = {
                a: this.a,
                b: this.b
            }
        });

        it('should call method with given name on given object', function(){
            runjs.call(this.obj, ['a']);
            expect(this.a).toHaveBeenCalled();
        });

        it('should call method with given name on given object with given arguments', function(){
            runjs.call(this.obj, ['b', '1', '2']);
            expect(this.b).toHaveBeenCalledWith('1', '2');
        });

        it('should print list of all methods available in object if method name not given', function(){
            runjs.call(this.obj, []);
            expect(process.stdout.write.calls.allArgs()).toEqual([['Available tasks:\n'], ['a\n'], ['b\n']]);
        });

        it('should print error message if method not exist on given object', function(){
            runjs.call(this.obj, ['abc']);
            expect(process.stdout.write.calls.allArgs()).toEqual([[chalk.red('Task abc not found') + '\n']]);
        });
    });

    xdescribe('.run()', function(){
        beforeEach(function(){

        });

        it('should run command through execSync with PATH adjustment for node_modules/.bin', function(){
            runjs.run('ls');
            expect(this.execSync).toHaveBeenCalledWith('PATH=$PATH:./node_modules/.bin/ ls', {stdio: 'inherit'});
        });

        it('should print given command with arguments', function(){

        });
    });
});