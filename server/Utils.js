// Source for merge and flatten
// https://coderwall.com/p/w22s0w/recursive-merge-flatten-objects-in-plain-old-vanilla-javascript

// Give this function an array of objects and it will merge them into one.
function _merge(objects){
  var out = {};

  for (var i = 0; i < objects.length; i++) {
    for (var p in objects[i]) {
      out[p] = objects[i][p];
    }
  }

  return out;
};

// Give this function a nested object and it will make it single-level
export const flatten = (obj, name, stem) => {
  let out = {};
  const newStem = (typeof stem !== 'undefined' && stem !== '') ? stem + '_' + name : name;

  if (typeof obj !== 'object') {
    out[newStem] = obj;
    return out;
  }

  for (let p in obj) {
    let prop = flatten(obj[p], p, newStem);
    out = _merge([out, prop]);
  }

  return out;
};
