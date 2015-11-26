import * as runjs from '../lib/index';
import chalk from 'chalk';
import {expect, spy} from 'mochaccino';


describe('index.js', function(){
    describe('.call()', function(){
        beforeEach(function(){
            this.a = spy();
            this.b = spy();
            this.obj = {
                a: this.a,
                b: this.b
            };
            this.console = {
                log: spy()
            };
        });

        it('should call method with given name on given object', function(){
            runjs.call(this.obj, ['a'], this.console);
            expect(this.a).toHaveBeenCalled();
        });

        it('should call method with given name on given object with given arguments', function(){
            runjs.call(this.obj, ['b', '1', '2'], this.console);
            expect(this.b).toHaveBeenCalledWith('1', '2');
        });

        it('should print list of all methods available in object if method name not given', function(){
            runjs.call(this.obj, [], this.console);
            expect(this.console.log).toHaveBeenCalledTimes(3);
            expect(this.console.log).toHaveBeenCalledWith('Available tasks:');
            expect(this.console.log).toHaveBeenCalledWith('a');
            expect(this.console.log).toHaveBeenCalledWith('b');
        });

        it('should print error message if method not exist on given object', function(){
            runjs.call(this.obj, ['abc'], this.console);
            expect(this.console.log).toHaveBeenCalledTimes(1);
            expect(this.console.log).toHaveBeenCalledWith(chalk.red('Task abc not found'));
        });
    });
});