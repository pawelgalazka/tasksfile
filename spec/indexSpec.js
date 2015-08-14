var runjs = require('../index');

describe('index.js', function(){
    beforeEach(function(){
        spyOn(process.stdout, 'write');
    });

    describe('.call()', function(){
        var obj;

        beforeEach(function(){
            obj = {
                a: jasmine.createSpy('a'),
                b: jasmine.createSpy('b')
            }
        });

        it('should call method with given name on given object', function(){

        });

        it('should call method with given name on given object with given arguments', function(){

        });

        it('should print list of all methods available in object if method name not given', function(){
            //runjs.call(obj, []);
            //expect(process.stdout.write).toHaveBeenCalledWith('Available tasks:\n', 'a\n', 'b\n');
        });

        it('should print error message if method not exist on given object', function(){

        });
    });

    describe('.run()', function(){
        it('should run command through execSync with PATH adjustment for node_modules/.bin', function(){

        });

        it('should print given command with arguments', function(){

        });
    });
});