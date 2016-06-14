let task = {};

task['echo'] = () => {
  console.log('echo ' + Array.prototype.slice.call(arguments, 0).join(' '))
};

export default task;
