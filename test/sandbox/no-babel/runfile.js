let task = {};

task['echo'] = (...args) => {
  console.log('echo ' + args.join(' '))
};

export default task;
